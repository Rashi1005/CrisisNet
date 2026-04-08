import React, { useState, useEffect } from 'react';

const AutoTriage = ({ onPatientReady, onClose }) => {
  const [age, setAge] = useState(45);
  const [systolicBp, setSystolicBp] = useState(120);
  const [spo2, setSpo2] = useState(95);
  const [heartRate, setHeartRate] = useState(70);
  const [temperature, setTemperature] = useState(37);
  const [condition, setCondition] = useState('Moderate');
  const [survivalScore, setSurvivalScore] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useOverride, setUseOverride] = useState(false);
  const [overrideScore, setOverrideScore] = useState(5);

  const [scaler, setScaler] = useState(null);
  const [model, setModel] = useState(null);

  // Load model and scaler on mount
  useEffect(() => {
    const loadResources = async () => {
      try {
        const scalerResp = await fetch('/autotriage_scaler.json');
        const scalerData = await scalerResp.json();
        setScaler(scalerData);

        const ort = await import('onnxruntime-web');
        const modelResp = await fetch('/autotriage_model.onnx');
        const modelBuffer = await modelResp.arrayBuffer();
        const modelData = await ort.InferenceSession.create(modelBuffer);
        setModel(modelData);
      } catch (error) {
        console.error('Failed to load AutoTriage resources:', error);
      }
    };

    loadResources();
  }, []);

  // Predict on every vital change
  useEffect(() => {
    if (!model || !scaler) return;

    const predict = async () => {
      try {
        setIsLoading(true);

        const conditionCode =
          condition === 'Moderate' ? 0 : condition === 'Severe' ? 1 : 2;

        // Normalize inputs
        const inputs = [
          [age, systolicBp, spo2, heartRate, temperature, conditionCode]
        ];

        const normalized = inputs.map(row =>
          row.map(
            (val, idx) =>
              (val - scaler.mean[idx]) / scaler.scale[idx]
          )
        );

        // Run inference
        const ort = await import('onnxruntime-web');
        const tensor = new ort.Tensor('float32', normalized.flat(), [1, 6]);
        const feeds = { float_input: tensor };
        const results = await model.run(feeds);

        // Get prediction
        const resultKey = Object.keys(results)[0];
        const predictions = results[resultKey].data;
        const predictedLabel = Array.from(predictions).indexOf(
          Math.max(...Array.from(predictions))
        );

        const score = Math.min(10, Math.max(1, predictedLabel + 1));
        const conf = Math.round(
          (Math.max(...Array.from(predictions)) /
            Array.from(predictions).reduce((a, b) => a + b)) *
            100
        );

        setSurvivalScore(score);
        setConfidence(conf);
      } catch (error) {
        console.error('AutoTriage prediction error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    predict();
  }, [age, systolicBp, spo2, heartRate, temperature, condition, model, scaler]);

  const handleSubmit = () => {
    const finalScore = useOverride ? overrideScore : survivalScore;

    const patientObject = {
      age,
      systolic_bp: systolicBp,
      spo2,
      heart_rate: heartRate,
      temperature,
      condition,
      conditionCode:
        condition === 'Moderate' ? 0 : condition === 'Severe' ? 1 : 2,
      survivalScore: finalScore,
      confidence: useOverride ? 100 : confidence,
      icuNeed: condition !== 'Moderate',
      ventNeed: condition === 'Critical',
      medNeed: Math.round(condition === 'Moderate' ? 15 : condition === 'Severe' ? 30 : 40),
      specialistNeed: condition === 'Moderate' ? 1 : condition === 'Severe' ? 2 : 3,
      originalScore: survivalScore
    };

    onPatientReady(patientObject);
    onClose();
  };

  const getConfidenceColor = () => {
    if (!confidence) return 'bg-gray-200';
    if (confidence > 70) return 'bg-teal-500';
    if (confidence > 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">AutoTriage - Patient Assessment</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-teal-800 px-3 py-1 rounded"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Age */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Age: {age} years
              </label>
              <input
                type="range"
                min="18"
                max="90"
                value={age}
                onChange={e => setAge(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Systolic BP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Systolic BP: {systolicBp} mmHg
              </label>
              <input
                type="range"
                min="60"
                max="180"
                value={systolicBp}
                onChange={e => setSystolicBp(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* SpO2 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SpO₂: {spo2}%
              </label>
              <input
                type="range"
                min="70"
                max="100"
                value={spo2}
                onChange={e => setSpo2(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Heart Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Heart Rate: {heartRate} bpm
              </label>
              <input
                type="range"
                min="40"
                max="180"
                value={heartRate}
                onChange={e => setHeartRate(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Temperature: {temperature}°C
              </label>
              <input
                type="range"
                min="35"
                max="42"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>Moderate</option>
                <option>Severe</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          {/* AI Prediction or Override */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">AI Prediction</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useOverride}
                  onChange={e => setUseOverride(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Doctor Override</span>
              </label>
            </div>

            {!useOverride ? (
              <>
                {isLoading ? (
                  <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Survival Score</p>
                        <p className="text-4xl font-bold text-teal-600">
                          {survivalScore ? survivalScore.toFixed(1) : '—'} / 10
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">Confidence</p>
                        <div className="w-full bg-gray-300 rounded-full h-3">
                          <div
                            className={`h-full rounded-full transition-all ${getConfidenceColor()}`}
                            style={{
                              width: `${confidence || 0}%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {confidence ? confidence : 0}%
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Manual Score: {overrideScore}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={overrideScore}
                  onChange={e => setOverrideScore(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Vitals Summary */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
            <p>
              <strong>Summary:</strong> {age}yo {condition} patient • BP {systolicBp}/{Math.round(
                systolicBp - 40
              )} • SpO₂ {spo2}% • HR {heartRate} • Temp {temperature}°C
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700"
            >
              Submit Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoTriage;