from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import json

app = FastAPI(title="TrafficSafe AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = None
metrics = {}
feature_importances = []
dataset_info = {
    "filename": "dft-road-casualty-statistics-collision-2025.csv",
    "source": "UK Department for Transport (DfT)",
    "total_rows": 513801,
    "total_columns": 44,
    "missing_values": 18432,
    "duplicate_rows": 0,
    "target": "collision_severity",
    "target_description": "1 = Fatal, 2 = Serious, 3 = Slight",
    "distribution": [
        {"label": "Slight (3)", "count": 389435, "percentage": 75.8},
        {"label": "Serious (2)", "count": 116813, "percentage": 22.7},
        {"label": "Fatal (1)", "count": 7553, "percentage": 1.5}
    ],
    "model_features": [
        {"name": "road_type", "type": "Categorical", "description": "Road type at accident location"},
        {"name": "speed_limit", "type": "Numerical", "description": "Speed limit in mph at the accident location"},
        {"name": "light_conditions", "type": "Categorical", "description": "Light conditions at time of accident"},
        {"name": "weather_conditions", "type": "Categorical", "description": "Weather at time of accident"},
        {"name": "road_surface_conditions", "type": "Categorical", "description": "Road surface state"},
        {"name": "urban_or_rural_area", "type": "Categorical", "description": "Urban or rural classification"},
        {"name": "day_of_week", "type": "Categorical", "description": "Day of the week (1=Sunday, 7=Saturday)"},
        {"name": "hour", "type": "Engineered", "description": "Hour of day extracted from the 'time' column"}
    ],
    "dropped_columns": [
        {"name": "collision_index", "reason": "Unique identifier — no predictive value"},
        {"name": "collision_ref_no", "reason": "Unique identifier — no predictive value"},
        {"name": "number_of_casualties", "reason": "Post-accident information — not available at prediction time"},
        {"name": "number_of_vehicles", "reason": "Post-accident information — not available at prediction time"},
        {"name": "enhanced_severity_collision", "reason": "Direct encoding of target — data leakage"},
        {"name": "collision_adjusted_severity_serious", "reason": "Direct encoding of target — data leakage"},
        {"name": "collision_adjusted_severity_slight", "reason": "Direct encoding of target — data leakage"},
        {"name": "collision_injury_based", "reason": "Derived from target — data leakage"},
        {"name": "lsoa_of_accident_location", "reason": "High cardinality location code — not generalizable"},
        {"name": "local_authority_district", "reason": "High cardinality — not useful for generalization"},
        {"name": "collision_year", "reason": "Not relevant for predicting severity of a new incident"}
    ]
}

MODEL_PATH = "../models/accident_severity_pipeline.pkl"
METRICS_PATH = "../models/metrics.json"
FI_PATH = "../models/feature_importance.json"

@app.on_event("startup")
def load_assets():
    global pipeline, metrics, feature_importances
    
    if os.path.exists(MODEL_PATH):
        pipeline = joblib.load(MODEL_PATH)
        
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
            
    if os.path.exists(FI_PATH):
        with open(FI_PATH, "r") as f:
            feature_importances = json.load(f)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": pipeline is not None
    }

@app.get("/api/metrics")
def get_metrics():
    # Return combination of metrics and dataset info for the overview page
    return {**metrics, **dataset_info, "feature_count": len(dataset_info["model_features"])}

@app.get("/api/dataset/summary")
def get_dataset_summary():
    return dataset_info

@app.get("/api/feature-importance")
def get_feature_importance():
    return feature_importances

class PredictionRequest(BaseModel):
    road_type: int | str = 6
    speed_limit: int = 30
    light_conditions: int = 1
    weather_conditions: int = 1
    road_surface_conditions: int = 1
    urban_or_rural_area: int = 1
    day_of_week: int = 1
    time: str = "12:00"

@app.post("/api/predict")
def predict(req: PredictionRequest):
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    
    # Feature engineering logic (same as training)
    # Extract hour from time
    hour = int(req.time.split(':')[0]) if req.time else 12
    
    # Create a dataframe for the model
    input_data = pd.DataFrame([{
        "road_type": req.road_type,
        "speed_limit": req.speed_limit,
        "light_conditions": req.light_conditions,
        "weather_conditions": req.weather_conditions,
        "road_surface_conditions": req.road_surface_conditions,
        "urban_or_rural_area": req.urban_or_rural_area,
        "day_of_week": req.day_of_week,
        "time": req.time,
        "hour": hour
    }])
    
    try:
        pred = pipeline.predict(input_data)[0]
        probas = pipeline.predict_proba(input_data)[0]
        
        # Mapping labels
        label_map = {1: "Fatal", 2: "Serious", 3: "Slight"}
        
        return {
            "predicted_class": int(pred),
            "predicted_label": label_map.get(int(pred), "Unknown"),
            "probabilities": {
                "Fatal": probas[0] if len(probas) > 0 else 0,
                "Serious": probas[1] if len(probas) > 1 else 0,
                "Slight": probas[2] if len(probas) > 2 else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
