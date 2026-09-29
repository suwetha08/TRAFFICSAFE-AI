# 🚦 TRAFFICSAFE AI
### Traffic Accident Severity Prediction & Intelligence Platform

> *"From accident data to explainable severity intelligence."*

An end-to-end, evaluator-ready machine learning system that analyses real-world accident conditions and predicts **accident severity** (Fatal / Serious / Slight) using a **Random Forest Classifier** trained on 513,801 UK road collision records. Predictions are served via a **FastAPI** backend and visualised on a professional **React + TypeScript** dashboard.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Dataset](#-dataset)
- [Target Variable](#-target-variable)
- [ML Pipeline](#-ml-pipeline)
- [Feature Engineering](#-feature-engineering)
- [Preprocessing](#-preprocessing)
- [Model Configuration](#-model-configuration)
- [Evaluation Results](#-evaluation-results)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [API Endpoints](#-api-endpoints)
- [Dashboard Pages](#-dashboard-pages)
- [Installation & Running Locally](#-installation--running-locally)
- [Training the Model](#-training-the-model)
- [Testing](#-testing)
- [Git & GitHub](#-git--github)

---

## 🎯 Problem Statement

**Challenge 58 — Traffic Accident Severity Prediction**

Develop a data-driven system that uses available accident-related information (road, weather, vehicle, time, location, and accident conditions) to **predict Accident Severity Class** and provide **explainable decision-support intelligence**.

---

## 📊 Dataset

| Property | Value |
|---|---|
| **Name** | `dft-road-casualty-statistics-collision-2025.csv` |
| **Source** | UK Department for Transport (DfT) |
| **Official URL** | https://data.dft.gov.uk/road-accidents-safety-data/ |
| **Total Records** | 513,801 |
| **Total Columns** | 44 |
| **Missing Values** | 18,432 |
| **Duplicate Rows** | 0 |
| **Years Covered** | Last 5 published years |

---

## 🎯 Target Variable

| Code | Label | Count | % |
|---|---|---|---|
| `1` | Fatal | 7,553 | 1.5% |
| `2` | Serious | 116,813 | 22.7% |
| `3` | Slight | 389,435 | 75.8% |

> **Class Imbalance Note:** Severe imbalance exists. Addressed using `class_weight='balanced'` in the Random Forest.

---

## 🔬 ML Pipeline

```
RAW DATA  →  DATA CLEANING  →  FEATURE ENGINEERING  →  PREPROCESSING  →  TRAIN/TEST SPLIT
    →  RANDOM FOREST TRAINING  →  EVALUATION  →  MODEL SAVING  →  PREDICTION API
```

---

## ⚙️ Feature Engineering

| Feature | Type | Source | Description |
|---|---|---|---|
| `road_type` | Categorical | Original | Road type at accident location |
| `speed_limit` | Numerical | Original | Speed limit in mph |
| `light_conditions` | Categorical | Original | Lighting at time of accident |
| `weather_conditions` | Categorical | Original | Weather at time of accident |
| `road_surface_conditions` | Categorical | Original | Road surface state |
| `urban_or_rural_area` | Categorical | Original | Urban or rural classification |
| `day_of_week` | Categorical | Original | Day of the week (1=Sun, 7=Sat) |
| `hour` | **Engineered** | Extracted from `time` | Hour of day (0–23) |

### Dropped Columns (Leakage & ID Removal)

| Column | Reason |
|---|---|
| `collision_index` | Unique identifier — no predictive value |
| `collision_ref_no` | Unique identifier — no predictive value |
| `number_of_casualties` | Post-accident info — unavailable at prediction time |
| `number_of_vehicles` | Post-accident info — unavailable at prediction time |
| `enhanced_severity_collision` | Direct target encoding — **data leakage** |
| `collision_adjusted_severity_serious` | Derived from target — **data leakage** |
| `collision_adjusted_severity_slight` | Derived from target — **data leakage** |
| `collision_injury_based` | Derived from target — **data leakage** |
| `lsoa_of_accident_location` | High cardinality — not generalisable |
| `local_authority_district` | High cardinality — not useful |
| `collision_year` | Not relevant for new incident prediction |

---

## 🔧 Preprocessing

Built using **Scikit-learn `Pipeline` + `ColumnTransformer`**:

- **Numerical features** (`speed_limit`, `hour`): `StandardScaler`
- **Categorical features** (all others): `OneHotEncoder(handle_unknown='ignore')`
- The complete preprocessing pipeline is **saved inside the `.pkl` file** — no separate preprocessing step needed during prediction.

> The same pipeline used during training is applied identically during prediction. No data leakage from test set into fitting.

---

## 🌲 Model Configuration

```python
RandomForestClassifier(
    n_estimators   = 100,
    max_depth      = 15,
    class_weight   = 'balanced',
    random_state   = 42,
    n_jobs         = -1
)
```

| Parameter | Value | Reason |
|---|---|---|
| `n_estimators` | 100 | Balance between accuracy and speed |
| `max_depth` | 15 | Prevent overfitting |
| `class_weight` | `balanced` | Address severe class imbalance |
| `random_state` | 42 | Full reproducibility |
| `n_jobs` | -1 | Use all CPU cores for training |

---

## 📈 Evaluation Results

> Evaluated on held-out test set (20% stratified split). Metrics saved to `models/metrics.json`.

| Metric | Score |
|---|---|
| **Accuracy** | 36.07% |
| **Precision (Macro)** | 36.72% |
| **Recall (Macro)** | 45.39% |
| **F1 Score (Macro)** | 31.00% |

> **Note on accuracy:** The dataset has severe class imbalance (75.8% Slight). A model naively predicting "Slight" every time would score ~76% accuracy but be useless for Fatal/Serious detection. The model is trained with balanced class weights, so macro metrics (especially Recall) are the meaningful evaluation dimension — the model deliberately trades raw accuracy for better minority-class detection.

### Top Model-Important Features (by importance score)

| Rank | Feature | Importance |
|---|---|---|
| 1 | `hour` | 21.2% |
| 2 | `speed_limit` | 20.7% |
| 3 | `urban_or_rural_area` | 15.9% |
| 4 | `light_conditions` | ~10% |
| 5 | `road_type` | ~7% |

---

## 🗂️ Project Structure

```
TRAFFICSAFE-AI/
├── backend/
│   └── main.py                  # FastAPI backend — all API endpoints
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router + Sidebar layout
│   │   ├── pages/
│   │   │   ├── Overview.tsx
│   │   │   ├── DataIntelligence.tsx
│   │   │   ├── ModelPerformance.tsx
│   │   │   ├── LivePrediction.tsx
│   │   │   ├── Explainability.tsx
│   │   │   └── DecisionSupport.tsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── ml/
│   └── train.py                 # Full training pipeline script
├── models/
│   ├── accident_severity_pipeline.pkl   # Saved Sklearn pipeline
│   ├── metrics.json             # Evaluation results
│   └── feature_importance.json  # Feature importance scores
├── data/
│   └── dft-road-casualty-statistics-collision-2025.csv
├── requirements.txt
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **ML** | Python, Scikit-learn, Pandas, NumPy, Joblib |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **HTTP** | Axios |

---

## 🏗️ Architecture

```
Browser (localhost:5173)
        │
        │  HTTP / REST
        ▼
FastAPI Backend (localhost:8000)
        │
        ├── /api/health              → Model status
        ├── /api/metrics             → Evaluation results
        ├── /api/dataset/summary     → Dataset statistics
        ├── /api/feature-importance  → Top features
        ├── /api/decision-support    → Intervention recommendations
        └── /api/predict             → Live prediction
                │
                ▼
        Scikit-learn Pipeline (.pkl)
                │
                ├── ColumnTransformer (preprocessing)
                └── RandomForestClassifier
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Model load status |
| `GET` | `/api/metrics` | All evaluation metrics |
| `GET` | `/api/dataset/summary` | Dataset overview & distribution |
| `GET` | `/api/feature-importance` | Feature importance scores |
| `GET` | `/api/decision-support` | Ranked intervention recommendations |
| `POST` | `/api/predict` | Predict severity for a new scenario |

### POST `/api/predict` — Request Body

```json
{
  "road_type": 6,
  "speed_limit": 30,
  "light_conditions": 1,
  "weather_conditions": 1,
  "road_surface_conditions": 1,
  "urban_or_rural_area": 1,
  "day_of_week": 2,
  "time": "08:30"
}
```

### POST `/api/predict` — Response

```json
{
  "predicted_class": 3,
  "predicted_label": "Slight",
  "probabilities": {
    "Fatal": 0.04,
    "Serious": 0.21,
    "Slight": 0.75
  }
}
```

---

## 📱 Dashboard Pages

| Page | Route | Description |
|---|---|---|
| **Overview** | `/` | Hero metrics, system pipeline diagram |
| **Data Intelligence** | `/data` | Dataset stats, class imbalance, feature & leakage table |
| **Model Performance** | `/performance` | Accuracy, Precision, Recall, F1 from real evaluation |
| **Live Prediction** | `/predict` | Enter new scenario → real RF prediction + probabilities |
| **Explainability** | `/explainability` | Top 10 feature importance bar chart |
| **Decision Support** | `/decision` | Ranked interventions derived from feature importance |

---

## 🚀 Installation & Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### 1. Clone the repository
```powershell
git clone https://github.com/suwetha08/TRAFFICSAFE-AI.git
cd TRAFFICSAFE-AI
```

### 2. Download the dataset
Download the DfT collision CSV from:
https://data.dft.gov.uk/road-accidents-safety-data/dft-road-casualty-statistics-collision-last-5-years.csv

Save it as:
```
data/dft-road-casualty-statistics-collision-2025.csv
```

### 3. Train the model
```powershell
pip install -r requirements.txt
Set-Location ml
python train.py
```
This generates `models/accident_severity_pipeline.pkl`, `models/metrics.json`, and `models/feature_importance.json`.

### 4. Start the Backend API
Open a terminal:
```powershell
Set-Location backend
python -m uvicorn main:app --port 8000 --reload
```
API available at: **http://localhost:8000**
Swagger docs at: **http://localhost:8000/docs**

### 5. Start the Frontend Dashboard
Open a second terminal:
```powershell
Set-Location frontend
npm install
npm run dev
```
Dashboard available at: **http://localhost:5173**

---

## 🧪 Testing

### Backend Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/health"
```

### Test Prediction API
```powershell
$body = '{"road_type":6,"speed_limit":70,"light_conditions":6,"weather_conditions":2,"road_surface_conditions":2,"urban_or_rural_area":2,"day_of_week":7,"time":"23:00"}'
Invoke-RestMethod -Uri "http://localhost:8000/api/predict" -Method POST -Body $body -ContentType "application/json"
```

### Frontend
Navigate to `http://localhost:5173` and use the **Live Prediction** page to enter any accident scenario and receive a real prediction.

---

## 📌 Git & GitHub

```powershell
# Clone
git clone https://github.com/suwetha08/TRAFFICSAFE-AI.git

# Check commit history
git log --oneline
```

**Repository:** https://github.com/suwetha08/TRAFFICSAFE-AI

---

## ⚠️ Disclaimer

Feature importance indicates which variables the Random Forest model relied upon most during training. It does **not** establish causation. These results are intended as data-driven starting points for traffic safety analysis, not as definitive causal evidence.

---

*Built for the College Data Science Hackathon — Challenge 58: Traffic Accident Severity Prediction*
