"""
RepairTrust AI/ML Microservice — Synthetic Training & Model Generation
Generates synthetic municipal stormwater drain maintenance dataset with clear labelling,
trains Model A (Random Forest for repeat-failure risk) and Model B (Isolation Forest for anomaly detection),
evaluates performance metrics (precision, recall, F1, confusion matrix, ROC-AUC), and saves artifacts.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

FEATURE_NAMES = [
    "previous_complaint_count",
    "number_of_repairs",
    "days_since_last_repair",
    "avg_days_between_failures",
    "rainfall_intensity_mm",
    "downstream_blockage_reported",
    "asset_age_years",
    "debris_severity_index",
    "historical_capacity_ratio"
]

def generate_synthetic_data(n_samples=600, random_state=42):
    np.random.seed(random_state)
    
    # 1. previous complaints (0 to 12)
    prev_complaints = np.random.poisson(lam=2.8, size=n_samples)
    
    # 2. number of repairs (0 to 10)
    repairs = np.random.poisson(lam=2.2, size=n_samples)
    
    # 3. days since last repair (5 to 300 days)
    days_since_repair = np.random.exponential(scale=45.0, size=n_samples) + 5
    
    # 4. avg days between failures (10 to 180 days)
    avg_days_between = np.random.normal(loc=65, scale=25, size=n_samples)
    avg_days_between = np.clip(avg_days_between, 12, 240)
    
    # 5. rainfall intensity mm in observation period
    rainfall = np.random.gamma(shape=2.5, scale=18.0, size=n_samples)
    
    # 6. downstream blockage reported (0 or 1)
    downstream_blockage = np.random.binomial(n=1, p=0.28, size=n_samples)
    
    # 7. asset age in years (1 to 25)
    asset_age = np.random.uniform(1.0, 25.0, size=n_samples)
    
    # 8. debris severity index (1.0 to 5.0)
    debris_index = np.random.uniform(1.0, 5.0, size=n_samples)
    
    # 9. historical capacity ratio (0.3 to 1.4; <0.7 indicates undersized/choked capacity)
    capacity_ratio = np.random.normal(loc=0.82, scale=0.22, size=n_samples)
    capacity_ratio = np.clip(capacity_ratio, 0.25, 1.45)
    
    # Ground truth repeat-failure generation rule (non-linear log-odds with noise)
    # Higher risk if: many previous complaints, low days between failures, high rainfall, downstream blockage, low capacity
    log_odds = (
        -2.4
        + 0.35 * prev_complaints
        + 0.22 * repairs
        - 0.015 * days_since_repair
        - 0.028 * avg_days_between
        + 0.038 * rainfall
        + 1.65 * downstream_blockage
        + 0.045 * asset_age
        + 0.42 * debris_index
        - 2.1 * (capacity_ratio - 0.7)
    )
    
    probs = 1.0 / (1.0 + np.exp(-log_odds))
    # Target label: 1 if repeat failure observed within 60-day window, 0 otherwise
    repeat_failure = (probs > np.random.uniform(0, 1, size=n_samples)).astype(int)
    
    df = pd.DataFrame({
        "previous_complaint_count": prev_complaints,
        "number_of_repairs": repairs,
        "days_since_last_repair": np.round(days_since_repair, 1),
        "avg_days_between_failures": np.round(avg_days_between, 1),
        "rainfall_intensity_mm": np.round(rainfall, 1),
        "downstream_blockage_reported": downstream_blockage,
        "asset_age_years": np.round(asset_age, 1),
        "debris_severity_index": np.round(debris_index, 1),
        "historical_capacity_ratio": np.round(capacity_ratio, 2),
        "repeat_failure_within_window": repeat_failure
    })
    
    return df

def train_and_save():
    print("[AI-Service] Generating synthetic training dataset for municipal assets...")
    df = generate_synthetic_data(n_samples=750, random_state=42)
    
    X = df[FEATURE_NAMES]
    y = df["repeat_failure_within_window"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"[AI-Service] Training Random Forest Classifier on {len(X_train)} samples...")
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=6,
        min_samples_split=5,
        random_state=42,
        class_weight="balanced"
    )
    rf_model.fit(X_train, y_train)
    
    # Test evaluation
    y_pred = rf_model.predict(X_test)
    y_prob = rf_model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()
    auc = roc_auc_score(y_test, y_prob)
    
    feature_importances = dict(zip(FEATURE_NAMES, [float(x) for x in rf_model.feature_importances_]))
    # sort descending
    feature_importances = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))
    
    # Train Model B: Isolation Forest for maintenance anomaly detection
    print(f"[AI-Service] Training Isolation Forest for anomaly detection...")
    iso_model = IsolationForest(
        n_estimators=100,
        contamination=0.08,
        random_state=42
    )
    iso_model.fit(X)
    
    # Save model files
    joblib.dump(rf_model, os.path.join(MODELS_DIR, "random_forest_risk.joblib"))
    joblib.dump(iso_model, os.path.join(MODELS_DIR, "isolation_forest_anomalies.joblib"))
    
    metrics = {
        "model_version": "v1.2.0-synthetic-demo",
        "model_type": "Random Forest Classifier & Isolation Forest",
        "dataset_label": "Synthetic Labeled Municipal Stormwater Drain Dataset",
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "target_variable": "repeat_failure_within_window (60-day observation window)",
        "features": FEATURE_NAMES,
        "metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(auc), 4),
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1]
            }
        },
        "feature_importances": feature_importances,
        "disclaimer": "This model is trained on documented synthetic municipal records for decision support and demonstration. All risk scores reflect historical correlation and should be combined with physical engineering inspection."
    }
    
    with open(os.path.join(MODELS_DIR, "model_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
        
    print("[AI-Service] Training complete. Models and metrics saved successfully to /models.")
    return metrics

if __name__ == "__main__":
    train_and_save()
