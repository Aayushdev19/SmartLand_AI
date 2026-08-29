from fastapi import APIRouter
from api.services.ml_service import meta

router = APIRouter(tags=["Health"])

@router.get("/")
def root():
    return {
        "status": "ok",
        "service": "SmartLand AI API",
        "model": meta["best_model"],
        "r2": meta["metrics"]["r2"],
        "mae": meta["metrics"]["mae"],
    }

@router.get("/health")
def health():
    return {"status": "healthy"}
