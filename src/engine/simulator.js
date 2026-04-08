/**
 * CrisisSimulator - Main simulation engine
 * Manages patient generation, allocation, and crisis state
 */

import KnapsackSolver from '../algorithms/knapsack.js';
import TransferOptimizer from '../algorithms/transferOptimizer.js';

export class CrisisSimulator {
  constructor() {
    this.hospitals = [
      {
        id: 0,
        name: 'City Hospital',
        type: 'Trauma Center',
        icuTotal: 10,
        ventTotal: 6,
        medTotal: 200,
        specialistTotal: 8,
        icuUsed: 0,
        ventUsed: 0,
        medUsed: 0,
        specialistUsed: 0,
        patients: [],
        dpTable: null,
        backtrackPath: []
      },
      {
        id: 1,
        name: 'District Hospital',
        type: 'District',
        icuTotal: 7,
        ventTotal: 4,
        medTotal: 150,
        specialistTotal: 6,
        icuUsed: 0,
        ventUsed: 0,
        medUsed: 0,
        specialistUsed: 0,
        patients: [],
        dpTable: null,
        backtrackPath: []
      },
      {
        id: 2,
        name: 'Rural Clinic',
        type: 'Rural',
        icuTotal: 4,
        ventTotal: 2,
        medTotal: 80,
        specialistTotal: 3,
        icuUsed: 0,
        ventUsed: 0,
        medUsed: 0,
        specialistUsed: 0,
        patients: [],
        dpTable: null,
        backtrackPath: []
      }
    ];

    // Distance matrix (kilometers) between hospitals
    // Index mapping: 0=City, 1=District, 2=Rural
    this.distanceMatrix = [
      [0, 12, 28],
      [12, 0, 18],
      [28, 18, 0]
    ];

    this.hospitalNames = [
      'City Hospital',
      'District Hospital',
      'Rural Clinic'
    ];

    this.arrivalFeed = [];
    this.isRunning = false;
    this.intervalId = null;
    this.speedMultiplier = 1;
    this.patientCounter = 0;
    this.stats = {
      livesSaved: 0,
      patientsDeferred: 0,
      transfersMade: 0,
      patientsBumped: 0,
      totalArrived: 0
    };

    this.callbacks = [];
    this.scaler = null;
    this.model = null;
  }

  /**
   * Initialize ONNX model and scaler
   */
  async initialize() {
    try {
      const ort = await import('onnxruntime-web');

      // Load model
      const modelResp = await fetch('/autotriage_model.onnx');
      const modelBuffer = await modelResp.arrayBuffer();
      this.model = await ort.InferenceSession.create(modelBuffer);

      // Load scaler
      const scalerResp = await fetch('/autotriage_scaler.json');
      this.scaler = await scalerResp.json();

      console.log('✓ CrisisSimulator initialized with AutoTriage model');
    } catch (error) {
      console.error('Failed to initialize simulator:', error);
    }
  }

