import os
import sys
import json
import warnings
import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

warnings.filterwarnings("ignore")

BASE      = Path(__file__).parent
DATA      = BASE / "dataset" / "dataset.xlsx"
MODEL_DIR = BASE / "model"
MODEL_DIR.mkdir(exist_ok=True)

print("Loading dataset...")
df = pd.read_excel(DATA)
print(f"  Rows: {len(df)} | Columns: {list(df.columns)}")

df.dropna(subset=["Market_Price_sq_m", "Jantri_Price_sq_m"], inplace=True)

Q1 = df["Market_Price_sq_m"].quantile(0.01)
Q3 = df["Market_Price_sq_m"].quantile(0.99)
df = df[(df["Market_Price_sq_m"] >= Q1) & (df["Market_Price_sq_m"] <= Q3)]
print(f"  After cleaning: {len(df)} rows")

df["jantri_market_ratio"] = df["Jantri_Price_sq_m"] / (df["Market_Price_sq_m"] + 1)
df["year_norm"]           = df["Year"] - df["Year"].min()

FEATURES = [
    "District", "Locality", "Area_Category", "Land_Type",
    "Jantri_Price_sq_m", "year_norm", "jantri_market_ratio",
]
TARGET   = "Market_Price_sq_m"
CAT_COLS = ["District", "Locality", "Area_Category", "Land_Type"]
NUM_COLS = ["Jantri_Price_sq_m", "year_norm", "jantri_market_ratio"]

X = df[FEATURES].copy()
y = df[TARGET].copy()

label_maps = {}
for col in CAT_COLS:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    label_maps[col] = {cls: int(idx) for idx, cls in enumerate(le.classes_)}

joblib.dump(label_maps, MODEL_DIR / "label_maps.pkl")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

models = {
    "LinearRegression": LinearRegression(),
    "Ridge":            Ridge(alpha=1.0),
    "RandomForest":     RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42, n_jobs=-1),
    "GradientBoosting": GradientBoostingRegressor(n_estimators=300, learning_rate=0.05, max_depth=5, random_state=42),
}

print("\nTraining & evaluating models...")
results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae   = mean_absolute_error(y_test, preds)
    rmse  = np.sqrt(mean_squared_error(y_test, preds))
    r2    = r2_score(y_test, preds)
    results[name] = {"mae": mae, "rmse": rmse, "r2": r2}
    print(f"  {name:<25} MAE={mae:,.0f}  RMSE={rmse:,.0f}  R2={r2:.4f}")

best_name  = min(results, key=lambda k: results[k]["mae"])
best_model = models[best_name]
print(f"\nBest model: {best_name}  (MAE={results[best_name]['mae']:,.0f})")

joblib.dump(best_model, MODEL_DIR / "model.pkl")

metadata = {
    "best_model":      best_name,
    "features":        FEATURES,
    "cat_cols":        CAT_COLS,
    "num_cols":        NUM_COLS,
    "target":          TARGET,
    "metrics":         results[best_name],
    "all_results":     results,
    "train_rows":      len(X_train),
    "test_rows":       len(X_test),
    "districts":       sorted(df["District"].unique().tolist()),
    "localities":      sorted(df["Locality"].unique().tolist()),
    "land_types":      sorted(df["Land_Type"].unique().tolist()),
    "area_categories": sorted(df["Area_Category"].unique().tolist()),
    "year_min":        int(df["Year"].min()),
    "year_max":        int(df["Year"].max()),
    "jantri_min":      float(df["Jantri_Price_sq_m"].min()),
    "jantri_max":      float(df["Jantri_Price_sq_m"].max()),
    "price_min":       float(df["Market_Price_sq_m"].min()),
    "price_max":       float(df["Market_Price_sq_m"].max()),
}

with open(MODEL_DIR / "metadata.json", "w") as f:
    json.dump(metadata, f, indent=2, default=str)

analytics = {
    "by_district":    df.groupby("District")["Market_Price_sq_m"].agg(["mean", "min", "max", "count"]).round(0).reset_index().rename(columns={"mean": "avg_price", "min": "min_price", "max": "max_price", "count": "transactions"}).to_dict(orient="records"),
    "by_land_type":   df.groupby("Land_Type")["Market_Price_sq_m"].mean().round(0).to_dict(),
    "by_year":        df.groupby("Year")["Market_Price_sq_m"].mean().round(0).to_dict(),
    "by_area_category": df.groupby("Area_Category")["Market_Price_sq_m"].mean().round(0).to_dict(),
    "jantri_vs_market": df[["Year", "Jantri_Price_sq_m", "Market_Price_sq_m"]].groupby("Year").mean().round(0).reset_index().to_dict(orient="records"),
}

with open(MODEL_DIR / "analytics.json", "w") as f:
    json.dump(analytics, f, indent=2, default=str)

print(f"\nModel    → {MODEL_DIR / 'model.pkl'}")
print(f"Metadata → {MODEL_DIR / 'metadata.json'}")
print(f"Analytics → {MODEL_DIR / 'analytics.json'}")
print(f"\nMAE  : Rs.{results[best_name]['mae']:,.0f} / sq m")
print(f"RMSE : Rs.{results[best_name]['rmse']:,.0f} / sq m")
print(f"R2   : {results[best_name]['r2']:.4f}")
