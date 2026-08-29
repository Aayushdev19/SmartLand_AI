import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent
MODEL_DIR = BASE_DIR / "ml" / "model"

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

APP_TITLE = "SmartLand AI API"
APP_DESCRIPTION = "Property valuation API powered by ML"
APP_VERSION = "1.0.0"
