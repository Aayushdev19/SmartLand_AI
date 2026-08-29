from fastapi import APIRouter, HTTPException
from api.schemas.valuation import PredictRequest, PredictResponse
from api.services.ml_service import (
    model,
    meta,
    analytics_data,
    build_features,
    investment_score,
    risk_level,
    price_forecast,
)

router = APIRouter(tags=["Valuation"])

@router.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
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
    inv_score = investment_score(pred_price, req.jantri_price, req.district, req.land_type)
    risk = risk_level(pred_price, req.jantri_price)
    confidence = min(98, int(80 + meta["metrics"]["r2"] * 18))

    growth_map = {"Residential": 0.08, "Commercial": 0.10, "Agricultural": 0.05, "Industrial": 0.09}
    growth_rate = growth_map.get(req.land_type, 0.08)
    forecast = price_forecast(pred_price, growth_rate)

    total_value = round(pred_price * req.area_sqm) if req.area_sqm else None

    return PredictResponse(
        predicted_price_sqm=round(pred_price, 2),
        jantri_price_sqm=req.jantri_price,
        market_premium_pct=round(premium_pct, 2),
        confidence_score=confidence,
        investment_score=inv_score,
        risk_level=risk,
        total_value=total_value,
        forecast=forecast,
        growth_rate_pct=round(growth_rate * 100, 1),
        model_used=meta["best_model"],
        mae=round(meta["metrics"]["mae"], 2),
        r2=round(meta["metrics"]["r2"], 4),
    )

@router.get("/jantri")
def get_jantri(district: str, land_type: str = "Residential"):
    by_district = {d["District"]: d for d in analytics_data["by_district"]}
    if district not in by_district:
        available = list(by_district.keys())
        match = next((d for d in available if district.lower() in d.lower()), available[0] if available else None)
        district = match

    if not district or district not in by_district:
        raise HTTPException(status_code=404, detail="District not found")

    dist_data = by_district[district]
    avg_market = dist_data["avg_price"]
    jantri_est = round(avg_market * 0.68)

    return {
        "district": district,
        "land_type": land_type,
        "jantri_rate_sqm": jantri_est,
        "avg_market_sqm": round(avg_market),
        "premium_pct": round(((avg_market - jantri_est) / (jantri_est + 1)) * 100, 1),
        "transactions": dist_data["transactions"],
    }
