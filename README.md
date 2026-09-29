# TrafficSafe AI: Traffic Accident Severity Prediction

An explainable machine-learning system that analyzes accident-related conditions and predicts accident severity using a Random Forest model.

## Features
- **Data Intelligence**: Interactive overview of the DfT accident dataset.
- **Model Performance**: Evaluation metrics (Accuracy, Precision, Recall, F1).
- **Live Prediction**: Predict accident severity based on a new accident scenario using the saved Random Forest pipeline.
- **Explainability**: Visualize feature importance to understand the model's decision-making process.
- **Decision Support**: Strategic intervention recommendations.

## Project Structure
- `backend/`: FastAPI backend service for predictions and serving ML metrics.
- `frontend/`: React + TypeScript frontend dashboard.
- `ml/`: Data processing and model training scripts.
- `models/`: Saved `accident_severity_pipeline.pkl` and JSON metrics.
- `data/`: Location of the DfT dataset.

## How to Run Locally

### 1. Backend API
Open a terminal and run:
```powershell
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```
API is available at `http://localhost:8000`

### 2. Frontend Dashboard
Open a new terminal and run:
```powershell
cd frontend
npm install
npm run dev
```
Dashboard is available at `http://localhost:5173`

## Training the Model
```powershell
cd ml
python train.py
```
