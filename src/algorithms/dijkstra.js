/**
 * Dijkstra's Shortest Path Algorithm
 * Used for finding optimal hospital transfer routes
 * 
 * COMPLEXITY: O(V² + E) where V = hospitals, E = edges
 * For hospital network: O(9) = O(1) since V=3
 */

export class DijkstraSolver {
  /**
   * Find shortest paths from source to all other nodes
   * @param {Array<Array<number>>} distanceMatrix - nxn matrix of distances
   * @param {number} sourceIndex - starting hospital index
   * @returns {Object} {distances, paths, previousNode}
   */
  static findShortestPaths(distanceMatrix, sourceIndex) {
    const n = distanceMatrix.length;
    const distances = Array(n).fill(Infinity);
    const visited = Array(n).fill(false);
    const previousNode = Array(n).fill(null);

    // Initialize
    distances[sourceIndex] = 0;

    // ========================================================================
    // Main Dijkstra loop
    // ========================================================================
    for (let count = 0; count < n - 1; count++) {
      // Find unvisited node with minimum distance
      let minDist = Infinity;
      let minIndex = -1;

      for (let v = 0; v < n; v++) {
        if (!visited[v] && distances[v] < minDist) {
          minDist = distances[v];
          minIndex = v;
        }
      }

      if (minIndex === -1) break; // No more reachable nodes

      visited[minIndex] = true;

      // Update distances of neighbors
      for (let v = 0; v < n; v++) {
        if (
          !visited[v] &&
          distanceMatrix[minIndex][v] !== Infinity &&
          distances[minIndex] + distanceMatrix[minIndex][v] < distances[v]
        ) {
          distances[v] = distances[minIndex] + distanceMatrix[minIndex][v];
          previousNode[v] = minIndex;
        }
      }
    }

    // Reconstruct paths
    const paths = {};
    for (let i = 0; i < n; i++) {
      if (i !== sourceIndex) {
        paths[i] = DijkstraSolver.reconstructPath(previousNode, sourceIndex, i);
      }
    }

    return {
      distances,
      paths,
      previousNode,
      source: sourceIndex
    };
  }

  /**
   * Reconstruct path from source to destination
   */
  static reconstructPath(previousNode, source, destination) {
    const path = [];
    let current = destination;

    while (current !== null) {
      path.unshift(current);
      if (current === source) break;
      current = previousNode[current];
    }

    return path;
  }

  /**
   * Get path as readable string of hospital names
   */
  static getPathString(path, hospitalNames) {
    return path.map(idx => hospitalNames[idx] || `Hospital ${idx}`).join(' → ');
  }

  /**
   * Get all hospitals sorted by distance from source
   */
  static getHospitalsByDistance(distanceMatrix, sourceIndex) {
    const result = DijkstraSolver.findShortestPaths(distanceMatrix, sourceIndex);
    const hospitals = result.distances
      .map((dist, idx) => ({
        index: idx,
        distance: dist
      }))
      .filter(h => h.index !== sourceIndex)
      .sort((a, b) => a.distance - b.distance);

    return hospitals;
  }
}

export default DijkstraSolver;