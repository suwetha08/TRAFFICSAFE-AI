import pandas as pd
import numpy as np
import json
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

print("Loading data...")
df = pd.read_csv('../data/dft-road-casualty-statistics-collision-2025.csv', low_memory=False)

# Downsample the majority class (Slight) to balance training time
print("Downsampling to speed up training...")
class_1 = df[df['collision_severity'] == 1]
class_2 = df[df['collision_severity'] == 2]
class_3 = df[df['collision_severity'] == 3].sample(n=30000, random_state=42)

df_balanced = pd.concat([class_1, class_2, class_3]).sample(frac=1, random_state=42).reset_index(drop=True)

# Feature engineering
print("Feature Engineering...")
df_balanced['hour'] = pd.to_datetime(df_balanced['time'], format='%H:%M', errors='coerce').dt.hour
df_balanced['hour'].fillna(12, inplace=True) # Impute missing hours with noon

# Select features based on relevance and availability at prediction time
features = [
    'road_type', 
    'speed_limit', 
    'light_conditions', 
    'weather_conditions', 
    'road_surface_conditions', 
    'urban_or_rural_area', 
    'day_of_week', 
    'hour'
]
target = 'collision_severity'

# Clean data (drop na for these specific features)
df_clean = df_balanced.dropna(subset=features + [target])

X = df_clean[features]
y = df_clean[target]

# Identify categorical and numerical features
categorical_features = ['road_type', 'light_conditions', 'weather_conditions', 'road_surface_conditions', 'urban_or_rural_area', 'day_of_week']
numerical_features = ['speed_limit', 'hour']

# Build pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, max_depth=15, class_weight='balanced', random_state=42, n_jobs=-1))
])

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("Training Random Forest...")
pipeline.fit(X_train, y_train)

print("Evaluating...")
y_pred = pipeline.predict(X_test)

metrics = {
    'accuracy': accuracy_score(y_test, y_pred),
    'precision_macro': precision_score(y_test, y_pred, average='macro'),
    'recall_macro': recall_score(y_test, y_pred, average='macro'),
    'f1_macro': f1_score(y_test, y_pred, average='macro'),
    'classification_report': classification_report(y_test, y_pred, output_dict=True),
    'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
}

# Feature Importance
importances = pipeline.named_steps['classifier'].feature_importances_
feature_names = numerical_features + list(pipeline.named_steps['preprocessor'].named_transformers_['cat'].get_feature_names_out(categorical_features))

fi_df = pd.DataFrame({'feature': feature_names, 'importance': importances})
fi_df = fi_df.sort_values('importance', ascending=False).head(20)

fi_json = fi_df.to_dict('records')

print("Saving models and metrics...")
os.makedirs('../models', exist_ok=True)
joblib.dump(pipeline, '../models/accident_severity_pipeline.pkl')
with open('../models/metrics.json', 'w') as f:
    json.dump(metrics, f)
with open('../models/feature_importance.json', 'w') as f:
    json.dump(fi_json, f)

print("Done!")
