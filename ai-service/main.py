"""
RepairTrust AI/ML Microservice
Exposes scikit-learn models (Random Forest Repeat-Failure Predictor & Isolation Forest Anomaly Detector)
via FastAPI with explainable outputs and performance metrics.
"""

import os
import json
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

app = FastAPI(
    title="RepairTrust AI Decision-Support Service",
    version="1.2.0",
    description="Machine Learning service providing repeat-failure risk scoring, anomaly detection, and explainability for municipal stormwater infrastructure."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
RF_PATH = os.path.join(MODELS_DIR, "random_forest_risk.joblib")
ISO_PATH = os.path.join(MODELS_DIR, "isolation_forest_anomalies.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "model_metrics.json")

# Load models safely
rf_model = None
iso_model = None
model_metadata = {}

if os.path.exists(RF_PATH):
    try:
        rf_model = joblib.load(RF_PATH)
    except Exception as e:
        print(f"[Warning] Could not load RF model: {e}")

if os.path.exists(ISO_PATH):
    try:
        iso_model = joblib.load(ISO_PATH)
    except Exception as e:
        print(f"[Warning] Could not load Isolation Forest model: {e}")

if os.path.exists(METRICS_PATH):
    try:
        with open(METRICS_PATH, "r") as f:
            model_metadata = json.load(f)
    except Exception as e:
        print(f"[Warning] Could not load metrics: {e}")

class AssetFeaturesInput(BaseModel):
    asset_id: str = Field(..., example="DR-001")
    previous_complaint_count: int = Field(default=0, ge=0)
    number_of_repairs: int = Field(default=0, ge=0)
    days_since_last_repair: float = Field(default=30.0, ge=0)
    avg_days_between_failures: float = Field(default=60.0, ge=1)
    rainfall_intensity_mm: float = Field(default=25.0, ge=0)
    downstream_blockage_reported: int = Field(default=0, ge=0, le=1)
    asset_age_years: float = Field(default=5.0, ge=0)
    debris_severity_index: float = Field(default=2.5, ge=1.0, le=5.0)
    historical_capacity_ratio: float = Field(default=0.85, ge=0.1, le=2.0)

class AnomalyItemInput(BaseModel):
    asset_id: str
    previous_complaint_count: int
    number_of_repairs: int
    days_since_last_repair: float
    avg_days_between_failures: float
    rainfall_intensity_mm: float
    downstream_blockage_reported: int
    asset_age_years: float
    debris_severity_index: float
    historical_capacity_ratio: float

class AnomalyBatchInput(BaseModel):
    assets: List[AnomalyItemInput]

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RepairTrust AI Decision Support Service",
        "models_loaded": {
            "random_forest": rf_model is not None,
            "isolation_forest": iso_model is not None
        },
        "model_version": model_metadata.get("model_version", "v1.2.0-synthetic-demo")
    }

@app.get("/model-metrics")
def get_model_metrics():
    if not model_metadata:
        raise HTTPException(status_code=404, detail="Model metrics file not found. Run train_synthetic.py first.")
    return model_metadata

@app.post("/predict/repeat-failure")
def predict_repeat_failure(data: AssetFeaturesInput):
    vector = np.array([[
        data.previous_complaint_count,
        data.number_of_repairs,
        data.days_since_last_repair,
        data.avg_days_between_failures,
        data.rainfall_intensity_mm,
        data.downstream_blockage_reported,
        data.asset_age_years,
        data.debris_severity_index,
        data.historical_capacity_ratio
    ]])
    
    if rf_model is not None:
        probabilities = rf_model.predict_proba(vector)[0]
        # prob of repeat failure (class 1)
        prob_repeat = float(probabilities[1])
        prediction = int(rf_model.predict(vector)[0])
    else:
        # Fallback calibrated heuristic if model file missing
        score = (
            data.previous_complaint_count * 0.12 +
            data.number_of_repairs * 0.08 +
            data.downstream_blockage_reported * 0.35 +
            (1.0 - min(data.historical_capacity_ratio, 1.0)) * 0.25 +
            (data.debris_severity_index / 5.0) * 0.15
        )
        prob_repeat = min(max(float(score), 0.05), 0.95)
        prediction = 1 if prob_repeat > 0.5 else 0

    # Risk level classification
    if prob_repeat >= 0.70:
        risk_level = "HIGH"
        risk_color = "red"
    elif prob_repeat >= 0.40:
        risk_level = "MODERATE"
        risk_color = "amber"
    else:
        risk_level = "LOW"
        risk_color = "teal"

    # Explainability: Identify top contributing factors
    contributors = []
    if data.downstream_blockage_reported == 1:
        contributors.append("Unresolved downstream blockage detected in connected network")
    if data.previous_complaint_count >= 3:
        contributors.append(f"High historical complaint volume ({data.previous_complaint_count} reported events)")
    if data.avg_days_between_failures < 45:
        contributors.append(f"Short failure recurrence cycle ({data.avg_days_between_failures:.0f} days average)")
    if data.historical_capacity_ratio < 0.70:
        contributors.append(f"Hydraulic capacity constrained (ratio {data.historical_capacity_ratio:.2f} < 0.70 threshold)")
    if data.debris_severity_index >= 3.5:
        contributors.append(f"Chronic heavy debris accumulation (severity index {data.debris_severity_index}/5.0)")
    if data.rainfall_intensity_mm > 35:
        contributors.append(f"Elevated catchment rainfall exposure ({data.rainfall_intensity_mm:.1f} mm)")

    if not contributors:
        contributors.append("Maintenance pattern within normal operating thresholds")

    return {
        "asset_id": data.asset_id,
        "predicted_repeat_failure": bool(prediction),
        "repeat_failure_risk_score": round(prob_repeat * 100, 1),
        "risk_level": risk_level,
        "risk_color": risk_color,
        "observation_window_days": 60,
        "confidence": round(abs(prob_repeat - 0.5) * 2 * 100, 1),
        "top_contributing_factors": contributors,
        "model_version": model_metadata.get("model_version", "v1.2.0-synthetic-demo"),
        "calibration_disclaimer": "Predicted probability based on Random Forest model trained on synthetic municipal dataset. For decision support only; does not replace structural physical engineering inspection."
    }

@app.post("/detect/anomalies")
def detect_anomalies(batch: AnomalyBatchInput):
    if not batch.assets:
        return {"anomalies": [], "total_examined": 0}
        
    records = []
    asset_ids = []
    for item in batch.assets:
        asset_ids.append(item.asset_id)
        records.append([
            item.previous_complaint_count,
            item.number_of_repairs,
            item.days_since_last_repair,
            item.avg_days_between_failures,
            item.rainfall_intensity_mm,
            item.downstream_blockage_reported,
            item.asset_age_years,
            item.debris_severity_index,
            item.historical_capacity_ratio
        ])
        
    X = np.array(records)
    
    if iso_model is not None:
        preds = iso_model.predict(X) # -1 for outlier/anomaly, 1 for inlier
        scores = iso_model.decision_function(X) # lower score means more anomalous
    else:
        # Heuristic fallback
        preds = [1] * len(X)
        scores = [0.0] * len(X)
        
    results = []
    for idx, (asset_id, pred, score) in enumerate(zip(asset_ids, preds, scores)):
        is_anomaly = bool(pred == -1)
        item = batch.assets[idx]
        reason = None
        if is_anomaly:
            if item.number_of_repairs > 4 and item.avg_days_between_failures < 30:
                reason = "Disproportionately high repair frequency with rapid recurrence compared to peer drainage assets"
            elif item.previous_complaint_count > 6:
                reason = "Outlier complaint velocity with unresolved chronic overflow pattern"
            elif item.debris_severity_index > 4.2 and item.historical_capacity_ratio < 0.5:
                reason = "Severe hydraulic pinch-point combined with extreme sediment loading"
            else:
                reason = "Unusual multidimensional maintenance profile deviating from peer municipal baseline"
                
        results.append({
            "asset_id": asset_id,
            "is_anomaly": is_anomaly,
            "anomaly_score": round(float(score), 4),
            "explanation": reason,
            "disclaimer": "Anomaly flags indicate statistical deviation from peer group, not proof of negligence or misconduct."
        })
        
    return {
        "total_examined": len(results),
        "anomalies_detected": sum(1 for r in results if r["is_anomaly"]),
        "results": results
    }