  /**
   * Register callback for state updates
   */
  onUpdate(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Emit state to all listeners
   */
  emitUpdate() {
    const state = this.getState();
    this.callbacks.forEach(cb => {
      try {
        cb(state);
      } catch (error) {
        console.error('Callback error:', error);
      }
    });
  }

  /**
   * Generate random patient with AutoTriage prediction
   */
  async generatePatient() {
    this.patientCounter += 1;

    // Random vitals
    const age = Math.round(Math.random() * 72 + 18);
    const systolic_bp = Math.round(Math.random() * 120 + 60);
    const spo2 = Math.round(Math.random() * 30 + 70);
    const heart_rate = Math.round(Math.random() * 140 + 40);
    const temperature = Math.round((Math.random() * 7 + 35) * 10) / 10;

    // Condition distribution: more moderate patients
    const rand = Math.random();
    const condition = rand < 0.6 ? 0 : rand < 0.85 ? 1 : 2;

    // Get AutoTriage prediction
    let survivalScore = 5;
    let confidence = 0;

    if (this.model && this.scaler) {
      try {
        const inputs = [
          [age, systolic_bp, spo2, heart_rate, temperature, condition]
        ];

        // Normalize
        const normalized = inputs.map(row =>
          row.map((val, idx) => (val - this.scaler.mean[idx]) / this.scaler.scale[idx])
        );

        // Run inference
        const ort = await import('onnxruntime-web');
        const tensor = new ort.Tensor('float32', normalized.flat(), [1, 6]);
        const feeds = { float_input: tensor };
        const results = await this.model.run(feeds);

        // Get prediction
        const predictions = results[Object.keys(results)[0]].data;
        const predictedLabel = Array.from(predictions).indexOf(
          Math.max(...Array.from(predictions))
        );
        survivalScore = Math.min(10, Math.max(1, predictedLabel + 1));
        confidence = Math.round(
          (Math.max(...Array.from(predictions)) / Array.from(predictions).reduce((a, b) => a + b)) * 100
        );
      } catch (error) {
        console.warn('AutoTriage inference failed, using default:', error);
        survivalScore = 5 + Math.random() * 4;
        confidence = 60;
      }
    } else {
      survivalScore = 5 + Math.random() * 4;
      confidence = 60;
    }

    // Determine resource needs
    const icuNeed = condition >= 1;
    const ventNeed = condition >= 2;
    const medNeed = Math.round(condition * 10 + Math.random() * 20 + 10);
    const specialistNeed = condition + 1;

    const patient = {
      id: `P-${String(this.patientCounter).padStart(5, '0')}`,
      age,
      systolic_bp,
      spo2,
      heart_rate,
      temperature,
      condition: condition === 0 ? 'Moderate' : condition === 1 ? 'Severe' : 'Critical',
      conditionCode: condition,
      survivalScore: Math.round(survivalScore * 10) / 10,
      confidence,
      icuNeed,
      ventNeed,
      medNeed,
      specialistNeed,
      assignedHospital: null,
      status: null,
      transferPath: null,
      timestamp: new Date(),
      originalScore: Math.round(survivalScore * 10) / 10
    };

    return patient;
  }

  /**
   * Allocate patient to hospital using knapsack
   */
  allocatePatient(patient, hospitalIdx = 0) {
    const hospital = this.hospitals[hospitalIdx];

    // Create list of all patients including new one for knapsack
    const allPatients = [...hospital.patients, patient];

    // Solve knapsack
    const capacity = {
      icuBeds: hospital.icuTotal,
      ventilators: hospital.ventTotal,
      medicines: hospital.medTotal,
      specialistHours: hospital.specialistTotal
    };

    const solution = KnapsackSolver.solve(allPatients, capacity);

    // Check if new patient is in solution
    const wasSelected = solution.selectedPatients.some(p => p.id === patient.id);

    // Check if any existing patients were bumped
    const bumpedPatients = hospital.patients.filter(
      p => !solution.selectedPatients.some(sp => sp.id === p.id)
    );

    // Update hospital state
    if (wasSelected) {
      hospital.patients = solution.selectedPatients;
      hospital.dpTable = solution.dpTable;
      hospital.backtrackPath = solution.backtrackPath;

      // Recalculate resource usage
      hospital.icuUsed = solution.selectedPatients.reduce(
        (sum, p) => sum + (p.icuNeed ? 1 : 0),
        0
      );
      hospital.ventUsed = solution.selectedPatients.reduce(
        (sum, p) => sum + (p.ventNeed ? 1 : 0),
        0
      );
      hospital.medUsed = solution.selectedPatients.reduce(
        (sum, p) => sum + (p.medNeed || 0),
        0
      );
      hospital.specialistUsed = solution.selectedPatients.reduce(
        (sum, p) => sum + (p.specialistNeed || 0),
        0
      );

      patient.assignedHospital = hospitalIdx;
      patient.status = 'allocated';

      this.stats.livesSaved = this.hospitals.reduce(
        (sum, h) =>
          sum +
          h.patients.reduce((psum, p) => psum + (p.survivalScore || 0), 0),
        0
      );

      this.stats.patientsBumped += bumpedPatients.length;

      return {
        allocated: true,
        patient,
        bumpedPatients,
        hospitalIdx
      };
    } else {
      // Revert to previous state if new patient wasn't selected
      return {
        allocated: false,
        patient,
        hospitalIdx
      };
    }
  }

  /**
   * Process incoming patient
   */
  processPatient(patient) {
    this.stats.totalArrived += 1;

    // Try City Hospital first
    let result = this.allocatePatient(patient, 0);

    if (!result.allocated) {
      // Try transfer optimization
      const transfer = TransferOptimizer.findBestTransfer(
        patient,
        0,
        this.hospitals,
        this.distanceMatrix,
        this.hospitalNames
      );

      if (transfer) {
        patient.survivalScore = transfer.adjustedScore;
        result = this.allocatePatient(patient, transfer.hospitalIdx);

        if (result.allocated) {
          patient.status = 'transferred';
          patient.transferPath = transfer.pathString;
          this.stats.transfersMade += 1;
        } else {
          patient.status = 'deferred';
          this.stats.patientsDeferred += 1;
        }
      } else {
        patient.status = 'deferred';
        this.stats.patientsDeferred += 1;
      }
    }

    // Add to arrival feed
    this.arrivalFeed.unshift(patient);
    if (this.arrivalFeed.length > 100) {
      this.arrivalFeed.pop();
    }

    return result;
  }

  /**
   * Start simulation
   */
  start(speedMultiplier = 1) {
    if (this.isRunning) return;

    this.speedMultiplier = speedMultiplier;
    this.isRunning = true;

    const generateAndProcess = async () => {
      const patient = await this.generatePatient();
      this.processPatient(patient);
      this.emitUpdate();
    };

    // Initial patient
    generateAndProcess();

    // Recurring patients
    this.intervalId = setInterval(() => {
      const delay = (Math.random() * 5000 + 3000) / this.speedMultiplier;
      setTimeout(() => {
        if (this.isRunning) {
          generateAndProcess();
        }
      }, delay);
    }, 3000 / this.speedMultiplier);
  }

  /**
   * Pause simulation
   */
  pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.emitUpdate();
  }

