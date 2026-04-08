/**
 * Transfer Optimizer
 * Determines optimal hospital transfer when current hospital is full
 */

import DijkstraSolver from './dijkstra.js';

export class TransferOptimizer {
  /**
   * Find best hospital to transfer patient to
   * @param {Object} patient - patient object with survivalScore
   * @param {number} sourceHospitalIdx - current hospital index
   * @param {Array} hospitalStates - array of hospital capacity objects
   * @param {Array<Array<number>>} distanceMatrix - 3x3 distance matrix
   * @param {Array<string>} hospitalNames - names for path display
   * @returns {Object} {bestHospitalIdx, transferPath, adjustedScore, penaltyKm} or null
   */
  static findBestTransfer(
    patient,
    sourceHospitalIdx,
    hospitalStates,
    distanceMatrix,
    hospitalNames = ['City Hospital', 'District Hospital', 'Rural Clinic']
  ) {
    // Use Dijkstra to find distances from source hospital
    const dijkstraResult = DijkstraSolver.findShortestPaths(
      distanceMatrix,
      sourceHospitalIdx
    );

    const candidates = [];

    // Check each other hospital
    for (let targetIdx = 0; targetIdx < hospitalStates.length; targetIdx++) {
      if (targetIdx === sourceHospitalIdx) continue;

      const targetHospital = hospitalStates[targetIdx];
      const distance = dijkstraResult.distances[targetIdx];
      const path = dijkstraResult.paths[targetIdx];

      // Check if target has capacity
      const hasICUCapacity = patient.icuNeed
        ? targetHospital.icuUsed < targetHospital.icuTotal
        : true;
      const hasVentCapacity = patient.ventNeed
        ? targetHospital.ventUsed < targetHospital.ventTotal
        : true;
      const hasMedCapacity =
        targetHospital.medUsed + (patient.medNeed || 0) <=
        targetHospital.medTotal;
      const hasSpecialistCapacity =
        targetHospital.specialistUsed + (patient.specialistNeed || 0) <=
        targetHospital.specialistTotal;

      const hasCapacity =
        hasICUCapacity &&
        hasVentCapacity &&
        hasMedCapacity &&
        hasSpecialistCapacity;

      if (hasCapacity && distance !== Infinity) {
        // Calculate transfer penalty: -1 point per 10km (rounded)
        const penaltyKm = Math.floor(distance / 10) * 10;
        const penaltyPoints = Math.ceil(distance / 10);
        const adjustedScore = Math.max(1, patient.survivalScore - penaltyPoints);

        candidates.push({
          hospitalIdx: targetIdx,
          hospitalName: hospitalNames[targetIdx],
          distance,
          penaltyKm,
          penaltyPoints,
          adjustedScore,
          path,
          pathString: DijkstraSolver.getPathString(path, hospitalNames)
        });
      }
    }

    // Sort by adjusted score (descending) then by distance (ascending)
    candidates.sort((a, b) => {
      if (b.adjustedScore !== a.adjustedScore) {
        return b.adjustedScore - a.adjustedScore;
      }
      return a.distance - b.distance;
    });

    if (candidates.length === 0) {
      return null; // No suitable hospital found
    }

    return candidates[0];
  }

  /**
   * Check if any hospital has capacity for patient
   */
  static hasAnyCapacity(patient, hospitalStates) {
    return hospitalStates.some(hospital => {
      const hasICUCapacity = patient.icuNeed
        ? hospital.icuUsed < hospital.icuTotal
        : true;
      const hasVentCapacity = patient.ventNeed
        ? hospital.ventUsed < hospital.ventTotal
        : true;
      const hasMedCapacity =
        hospital.medUsed + (patient.medNeed || 0) <= hospital.medTotal;
      const hasSpecialistCapacity =
        hospital.specialistUsed + (patient.specialistNeed || 0) <=
        hospital.specialistTotal;

      return (
        hasICUCapacity &&
        hasVentCapacity &&
        hasMedCapacity &&
        hasSpecialistCapacity
      );
    });
  }

  /**
   * Simulate bumping logic: if new patient has higher score,
   * can we bump an existing patient to make room?
   */
  static evaluateBump(
    newPatient,
    existingPatients,
    capacity,
    bumpThreshold = 0.2
  ) {
    // Find lowest-scoring patient that frees up needed resources
    let bumpCandidate = null;
    let maxScoreDifference = newPatient.survivalScore * bumpThreshold;

    for (const existingPatient of existingPatients) {
      const scoreDifference = newPatient.survivalScore - existingPatient.survivalScore;

      if (
        scoreDifference > maxScoreDifference &&
        (!bumpCandidate || existingPatient.survivalScore < bumpCandidate.survivalScore)
      ) {
        bumpCandidate = existingPatient;
        maxScoreDifference = scoreDifference;
      }
    }

    return bumpCandidate;
  }
}

export default TransferOptimizer;