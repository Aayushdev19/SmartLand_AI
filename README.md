# SmartLand AI 🏠

**AI-powered land and property valuation platform for Gujarat, India.**  
Predict market prices, compare properties, explore interactive maps, and analyze market trends — all backed by a trained ML model.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [ML Model](#ml-model)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

SmartLand AI combines a machine learning model trained on Gujarat land transaction data with a modern React frontend and a FastAPI backend. Users can input property details and receive an instant market price prediction, investment score, risk assessment, and a multi-year price forecast.

---

## Features

| Feature | Description |
|---|---|
| 🔮 **Price Prediction** | ML-based market price per sq m with confidence score |
| 📊 **Investment Score** | Rule-based 0–10 score derived from market premium |
| ⚠️ **Risk Assessment** | Low / Medium / High risk level based on Jantri vs market ratio |
| 📈 **Price Forecast** | Compound growth projections for 1, 3, 5, and 10 years |
| 🗺️ **Interactive Map** | Leaflet map showing predicted prices across localities |
| ⚖️ **Property Compare** | Side-by-side comparison of two properties |
| 📉 **Analytics Dashboard** | Charts for trends by year, land type, district, and area category |
| 👤 **Auth** | Login / Signup with protected routes |
| 📄 **PDF Export** | Export prediction results as a PDF report |

---

## Tech Stack

### Frontend
- **React 19** + **Vite 8**
- **Tailwind CSS 4**
- **React Router 7** — client-side routing
- **Recharts** — analytics charts
- **React Leaflet** — interactive map
- **Framer Motion** — page transitions
- **jsPDF** — PDF export

### Backend
- **FastAPI** — REST API
- **scikit-learn** — ML model (GradientBoosting / RandomForest)
- **pandas** + **numpy** — data processing
- **joblib** — model serialisation

---

## Project Structure

```
SmartLand-Ai/
├── backend/
│   ├── api/
│   │   └── main.py          # FastAPI app — all endpoints
│   └── ml/
│       ├── dataset/
│       │   └── dataset.xlsx  # Training data
│       ├── model/
│       │   ├── model.pkl        # Trained model
│       │   ├── label_maps.pkl   # Label encodings
│       │   ├── metadata.json    # Feature info & metrics
│       │   └── analytics.json   # Pre-computed analytics
│       └── train.py          # ML training script
│
└── smartland-ai/             # React frontend
    ├── src/
    │   ├── api/client.js     # API client (fetch wrapper)
    │   ├── components/       # Navbar, Footer, Logo
    │   ├── pages/            # One file per route
    │   ├── hooks/            # useApi, useAuth
    │   └── utils/            # auth helpers, PDF generator
    ├── public/
    ├── index.html
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **pip** (or a virtual environment tool like `venv` / `conda`)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# 3. Install dependencies
pip install fastapi uvicorn scikit-learn pandas numpy joblib openpyxl

# 4. Copy the env file
cp .env.example .env

# 5. (Optional) Re-train the model with your own data
python ml/train.py

# 6. Start the API server
uvicorn api.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd smartland-ai

# 2. Install dependencies
npm install

# 3. Copy and configure environment variables
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000 in .env

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## ML Model

The model is trained on Gujarat land transaction records with the following pipeline:

- **Target**: `Market_Price_sq_m` (market rate ₹/sq m)
- **Features**: District, Locality, Area Category, Land Type, Jantri Price, Year (normalised), Jantri-to-Market ratio
- **Models evaluated**: Linear Regression, Ridge, Random Forest, Gradient Boosting
- **Best model selected** automatically by lowest MAE on a 20% test split

To retrain with updated data, replace `backend/ml/dataset/dataset.xlsx` and run:

```bash
python backend/ml/train.py
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check + model info |
| `POST` | `/predict` | Predict market price |
| `GET` | `/jantri` | Get Jantri rate for a district |
| `GET` | `/analytics/summary` | Full analytics summary |
| `GET` | `/analytics/trends` | Year-over-year price trends |
| `GET` | `/compare` | Compare two properties |
| `GET` | `/lookup/options` | All dropdown options |
| `GET` | `/lookup/districts` | Available districts |
| `GET` | `/lookup/localities` | Available localities |
| `GET` | `/lookup/localities/geo` | Localities with GPS + predicted prices |

Full interactive documentation available at `http://localhost:8000/docs` when the server is running.

### Example Prediction Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "district": "Vadodara",
    "locality": "Alkapuri",
    "area_category": "Urban",
    "land_type": "Residential",
    "jantri_price": 8500,
    "year": 2024,
    "area_sqm": 150
  }'
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `APP_PORT` | `8000` | Server port |
| `APP_HOST` | `0.0.0.0` | Server host |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origins |

### Frontend (`smartland-ai/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is for educational and research purposes. See [LICENSE](LICENSE) for details.
