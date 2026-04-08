# CrisisNet - City Emergency Triage Intelligence System

A production-grade, real-time algorithmic triage routing engine that solves the critical problem: **during a mass casualty event, which patient goes to which hospital, using which resources, to maximize total lives saved?**

## 🎯 Core Concept

CrisisNet is a **fully client-side crisis simulation command center** that:

1. **Predicts patient survival** using an ML model (AutoTriage) trained on synthetic ICU data
2. **Allocates limited resources** (ICU beds, ventilators, medicines, specialist hours) across 3 hospitals using a 4D knapsack algorithm
3. **Optimizes transfers** using Dijkstra's shortest path to route patients to the best available hospital with a transfer penalty
4. **Visualizes the crisis** in real-time with a command center dashboard showing hospital status, patient arrivals, and system metrics

## 🏗 Architecture

### Tech Stack
- **Frontend**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **ML Inference**: ONNX Runtime Web (client-side ML)
- **Algorithms**: Custom JS implementations (Knapsack, Dijkstra)
- **Backend**: None (fully client-side)

### Project Structure
crisisnet/ ├── ml/ │ └── train_model.py # Generate synthetic data, train AutoTriage ├── src/ │ ├── algorithms/ │ │ ├── knapsack.js # 4D knapsack solver │ │ ├── dijkstra.js # Shortest path routing │ │ └── transferOptimizer.js # Transfer decision logic │ ├── engine/ │ │ └── simulator.js # Core crisis simulation engine │ ├── components/ │ │ ├── AutoTriage.jsx # ML-based patient assessment form │ │ ├── ResourceBar.jsx # Animated capacity bar │ │ ├── HospitalCard.jsx # Hospital status card │ │ ├── ArrivalFeedRow.jsx # Patient arrival row │ │ ├── StatCard.jsx # Metric card │ │ ├── TransferGraph.jsx # Hospital network SVG │ │ ├── KnapsackTable.jsx # DP table visualization │ │ └── BacktrackPanel.jsx # Selected patients display │ ├── pages/ │ │ └── Dashboard.jsx # Main command center │ ├── App.jsx │ ├── main.jsx │ └── index.css ├── public/ │ ├── autotriage_model.onnx # ML model (generated) │ └── autotriage_scaler.json # Normalization params ├── index.html ├── package.json ├── vite.config.js ├── tailwind.config.js └── README.md 

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Python 3.8+ (for ML model training)

### Installation

```bash
# Clone/setup project
git clone <repo>
cd crisisnet

# Install frontend dependencies
npm install

# Install Python ML dependencies
pip install scikit-learn pandas numpy skl2onnx onnx onnxruntime