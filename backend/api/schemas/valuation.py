from typing import Optional
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    district: str = Field(...)
    locality: str = Field(...)
    area_category: str = Field("Urban")
    land_type: str = Field("Residential")
    jantri_price: float = Field(...)
    year: int = Field(2024)
    area_sqm: Optional[float] = Field(None)

class PredictResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    predicted_price_sqm: float
    jantri_price_sqm: float
    market_premium_pct: float
    confidence_score: int
    investment_score: float
    risk_level: str
    total_value: Optional[float]
    forecast: dict
    growth_rate_pct: float
    model_used: str
    mae: float
    r2: float
