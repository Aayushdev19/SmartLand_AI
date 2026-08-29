from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.core.config import APP_TITLE, APP_DESCRIPTION, APP_VERSION, CORS_ORIGINS
from api.routers import health, valuation, analytics, lookup, compare

app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(valuation.router)
app.include_router(analytics.router)
app.include_router(lookup.router)
app.include_router(compare.router)
