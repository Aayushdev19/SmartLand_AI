from typing import Optional
import pandas as pd
from fastapi import APIRouter
from api.services.ml_service import (
    meta,
    model,
    FEATURES,
    encode_label,
    get_locality_coords,
)

router = APIRouter(prefix="/lookup", tags=["Lookup"])

@router.get("/districts")
def get_districts():
    return {"districts": meta["districts"]}

@router.get("/localities")
def get_localities(district: Optional[str] = None):
    return {"localities": meta["localities"]}

@router.get("/localities/geo")
def get_localities_geo():
    rows = []
    localities = meta["localities"]
    for locality in localities:
        year_norm = 2024 - meta["year_min"]
        jantri = 8500
        jantri_market_ratio = jantri / (jantri * 1.15 + 1)
        rows.append({
            "District": encode_label("District", "Vadodara"),
            "Locality": encode_label("Locality", locality),
            "Area_Category": encode_label("Area_Category", "Urban"),
            "Land_Type": encode_label("Land_Type", "Residential"),
            "Jantri_Price_sq_m": jantri,
            "year_norm": year_norm,
            "jantri_market_ratio": jantri_market_ratio,
        })

    batch_df = pd.DataFrame(rows, columns=FEATURES)
    prices = model.predict(batch_df).tolist()

    result = []
    for i, locality in enumerate(localities):
        coords = get_locality_coords(locality)
        result.append({
            "locality": locality,
            "district": "Vadodara",
            "lat": coords["lat"],
            "lng": coords["lng"],
            "predicted_price_sqm": round(prices[i]),
            "land_type": "Residential",
            "jantri_rate": 8500,
        })

    return {"localities": result}

@router.get("/options")
def get_options():
    return {
        "districts": meta["districts"],
        "localities": meta["localities"],
        "land_types": meta["land_types"],
        "area_categories": meta["area_categories"],
        "year_range": {"min": meta["year_min"], "max": 2025},
    }
