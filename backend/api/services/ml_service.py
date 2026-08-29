import json
from pathlib import Path
from typing import Optional
import joblib
import numpy as np
import pandas as pd
from api.core.config import MODEL_DIR

model = joblib.load(MODEL_DIR / "model.pkl")
label_maps = joblib.load(MODEL_DIR / "label_maps.pkl")

with open(MODEL_DIR / "metadata.json") as f:
    meta = json.load(f)

with open(MODEL_DIR / "analytics.json") as f:
    analytics_data = json.load(f)

FEATURES = meta["features"]
CAT_COLS = meta["cat_cols"]
YEAR_MIN = meta["year_min"]

def encode_label(col: str, value: str) -> int:
    mapping = label_maps.get(col, {})
    return mapping.get(str(value), 0)

def build_features(
    district: str,
    locality: str,
    area_category: str,
    land_type: str,
    jantri_price: float,
    year: int,
) -> pd.DataFrame:
    year_norm = year - YEAR_MIN
    jantri_market_ratio = jantri_price / (jantri_price * 1.15 + 1)

    row = {
        "District": encode_label("District", district),
        "Locality": encode_label("Locality", locality),
        "Area_Category": encode_label("Area_Category", area_category),
        "Land_Type": encode_label("Land_Type", land_type),
        "Jantri_Price_sq_m": jantri_price,
        "year_norm": year_norm,
        "jantri_market_ratio": jantri_market_ratio,
    }
    return pd.DataFrame([row], columns=FEATURES)

def investment_score(
    market_price: float,
    jantri_price: float,
    district: str,
    land_type: str,
) -> float:
    premium = (market_price - jantri_price) / (jantri_price + 1)
    score = min(10.0, max(0.0, 5.0 + premium * 10))
    if land_type.lower() == "commercial":
        score = min(10.0, score + 0.5)
    return round(score, 1)

def risk_level(market_price: float, jantri_price: float) -> str:
    ratio = market_price / (jantri_price + 1)
    if ratio < 1.2:
        return "Low"
    elif ratio < 1.8:
        return "Medium"
    return "High"

def price_forecast(current_price: float, growth_rate: float = 0.08):
    return {
        "1yr": round(current_price * (1 + growth_rate) ** 1),
        "3yr": round(current_price * (1 + growth_rate) ** 3),
        "5yr": round(current_price * (1 + growth_rate) ** 5),
        "10yr": round(current_price * (1 + growth_rate) ** 10),
    }

def get_locality_coords(locality: str):
    locality_coords = {
        "Alkapuri": {"lat": 22.3119, "lng": 73.1723},
        "Atladara": {"lat": 22.2679, "lng": 73.2012},
        "Bajwa": {"lat": 22.3956, "lng": 73.2145},
        "Diwalipura": {"lat": 22.3267, "lng": 73.1534},
        "Fatehgunj": {"lat": 22.3217, "lng": 73.1855},
        "Gotri": {"lat": 22.3356, "lng": 73.1423},
        "Gotri Road": {"lat": 22.3301, "lng": 73.1389},
        "Jambuva": {"lat": 22.3745, "lng": 73.1956},
        "Kalali": {"lat": 22.3534, "lng": 73.2089},
        "Karelibaug": {"lat": 22.3089, "lng": 73.2012},
        "Makarpura": {"lat": 22.2578, "lng": 73.1867},
        "Maneja": {"lat": 22.2712, "lng": 73.1623},
        "Manjalpur": {"lat": 22.2845, "lng": 73.1756},
        "Padra Road": {"lat": 22.2623, "lng": 73.1445},
        "Por": {"lat": 22.3823, "lng": 73.1234},
        "Sevasi": {"lat": 22.3412, "lng": 73.1189},
        "Subhanpura": {"lat": 22.3178, "lng": 73.1612},
        "Tarsali": {"lat": 22.2934, "lng": 73.2156},
        "Vasna Road": {"lat": 22.3023, "lng": 73.1534},
        "Waghodia Road": {"lat": 22.3289, "lng": 73.2278},
    }
    return locality_coords.get(locality, {"lat": 22.3119, "lng": 73.1723})
