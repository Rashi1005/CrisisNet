/**
 * 4-Dimensional 0/1 Knapsack Algorithm
 * 
 * PROBLEM:
 * Maximize total survival score of patients allocated to a hospital
 * Subject to constraints on 4 resources:
 *   - ICU beds (W1)
 *   - Ventilators (W2)
 *   - Medicines in units (W3)
 *   - Specialist hours (W4)
 * 
 * COMPLEXITY: O(n × W1 × W2 × W3 × W4)
 * where n = number of patients
 *
 * APPROACH:
 * Dynamic programming with 5D table:
 * dp[i][w1][w2][w3][w4] = max survival score using first i patients
 *                          with remaining capacities w1, w2, w3, w4
 */

export class KnapsackSolver {
  /**
   * Solve 4D knapsack problem
   * @param {Array} patients - Array of patient objects
   * @param {Object} capacity - Hospital capacity {icuBeds, ventilators, medicines, specialistHours}
   * @returns {Object} {selectedPatients, totalScore, dpTable, backtrackPath}
   */
  static solve(patients, capacity) {
    const n = patients.length;
    const W1 = capacity.icuBeds;
    const W2 = capacity.ventilators;
    const W3 = capacity.medicines;
    const W4 = capacity.specialistHours;

    // Handle edge cases
    if (n === 0 || W1 === 0 || W2 === 0 || W3 === 0 || W4 === 0) {
      return {
        selectedPatients: [],
        totalScore: 0,
        dpTable: null,
        backtrackPath: []
      };
    }

    // ========================================================================
    // PHASE 1: DP Table Construction
    // ========================================================================
    // dp[i][w1][w2][w3][w4] = {score, used}
    // Initialize 5D array
    const dp = Array(n + 1)
      .fill(null)
      .map(() =>
        Array(W1 + 1)
          .fill(null)
          .map(() =>
            Array(W2 + 1)
              .fill(null)
              .map(() =>
                Array(W3 + 1)
                  .fill(null)
                  .map(() =>
                    Array(W4 + 1).fill({ score: 0, used: false })
                  )
              )
          )
      );

    // Fill DP table
    for (let i = 1; i <= n; i++) {
      const patient = patients[i - 1];
      const icuNeed = patient.icuNeed ? 1 : 0;
      const ventNeed = patient.ventNeed ? 1 : 0;
      const medNeed = Math.ceil(patient.medNeed || 0);
      const specialistNeed = Math.ceil(patient.specialistNeed || 0);
      const survivalScore = patient.survivalScore || 0;

      for (let w1 = 0; w1 <= W1; w1++) {
        for (let w2 = 0; w2 <= W2; w2++) {
          for (let w3 = 0; w3 <= W3; w3++) {
            for (let w4 = 0; w4 <= W4; w4++) {
              // Option 1: Don't take patient i
              dp[i][w1][w2][w3][w4] = dp[i - 1][w1][w2][w3][w4];

              // Option 2: Take patient i (if capacity allows)
              if (
                w1 >= icuNeed &&
                w2 >= ventNeed &&
                w3 >= medNeed &&
                w4 >= specialistNeed
              ) {
                const prevScore =
                  dp[i - 1][w1 - icuNeed][w2 - ventNeed][w3 - medNeed][
                    w4 - specialistNeed
                  ].score;
                const newScore = prevScore + survivalScore;

                if (newScore > dp[i][w1][w2][w3][w4].score) {
                  dp[i][w1][w2][w3][w4] = {
                    score: newScore,
                    used: true
                  };
                }
              }
            }
          }
        }
      }
    }

    // ========================================================================
    // PHASE 2: Backtracking to find selected patients
    // ========================================================================
    const selectedPatients = [];
    let w1 = W1;
    let w2 = W2;
    let w3 = W3;
    let w4 = W4;

    for (let i = n; i > 0; i--) {
      if (
        dp[i][w1][w2][w3][w4].score !==
        dp[i - 1][w1][w2][w3][w4].score
      ) {
        // Patient i was selected
        const patient = patients[i - 1];
        selectedPatients.push({
          ...patient,
          patientIndex: i - 1,
          icuUsed: patient.icuNeed ? 1 : 0,
          ventUsed: patient.ventNeed ? 1 : 0,
          medUsed: Math.ceil(patient.medNeed || 0),
          specialistUsed: Math.ceil(patient.specialistNeed || 0)
        });

        // Update remaining capacity
        w1 -= patient.icuNeed ? 1 : 0;
        w2 -= patient.ventNeed ? 1 : 0;
        w3 -= Math.ceil(patient.medNeed || 0);
        w4 -= Math.ceil(patient.specialistNeed || 0);
      }
    }

    selectedPatients.reverse();
    const totalScore = dp[n][W1][W2][W3][W4].score;

    return {
      selectedPatients,
      totalScore,
      dpTable: dp,
      backtrackPath: selectedPatients.map(p => ({
        id: p.id,
        score: p.survivalScore,
        resources: {
          icu: p.icuUsed,
          vent: p.ventUsed,
          med: p.medUsed,
          specialist: p.specialistUsed
        }
      }))
    };
  }

  /**
   * Extract 2D slice from DP table for visualization
   * (simplified view: varies 2 dimensions, fixes others)
   */
  static getDP2DSlice(dpTable, fixedW2, fixedW3, fixedW4) {
    if (!dpTable) return null;

    const n = dpTable.length - 1;
    const W1 = dpTable[0].length - 1;

    const slice = Array(n + 1)
      .fill(null)
      .map(() => Array(W1 + 1).fill(0));

    for (let i = 0; i <= n; i++) {
      for (let w1 = 0; w1 <= W1; w1++) {
        if (
          dpTable[i][w1][fixedW2] &&
          dpTable[i][w1][fixedW2][fixedW3] &&
          dpTable[i][w1][fixedW2][fixedW3][fixedW4]
        ) {
          slice[i][w1] = dpTable[i][w1][fixedW2][fixedW3][fixedW4].score;
        }
      }
    }

    return slice;
  }

  /**
   * Calculate resource utilization percentage
   */
  static getUtilization(selectedPatients, capacity) {
    let icuUsed = 0;
    let ventUsed = 0;
    let medUsed = 0;
    let specialistUsed = 0;

    selectedPatients.forEach(p => {
      icuUsed += p.icuUsed || 0;
      ventUsed += p.ventUsed || 0;
      medUsed += p.medUsed || 0;
      specialistUsed += p.specialistUsed || 0;
    });

    return {
      icu: Math.round((icuUsed / capacity.icuBeds) * 100),
      ventilators: Math.round((ventUsed / capacity.ventilators) * 100),
      medicines: Math.round((medUsed / capacity.medicines) * 100),
      specialist: Math.round((specialistUsed / capacity.specialistHours) * 100)
    };
  }
}

export default KnapsackSolver;