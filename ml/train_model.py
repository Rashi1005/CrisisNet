import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import skl2onnx
from skl2onnx.common.data_types import FloatTensorType
import json
import os

# Ensure output directory exists
os.makedirs('public', exist_ok=True)

# Set random seed for reproducibility
np.random.seed(42)

# ============================================================================
# PART 1: Generate synthetic ICU patient data
# ============================================================================

def generate_survival_score(age, systolic_bp, spo2, heart_rate, temperature, condition):
    """
    Deterministic survival score formula based on vitals.
    Higher score = better prognosis.
    Range: 1-10
    """
    score = 10.0
    
    # Age penalty (older = worse)
    if age < 25:
        score -= 0.5
    elif age < 40:
        score -= 0
    elif age < 60:
        score -= 1
    elif age < 75:
        score -= 2
    else:
        score -= 3
    
    # Blood pressure penalty (too low or too high is bad)
    if 90 <= systolic_bp <= 130:
        score += 1
    elif 80 <= systolic_bp < 90:
        score -= 1
    elif 131 <= systolic_bp <= 150:
        score -= 1
    elif systolic_bp < 80 or systolic_bp > 150:
        score -= 2
    
    # SpO2 penalty (oxygen saturation)
    if spo2 >= 95:
        score += 1
    elif spo2 >= 90:
        score += 0
    elif spo2 >= 85:
        score -= 1
    else:
        score -= 3
    
    # Heart rate penalty (normal is 60-100)
    if 60 <= heart_rate <= 100:
        score += 1
    elif 50 <= heart_rate < 60 or 100 < heart_rate <= 120:
        score -= 0.5
    elif 40 <= heart_rate < 50 or 120 < heart_rate <= 140:
        score -= 1.5
    else:
        score -= 3
    
    # Temperature penalty (normal is 37°C)
    if 36.5 <= temperature <= 37.5:
        score += 1
    elif 36 <= temperature < 36.5 or 37.5 < temperature <= 38:
        score -= 0.5
    elif 35.5 <= temperature < 36 or 38 < temperature <= 39:
        score -= 1.5
    else:
        score -= 3
    
    # Condition multiplier
    condition_multiplier = {
        0: 1.0,      # Moderate
        1: 0.7,      # Severe
        2: 0.4       # Critical
    }
    score *= condition_multiplier.get(condition, 1.0)
    
    # Clamp to 1-10 range
    score = max(1, min(10, score))
    
    return round(score, 1)

# Generate 2000 samples
n_samples = 2000
data = {
    'age': np.random.uniform(18, 90, n_samples),
    'systolic_bp': np.random.uniform(60, 180, n_samples),
    'spo2': np.random.uniform(70, 100, n_samples),
    'heart_rate': np.random.uniform(40, 180, n_samples),
    'temperature': np.random.uniform(35, 42, n_samples),
    'condition': np.random.choice([0, 1, 2], n_samples)
}

df = pd.DataFrame(data)

# Generate survival scores
df['survival_score'] = df.apply(
    lambda row: generate_survival_score(
        row['age'], row['systolic_bp'], row['spo2'],
        row['heart_rate'], row['temperature'], row['condition']
    ),
    axis=1
)

# Convert survival score (1-10) to classification labels (0-9)
df['label'] = (df['survival_score'] - 1).astype(int)

print(f"Generated {len(df)} synthetic ICU patient records")
print(f"\nSurvival score distribution:")
print(df['survival_score'].describe())
print(f"\nLabel distribution:")
print(df['label'].value_counts().sort_index())

# ============================================================================
# PART 2: Train scikit-learn logistic regression
# ============================================================================

X = df[['age', 'systolic_bp', 'spo2', 'heart_rate', 'temperature', 'condition']].values
y = df['label'].values

# Split into train/test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Normalize features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train logistic regression (multi-class)
model = LogisticRegression(
    max_iter=1000,
    solver='lbfgs',
    random_state=42
)
model.fit(X_train_scaled, y_train)

# Evaluate
train_acc = model.score(X_train_scaled, y_train)
test_acc = model.score(X_test_scaled, y_test)

print(f"\n{'='*60}")
print(f"Model Training Complete")
print(f"{'='*60}")
print(f"Training Accuracy: {train_acc:.4f}")
print(f"Test Accuracy:     {test_acc:.4f}")
print(f"\nClassification Report (Test Set):")
print(classification_report(y_test, model.predict(X_test_scaled)))

# ============================================================================
# PART 3: Export to ONNX
# ============================================================================

# Define ONNX input/output types
initial_type = [('float_input', FloatTensorType([None, 6]))]

# Convert to ONNX
onnx_model = skl2onnx.convert_sklearn(model, initial_types=initial_type)

# Save ONNX model
onnx_path = 'public/autotriage_model.onnx'
with open(onnx_path, 'wb') as f:
    f.write(onnx_model.SerializeToString())

print(f"\n✓ ONNX model exported to: {onnx_path}")

# ============================================================================
# PART 4: Export scaler normalization parameters
# ============================================================================

scaler_data = {
    'mean': scaler.mean_.tolist(),
    'scale': scaler.scale_.tolist(),
    'feature_names': ['age', 'systolic_bp', 'spo2', 'heart_rate', 'temperature', 'condition']
}

scaler_path = 'public/autotriage_scaler.json'
with open(scaler_path, 'w') as f:
    json.dump(scaler_data, f, indent=2)

print(f"✓ Scaler parameters exported to: {scaler_path}")
print(f"\nScaler mean: {scaler_data['mean']}")
print(f"Scaler scale: {scaler_data['scale']}")
print(f"\n{'='*60}")
print(f"ML Model preparation complete!")
print(f"{'='*60}")