  /**
   * Reset simulation
   */
  reset() {
    this.pause();

    this.hospitals.forEach(h => {
      h.icuUsed = 0;
      h.ventUsed = 0;
      h.medUsed = 0;
      h.specialistUsed = 0;
      h.patients = [];
      h.dpTable = null;
      h.backtrackPath = [];
    });

    this.arrivalFeed = [];
    this.patientCounter = 0;
    this.stats = {
      livesSaved: 0,
      patientsDeferred: 0,
      transfersMade: 0,
      patientsBumped: 0,
      totalArrived: 0
    };

    this.emitUpdate();
  }

  /**
   * Manually add patient
   */
  async addPatientManual(patientData) {
    const patient = {
      ...patientData,
      id: `P-${String(++this.patientCounter).padStart(5, '0')}`,
      assignedHospital: null,
      status: null,
      transferPath: null,
      timestamp: new Date()
    };

    this.processPatient(patient);
    this.emitUpdate();
  }

  /**
   * Get current state
   */
  getState() {
    const efficiency = this.stats.totalArrived > 0
      ? Math.round(
          (this.stats.livesSaved /
            (this.stats.totalArrived * 10)) * 100
        )
      : 0;

    return {
      hospitals: this.hospitals.map(h => ({
        id: h.id,
        name: h.name,
        type: h.type,
        icuUsed: h.icuUsed,
        icuTotal: h.icuTotal,
        ventUsed: h.ventUsed,
        ventTotal: h.ventTotal,
        medUsed: h.medUsed,
        medTotal: h.medTotal,
        specialistUsed: h.specialistUsed,
        specialistTotal: h.specialistTotal,
        patients: h.patients,
        dpTable: h.dpTable,
        backtrackPath: h.backtrackPath
      })),
      arrivalFeed: this.arrivalFeed,
      stats: {
        livesSaved: Math.round(this.stats.livesSaved * 10) / 10,
        patientsDeferred: this.stats.patientsDeferred,
        transfersMade: this.stats.transfersMade,
        efficiency,
        totalArrived: this.stats.totalArrived,
        patientsBumped: this.stats.patientsBumped
      },
      isRunning: this.isRunning
    };
  }
}

export default CrisisSimulator;