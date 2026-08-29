from fastapi import APIRouter
from api.services.ml_service import (
    model,
    build_features,
    investment_score,
    risk_level,
)

router = APIRouter(tags=["Compare"])

@router.get("/compare")
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
    def predict_one(district, land_type, jantri):
        X = build_features(
            district=district,
            locality=district,
            area_category="Urban",
            land_type=land_type,
            jantri_price=jantri,
            year=year,
        )
        price = float(model.predict(X)[0])
        return {
            "district": district,
            "land_type": land_type,
            "jantri_price_sqm": jantri,
            "market_price_sqm": round(price, 2),
            "total_value": round(price * area_sqm),
            "premium_pct": round(((price - jantri) / (jantri + 1)) * 100, 2),
            "investment_score": investment_score(price, jantri, district, land_type),
            "risk_level": risk_level(price, jantri),
        }

    p1 = predict_one(district1, land_type1, jantri1)
    p2 = predict_one(district2, land_type2, jantri2)

    better = district1 if p1["investment_score"] >= p2["investment_score"] else district2

    return {
        "property_1": p1,
        "property_2": p2,
        "recommended": better,
    }
