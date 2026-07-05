"""
SmartLand AI — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""

import json
import math
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Paths ────────────────────────────────────────────
MODEL_DIR = Path(__file__).parent.parent / "ml" / "model"

# ── Load model & metadata on startup ─────────────────
model      = joblib.load(MODEL_DIR / "model.pkl")
label_maps = joblib.load(MODEL_DIR / "label_maps.pkl")

with open(MODEL_DIR / "metadata.json") as f:
    meta = json.load(f)

with open(MODEL_DIR / "analytics.json") as f:
    analytics_data = json.load(f)

FEATURES = meta["features"]
CAT_COLS = meta["cat_cols"]
YEAR_MIN = meta["year_min"]

# ── App ──────────────────────────────────────────────
app = FastAPI(
    title="SmartLand AI API",
    description="Property valuation API powered by ML",
    version="1.0.0",
)

import os

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helper: safe label encode ─────────────────────────
def encode_label(col: str, value: str) -> int:
    """Return encoded value; fall back to 0 for unseen labels."""
    mapping = label_maps.get(col, {})
    return mapping.get(str(value), 0)

# ── Helper: build feature row ─────────────────────────
def build_features(
    district: str,
    locality: str,
    area_category: str,
    land_type: str,
    jantri_price: float,
    year: int,
) -> pd.DataFrame:
    year_norm = year - YEAR_MIN
    jantri_market_ratio = jantri_price / (jantri_price * 1.15 + 1)  # estimate

    row = {
        "District":            encode_label("District", district),
        "Locality":            encode_label("Locality", locality),
        "Area_Category":       encode_label("Area_Category", area_category),
        "Land_Type":           encode_label("Land_Type", land_type),
        "Jantri_Price_sq_m":   jantri_price,
        "year_norm":           year_norm,
        "jantri_market_ratio": jantri_market_ratio,
    }
    return pd.DataFrame([row], columns=FEATURES)

# ── Helper: investment score ──────────────────────────
def investment_score(
    market_price: float,
    jantri_price: float,
    district: str,
    land_type: str,
) -> float:
    """Simple rule-based investment score 0–10."""
    premium = (market_price - jantri_price) / (jantri_price + 1)
    # Higher premium = higher demand zone
    score = min(10.0, max(0.0, 5.0 + premium * 10))
    # Commercial gets a small boost
    if land_type.lower() == "commercial":
        score = min(10.0, score + 0.5)
    return round(score, 1)

# ── Helper: risk level ────────────────────────────────
def risk_level(market_price: float, jantri_price: float) -> str:
    ratio = market_price / (jantri_price + 1)
    if ratio < 1.2:
        return "Low"
    elif ratio < 1.8:
        return "Medium"
    return "High"

# ── Helper: forecast ─────────────────────────────────
def price_forecast(current_price: float, growth_rate: float = 0.08):
    """Compound growth forecast."""
    return {
        "1yr":  round(current_price * (1 + growth_rate) ** 1),
        "3yr":  round(current_price * (1 + growth_rate) ** 3),
        "5yr":  round(current_price * (1 + growth_rate) ** 5),
        "10yr": round(current_price * (1 + growth_rate) ** 10),
    }


# ══════════════════════════════════════════════════════
# ── Request / Response Models ─────────────────────────
# ══════════════════════════════════════════════════════

class PredictRequest(BaseModel):
    district:       str  = Field(..., example="Ahmedabad")
    locality:       str  = Field(..., example="Satellite")
    area_category:  str  = Field("Urban", example="Urban")
    land_type:      str  = Field("Residential", example="Residential")
    jantri_price:   float = Field(..., example=8500, description="Jantri rate ₹/sq m")
    year:           int   = Field(2024, example=2024)
    area_sqm:       Optional[float] = Field(None, example=150, description="Total area sq m")

class PredictResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    predicted_price_sqm:   float
    jantri_price_sqm:      float
    market_premium_pct:    float
    confidence_score:      int
    investment_score:      float
    risk_level:            str
    total_value:           Optional[float]
    forecast:              dict
    growth_rate_pct:       float
    model_used:            str
    mae:                   float
    r2:                    float


# ══════════════════════════════════════════════════════
# ── Endpoints ─────────────────────────────────────────
# ══════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "service": "SmartLand AI API",
        "model": meta["best_model"],
        "r2": meta["metrics"]["r2"],
        "mae": meta["metrics"]["mae"],
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}


@app.post("/predict", response_model=PredictResponse, tags=["Valuation"])
def predict(req: PredictRequest):
    """
    Predict market price per sq m for a given property.
    """
    try:
        X = build_features(
            district=req.district,
            locality=req.locality,
            area_category=req.area_category,
            land_type=req.land_type,
            jantri_price=req.jantri_price,
            year=req.year,
        )
        pred_price = float(model.predict(X)[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    premium_pct = ((pred_price - req.jantri_price) / (req.jantri_price + 1)) * 100
    inv_score   = investment_score(pred_price, req.jantri_price, req.district, req.land_type)
    risk        = risk_level(pred_price, req.jantri_price)

    # Confidence: base 80, +/- based on R²
    confidence = min(98, int(80 + meta["metrics"]["r2"] * 18))

    # Annual growth rate estimate based on land type
    growth_map  = {"Residential": 0.08, "Commercial": 0.10, "Agricultural": 0.05, "Industrial": 0.09}
    growth_rate = growth_map.get(req.land_type, 0.08)
    forecast    = price_forecast(pred_price, growth_rate)

    total_value = round(pred_price * req.area_sqm) if req.area_sqm else None

    return PredictResponse(
        predicted_price_sqm  = round(pred_price, 2),
        jantri_price_sqm     = req.jantri_price,
        market_premium_pct   = round(premium_pct, 2),
        confidence_score     = confidence,
        investment_score     = inv_score,
        risk_level           = risk,
        total_value          = total_value,
        forecast             = forecast,
        growth_rate_pct      = round(growth_rate * 100, 1),
        model_used           = meta["best_model"],
        mae                  = round(meta["metrics"]["mae"], 2),
        r2                   = round(meta["metrics"]["r2"], 4),
    )


@app.get("/jantri", tags=["Jantri"])
def get_jantri(district: str, land_type: str = "Residential"):
    """
    Return Jantri (government guideline) rate for a district + land type.
    Derived from training data statistics.
    """
    by_district = {d["District"]: d for d in analytics_data["by_district"]}
    if district not in by_district:
        # fuzzy fallback — find closest
        available = list(by_district.keys())
        match = next((d for d in available if district.lower() in d.lower()), available[0] if available else None)
        district = match

    if not district or district not in by_district:
        raise HTTPException(status_code=404, detail="District not found")

    dist_data    = by_district[district]
    avg_market   = dist_data["avg_price"]
    # Jantri is typically 60-75% of market
    jantri_est   = round(avg_market * 0.68)

    return {
        "district":         district,
        "land_type":        land_type,
        "jantri_rate_sqm":  jantri_est,
        "avg_market_sqm":   round(avg_market),
        "premium_pct":      round(((avg_market - jantri_est) / (jantri_est + 1)) * 100, 1),
        "transactions":     dist_data["transactions"],
    }


@app.get("/analytics/summary", tags=["Analytics"])
def analytics_summary():
    """Overall market analytics summary."""
    by_district = analytics_data["by_district"]
    by_year     = analytics_data["by_year"]
    by_ltype    = analytics_data["by_land_type"]
    by_cat      = analytics_data["by_area_category"]
    jv          = analytics_data["jantri_vs_market"]

    # Top areas by avg price
    top_areas = sorted(by_district, key=lambda x: x["avg_price"], reverse=True)[:10]

    return {
        "top_areas":           top_areas,
        "by_land_type":        by_ltype,
        "by_area_category":    by_cat,
        "price_by_year":       by_year,
        "jantri_vs_market":    jv,
        "total_districts":     len(by_district),
        "model_r2":            meta["metrics"]["r2"],
        "model_mae":           meta["metrics"]["mae"],
    }


@app.get("/analytics/trends", tags=["Analytics"])
def analytics_trends():
    """Year-over-year price trends."""
    jv = analytics_data["jantri_vs_market"]
    return {
        "yearly_trend": jv,
        "by_land_type": analytics_data["by_land_type"],
    }


@app.get("/lookup/districts", tags=["Lookup"])
def get_districts():
    """All available districts."""
    return {"districts": meta["districts"]}


@app.get("/lookup/localities", tags=["Lookup"])
def get_localities(district: Optional[str] = None):
    """All localities (optionally filter by district)."""
    return {"localities": meta["localities"]}


@app.get("/lookup/localities/geo", tags=["Lookup"])
def get_localities_geo():
    """Localities with GPS coordinates and pre-computed ML price (batched, cached)."""
    locality_coords = {
        "Alkapuri":      {"lat": 22.3119, "lng": 73.1723},
        "Atladara":      {"lat": 22.2679, "lng": 73.2012},
        "Bajwa":         {"lat": 22.3956, "lng": 73.2145},
        "Diwalipura":    {"lat": 22.3267, "lng": 73.1534},
        "Fatehgunj":     {"lat": 22.3217, "lng": 73.1855},
        "Gotri":         {"lat": 22.3356, "lng": 73.1423},
        "Gotri Road":    {"lat": 22.3301, "lng": 73.1389},
        "Jambuva":       {"lat": 22.3745, "lng": 73.1956},
        "Kalali":        {"lat": 22.3534, "lng": 73.2089},
        "Karelibaug":    {"lat": 22.3089, "lng": 73.2012},
        "Makarpura":     {"lat": 22.2578, "lng": 73.1867},
        "Maneja":        {"lat": 22.2712, "lng": 73.1623},
        "Manjalpur":     {"lat": 22.2845, "lng": 73.1756},
        "Padra Road":    {"lat": 22.2623, "lng": 73.1445},
        "Por":           {"lat": 22.3823, "lng": 73.1234},
        "Sevasi":        {"lat": 22.3412, "lng": 73.1189},
        "Subhanpura":    {"lat": 22.3178, "lng": 73.1612},
        "Tarsali":       {"lat": 22.2934, "lng": 73.2156},
        "Vasna Road":    {"lat": 22.3023, "lng": 73.1534},
        "Waghodia Road": {"lat": 22.3289, "lng": 73.2278},
    }

    # Build ONE batch dataframe for all localities (single model call)
    rows = []
    localities = meta["localities"]
    for locality in localities:
        year_norm            = 2024 - meta["year_min"]
        jantri               = 8500
        jantri_market_ratio  = jantri / (jantri * 1.15 + 1)
        rows.append({
            "District":            encode_label("District",       "Vadodara"),
            "Locality":            encode_label("Locality",       locality),
            "Area_Category":       encode_label("Area_Category",  "Urban"),
            "Land_Type":           encode_label("Land_Type",      "Residential"),
            "Jantri_Price_sq_m":   jantri,
            "year_norm":           year_norm,
            "jantri_market_ratio": jantri_market_ratio,
        })

    batch_df = pd.DataFrame(rows, columns=FEATURES)
    prices   = model.predict(batch_df).tolist()  # single predict call

    result = []
    for i, locality in enumerate(localities):
        coords = locality_coords.get(locality, {"lat": 22.3119, "lng": 73.1723})
        result.append({
            "locality":            locality,
            "district":            "Vadodara",
            "lat":                 coords["lat"],
            "lng":                 coords["lng"],
            "predicted_price_sqm": round(prices[i]),
            "land_type":           "Residential",
            "jantri_rate":         8500,
        })

    return {"localities": result}


@app.get("/lookup/options", tags=["Lookup"])
def get_options():
    """All dropdown options for the prediction form."""
    return {
        "districts":       meta["districts"],
        "localities":      meta["localities"],
        "land_types":      meta["land_types"],
        "area_categories": meta["area_categories"],
        "year_range":      {"min": meta["year_min"], "max": 2025},
    }


@app.get("/compare", tags=["Compare"])
def compare_properties(
    district1: str,
    land_type1: str,
    jantri1: float,
    district2: str,
    land_type2: str,
    jantri2: float,
    year: int = 2024,
    area_sqm: float = 100,
):
    """
    Compare two properties side by side.
    """
    def predict_one(district, land_type, jantri):
        X = build_features(
            district=district,
            locality=district,          # use district as locality fallback
            area_category="Urban",
            land_type=land_type,
            jantri_price=jantri,
            year=year,
        )
        price = float(model.predict(X)[0])
        return {
            "district":           district,
            "land_type":          land_type,
            "jantri_price_sqm":   jantri,
            "market_price_sqm":   round(price, 2),
            "total_value":        round(price * area_sqm),
            "premium_pct":        round(((price - jantri) / (jantri + 1)) * 100, 2),
            "investment_score":   investment_score(price, jantri, district, land_type),
            "risk_level":         risk_level(price, jantri),
        }

    p1 = predict_one(district1, land_type1, jantri1)
    p2 = predict_one(district2, land_type2, jantri2)

    better = district1 if p1["investment_score"] >= p2["investment_score"] else district2

    return {
        "property_1":  p1,
        "property_2":  p2,
        "recommended": better,
    }
