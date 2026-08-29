from fastapi import APIRouter
from api.services.ml_service import analytics_data, meta

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def analytics_summary():
    by_district = analytics_data["by_district"]
    by_year = analytics_data["by_year"]
    by_ltype = analytics_data["by_land_type"]
    by_cat = analytics_data["by_area_category"]
    jv = analytics_data["jantri_vs_market"]

    top_areas = sorted(by_district, key=lambda x: x["avg_price"], reverse=True)[:10]

    return {
        "top_areas": top_areas,
        "by_land_type": by_ltype,
        "by_area_category": by_cat,
        "price_by_year": by_year,
        "jantri_vs_market": jv,
        "total_districts": len(by_district),
        "model_r2": meta["metrics"]["r2"],
        "model_mae": meta["metrics"]["mae"],
    }

@router.get("/trends")
def analytics_trends():
    jv = analytics_data["jantri_vs_market"]
    return {
        "yearly_trend": jv,
        "by_land_type": analytics_data["by_land_type"],
    }
