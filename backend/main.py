import asyncio
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import random
import time
from datetime import datetime

app = FastAPI(title="Highway Guardian API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration & Weights (CARF)
class CARFSettings(BaseModel):
    vehicle: float = 0.30
    weather: float = 0.20
    traffic: float = 0.15
    accident: float = 0.15
    near_miss: float = 0.20

class Thresholds(BaseModel):
    low: int = 25
    moderate: int = 50
    high: int = 75

settings = CARFSettings()
thresholds = Thresholds()

# Global State for Simulation
simulation_active = False
current_scenario = "NORMAL"

vehicle_state = {
    "id": "HV-1024",
    "speed": 60.0,
    "load": 65.0,
    "acceleration": 0.5,
    "brake_intensity": "LOW",
    "tilt": 1.2,
    "temperature": 28.0,
    "visibility": "HIGH",
    "traffic_density": "LOW",
    "rainfall": "NONE",
    "latitude": 11.0168,
    "longitude": 76.9558,
    "near_miss_count": 0,
    "historical_risk": 45.0,
    "engine": "Normal",
    "brake_system": "Normal",
    "stability": "Normal"
}

risk_state = {
    "total": 22.0,
    "components": {
        "vehicle": 20.0,
        "weather": 10.0,
        "traffic": 15.0,
        "accident": 45.0,
        "near_miss": 0.0
    },
    "classification": "LOW"
}

near_misses = []
incidents = []
alerts = []

# SIMULATION ENGINE
def calculate_carf():
    global risk_state, vehicle_state, near_misses, incidents, alerts

    # Base component calculations (0-100 normalized)
    v_risk = min(100.0, (vehicle_state["speed"]/100.0)*40 + (vehicle_state["load"]/100.0)*30 + (vehicle_state["tilt"]/10.0)*30)
    w_risk = 80.0 if vehicle_state["rainfall"] == "HEAVY" else 40.0 if vehicle_state["rainfall"] == "MODERATE" else 10.0
    if vehicle_state["visibility"] == "LOW": w_risk += 20.0
    
    t_risk = 80.0 if vehicle_state["traffic_density"] == "HIGH" else 50.0 if vehicle_state["traffic_density"] == "MEDIUM" else 20.0
    a_risk = vehicle_state["historical_risk"]
    n_risk = min(100.0, vehicle_state["near_miss_count"] * 20.0)

    # Fusion
    total_risk = (
        settings.vehicle * v_risk +
        settings.weather * w_risk +
        settings.traffic * t_risk +
        settings.accident * a_risk +
        settings.near_miss * n_risk
    )

    # Classification
    classification = "LOW"
    if total_risk > thresholds.high:
        classification = "CRITICAL"
    elif total_risk > thresholds.moderate:
        classification = "HIGH"
    elif total_risk > thresholds.low:
        classification = "MODERATE"

    risk_state["total"] = round(total_risk, 1)
    risk_state["components"] = {
        "vehicle": round(v_risk, 1),
        "weather": round(w_risk, 1),
        "traffic": round(t_risk, 1),
        "accident": round(a_risk, 1),
        "near_miss": round(n_risk, 1)
    }
    risk_state["classification"] = classification

    # Alert Generation
    if total_risk > thresholds.high:
        if not any(a["id"] == f"ALT-{vehicle_state['id']}-CRITICAL" for a in alerts):
            alerts.insert(0, {
                "id": f"ALT-{vehicle_state['id']}-CRITICAL",
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "vehicle": vehicle_state["id"],
                "risk": risk_state["total"],
                "type": "CRITICAL SAFETY ALERT",
                "location": "Highway Segment 42",
                "action": "Reduce speed and initiate safety response."
            })
            incidents.insert(0, {
                "id": f"INC-{random.randint(1000,9999)}",
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "severity": "CRITICAL",
                "type": "Potential Collision Risk",
                "vehicle": vehicle_state["id"],
                "location": "Highway Segment 42",
                "confidence": 94.1,
                "status": "ACTIVE",
                "coordinates": [vehicle_state["latitude"], vehicle_state["longitude"]]
            })

async def simulation_loop():
    global simulation_active, vehicle_state, current_scenario, near_misses
    
    while True:
        if simulation_active:
            # Add some jitter
            vehicle_state["speed"] += random.uniform(-2, 2)
            vehicle_state["latitude"] += 0.0001
            vehicle_state["longitude"] += 0.0001
            
            # Apply scenario logic
            if current_scenario == "NORMAL":
                vehicle_state["speed"] = vehicle_state["speed"] * 0.9 + 60.0 * 0.1
                vehicle_state["load"] = 65.0
                vehicle_state["rainfall"] = "NONE"
                vehicle_state["traffic_density"] = "LOW"
                vehicle_state["visibility"] = "HIGH"
                vehicle_state["tilt"] = 1.2
            elif current_scenario == "WARNING":
                vehicle_state["speed"] = vehicle_state["speed"] * 0.9 + 78.0 * 0.1
                vehicle_state["load"] = 82.0
                vehicle_state["rainfall"] = "MODERATE"
                vehicle_state["traffic_density"] = "MEDIUM"
                vehicle_state["visibility"] = "MEDIUM"
                vehicle_state["tilt"] = 3.2
            elif current_scenario == "CRITICAL":
                vehicle_state["speed"] = vehicle_state["speed"] * 0.9 + 92.0 * 0.1
                vehicle_state["load"] = 96.0
                vehicle_state["rainfall"] = "HEAVY"
                vehicle_state["visibility"] = "LOW"
                vehicle_state["traffic_density"] = "HIGH"
                vehicle_state["tilt"] = 5.1
                vehicle_state["brake_intensity"] = "HIGH"
                vehicle_state["brake_system"] = "Warning"
                
            calculate_carf()
        
        await asyncio.sleep(1.0)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

# --- API ENDPOINTS ---

@app.get("/api/state")
def get_state():
    return {
        "vehicle": vehicle_state,
        "risk": risk_state,
        "simulation_active": simulation_active,
        "scenario": current_scenario
    }

@app.get("/api/dashboard")
def get_dashboard_metrics():
    return {
        "active_vehicles": 24,
        "high_risk_vehicles": 3 if risk_state["total"] > 50 else 2,
        "near_misses": len(near_misses) + 18,
        "active_incidents": len([i for i in incidents if i["status"] == "ACTIVE"]),
        "avg_risk": round(risk_state["total"] * 0.8 + 20, 1),
        "alert_delivery": 97.2
    }

@app.post("/api/simulation/start")
def start_simulation():
    global simulation_active
    simulation_active = True
    return {"status": "started"}

@app.post("/api/simulation/stop")
def stop_simulation():
    global simulation_active
    simulation_active = False
    return {"status": "stopped"}

class ScenarioRequest(BaseModel):
    scenario: str

@app.post("/api/simulation/scenario")
def set_scenario(req: ScenarioRequest):
    global current_scenario
    current_scenario = req.scenario.upper()
    return {"status": "updated", "scenario": current_scenario}

@app.post("/api/simulation/near-miss")
def trigger_near_miss():
    global vehicle_state, near_misses
    vehicle_state["near_miss_count"] += 1
    near_misses.insert(0, {
        "id": f"NM-{random.randint(1000,9999)}",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "location": "Segment 42",
        "type": "Abrupt Braking",
        "severity": "High",
        "speed": f"{round(vehicle_state['speed'])} km/h",
        "weather": vehicle_state["rainfall"]
    })
    calculate_carf()
    return {"status": "near_miss_recorded"}

@app.get("/api/lists")
def get_lists():
    return {
        "near_misses": near_misses,
        "incidents": incidents,
        "alerts": alerts
    }

@app.post("/api/settings")
def update_settings(new_settings: CARFSettings):
    global settings
    settings = new_settings
    calculate_carf()
    return settings

@app.get("/api/explain")
def get_explanation():
    # Generate mock SHAP-style values based on current state
    r = risk_state["components"]
    
    factors = []
    if r["near_miss"] > 20: factors.append({"name": "Near-Miss Frequency", "value": 22, "color": "red"})
    if r["weather"] > 50: factors.append({"name": "Heavy Rainfall", "value": 18, "color": "red"})
    if vehicle_state["brake_intensity"] == "HIGH": factors.append({"name": "Abrupt Braking", "value": 16, "color": "red"})
    if vehicle_state["speed"] > 80: factors.append({"name": "Vehicle Speed", "value": 14, "color": "red"})
    if vehicle_state["load"] > 80: factors.append({"name": "Vehicle Load", "value": 11, "color": "red"})
    if r["traffic"] > 60: factors.append({"name": "Traffic Density", "value": 8, "color": "red"})
    
    if not factors:
        factors.append({"name": "Normal Operation", "value": -15, "color": "green"})
        
    return {
        "prediction": risk_state["classification"],
        "confidence": 93.6,
        "factors": factors,
        "explanation": f"The current prediction is primarily influenced by {', '.join([f['name'].lower() for f in factors[:3]])}."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
