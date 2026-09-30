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
DATASET_PATH = "../data/dft-road-casualty-statistics-collision-2025.csv"

map_data = []

@app.on_event("startup")
def load_assets():
    global pipeline, metrics, feature_importances, map_data
    
    if os.path.exists(MODEL_PATH):
        pipeline = joblib.load(MODEL_PATH)
        
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
            
    if os.path.exists(FI_PATH):
        with open(FI_PATH, "r") as f:
            feature_importances = json.load(f)
            
    if os.path.exists(DATASET_PATH):
        # Load a random sample of 200 points for the map to keep it lightweight
        try:
            # We skip bad lines to avoid errors
            df_map = pd.read_csv(DATASET_PATH, usecols=['latitude', 'longitude', 'collision_severity', 'time', 'speed_limit'], on_bad_lines='skip')
            df_map = df_map.dropna(subset=['latitude', 'longitude'])
            df_map = df_map.sample(200, random_state=42)
            
            # Map severity to risk level
            risk_map = {1: "CRITICAL", 2: "HIGH", 3: "MODERATE"}
            
            map_data = df_map.assign(
                risk_level=df_map['collision_severity'].map(risk_map)
            ).to_dict(orient='records')
        except Exception as e:
            print(f"Failed to load map data: {e}")

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
        pred_label = label_map.get(int(pred), "Unknown")
        
        # Highway Guardian Risk Mapping
        risk_map = {
            "Fatal": "CRITICAL",
            "Serious": "HIGH",
            "Slight": "MODERATE"
        }
        
        return {
            "predicted_class": int(pred),
            "predicted_label": pred_label,
            "risk_level": risk_map.get(pred_label, "UNKNOWN"),
            "probabilities": {
                "Fatal": probas[0] if len(probas) > 0 else 0,
                "Serious": probas[1] if len(probas) > 1 else 0,
                "Slight": probas[2] if len(probas) > 2 else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/decision-support")
def get_decision_support():
    """
    Returns model-driven intervention recommendations based on feature importance.
    Recommendations are linked to the top model features — not causal claims.
    """
    # Group feature importances by parent feature name
    feature_groups = {
        "hour": 0.0,
        "speed_limit": 0.0,
        "urban_or_rural_area": 0.0,
        "light_conditions": 0.0,
        "road_type": 0.0,
        "weather_conditions": 0.0,
        "road_surface_conditions": 0.0,
        "day_of_week": 0.0,
    }
    for fi in feature_importances:
        for key in feature_groups:
            if fi["feature"].startswith(key):
                feature_groups[key] += fi["importance"]

    # Sort groups by importance
    sorted_groups = sorted(feature_groups.items(), key=lambda x: x[1], reverse=True)

    # Map each feature to a human-readable intervention
    intervention_map = {
        "hour": {
            "label": "Time of Day (Hour)",
            "importance": feature_groups["hour"],
            "insight": "The model weighted time of day as the single most important factor. Accident patterns vary significantly across rush hours and late-night periods.",
            "recommendations": [
                "Deploy additional traffic enforcement during peak accident-risk hours (early morning and late evening).",
                "Increase road signage and lighting in high-risk time windows.",
                "Run targeted awareness campaigns around commute times."
            ],
            "priority": "HIGH",
            "color": "red"
        },
        "speed_limit": {
            "label": "Speed Limit",
            "importance": feature_groups["speed_limit"],
            "insight": "Speed limit is the second most influential model factor. Higher speed environments are strongly associated with greater severity risk.",
            "recommendations": [
                "Consider adaptive speed limits on high-speed roads during poor weather.",
                "Increase speed camera presence on roads with 60–70 mph limits.",
                "Evaluate feasibility of lowering speed limits in identified high-risk corridors."
            ],
            "priority": "HIGH",
            "color": "red"
        },
        "urban_or_rural_area": {
            "label": "Urban vs Rural Environment",
            "importance": feature_groups["urban_or_rural_area"],
            "insight": "Whether an accident occurs in an urban or rural area significantly influences model predictions. Rural roads often lack barriers and lighting.",
            "recommendations": [
                "Prioritise safety audits on rural single-carriageway roads.",
                "Improve road markings and reflective signage on rural routes.",
                "Invest in rural road infrastructure: crash barriers, better shoulders."
            ],
            "priority": "HIGH",
            "color": "orange"
        },
        "light_conditions": {
            "label": "Light Conditions",
            "importance": feature_groups["light_conditions"],
            "insight": "Lighting conditions at the time of accident is a significant model factor. Darkness — particularly without street lighting — correlates with more severe outcomes.",
            "recommendations": [
                "Audit and upgrade street lighting coverage on high-traffic rural roads.",
                "Mandate reflective road markings on unlit roads.",
                "Launch night-driving awareness campaigns targeting young drivers."
            ],
            "priority": "MEDIUM",
            "color": "amber"
        },
        "road_type": {
            "label": "Road Type",
            "importance": feature_groups["road_type"],
            "insight": "Road type — such as single carriageway, dual carriageway, or roundabout — affects the model's severity prediction. Single carriageways present higher risk.",
            "recommendations": [
                "Install physical separation barriers on high-risk single carriageway stretches.",
                "Review junction design at roundabouts with high accident frequency.",
                "Prioritise road type upgrades where feasible."
            ],
            "priority": "MEDIUM",
            "color": "amber"
        },
        "weather_conditions": {
            "label": "Weather Conditions",
            "importance": feature_groups["weather_conditions"],
            "insight": "Weather conditions influence the model's prediction, though environmental factors are often beyond direct control. Preparedness and alerting matter.",
            "recommendations": [
                "Issue real-time traffic alerts during rain, fog, and icy conditions.",
                "Deploy dynamic warning signs on key routes during adverse weather.",
                "Ensure gritting and de-icing protocols are responsive to forecasts."
            ],
            "priority": "MEDIUM",
            "color": "blue"
        },
        "road_surface_conditions": {
            "label": "Road Surface Conditions",
            "importance": feature_groups["road_surface_conditions"],
            "insight": "Wet or icy road surfaces are associated with different accident severity patterns in the model. Surface maintenance is a direct, actionable intervention.",
            "recommendations": [
                "Prioritise resurfacing programmes on high-accident-frequency roads.",
                "Improve drainage on roads with recurring surface water issues.",
                "Ensure gritting routes cover all key arterial roads during winter."
            ],
            "priority": "LOW",
            "color": "green"
        },
        "day_of_week": {
            "label": "Day of Week",
            "importance": feature_groups["day_of_week"],
            "insight": "The day of the week influences accident severity patterns. Weekend nights and weekday morning peaks show distinct risk profiles in the model.",
            "recommendations": [
                "Schedule additional patrol presence on Friday and Saturday nights.",
                "Run weekend-specific drink-drive awareness campaigns.",
                "Adjust road maintenance schedules to avoid high-traffic weekday mornings."
            ],
            "priority": "LOW",
            "color": "green"
        }
    }

    # Build final ordered list
    interventions = []
    for feature_name, _ in sorted_groups:
        if feature_name in intervention_map:
            interventions.append(intervention_map[feature_name])

    return {
        "disclaimer": (
            "These recommendations are derived from Random Forest feature importance scores — "
            "a measure of which variables the model relied upon most during training. "
            "They do not establish causation. They are intended as data-driven starting points "
            "for traffic safety planning, not as definitive causal evidence."
        ),
        "model_algorithm": "Random Forest Classifier",
        "total_features_analysed": len(feature_importances),
        "interventions": interventions
    }

@app.get("/api/historical-map")
def get_historical_map():
    return {
        "status": "historical",
        "message": "Historical accident intelligence from the UK DfT 2025 collision dataset.",
        "points": map_data
    }
