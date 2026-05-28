"""FastAPI entrypoint for the F.R.E.S.H AI service.

Designed to be run from the AI/ directory directly:
    uvicorn main:app --host 0.0.0.0 --port $PORT
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import UnidentifiedImageError
from pydantic import BaseModel, Field

# Make sibling packages importable when uvicorn is launched with `main:app`
# from inside the AI/ directory (Railway/Render style deploys).
_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))


app = FastAPI(title="F.R.E.S.H AI Service", version="2.1.0")

# CORS — allow localhost and any host explicitly listed via AI_CORS_ORIGINS.
_DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
]
_extra_origins = [
    origin.strip()
    for origin in (os.getenv("AI_CORS_ORIGINS", "").split(","))
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_DEFAULT_ORIGINS + _extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = _HERE / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _persist_upload(filename: str, content: bytes) -> Path:
    suffix = Path(filename or "").suffix or ".bin"
    target = UPLOAD_DIR / f"{uuid4().hex}{suffix}"
    target.write_bytes(content)
    return target


def _predict_image_classifier(image_path: Path):
    from services.predict import predict_uploaded_image
    return predict_uploaded_image(image_path)


def _generate_recipe_recommendation(predicted_class: str):
    from services.recommendation import generate_recommendation
    return generate_recommendation(predicted_class)


def _get_nutrition_info(predicted_class: str):
    from services.nutrition import nutrition_service
    return nutrition_service.get_nutrition_info(predicted_class)


def _predict_risk(**kwargs):
    from services.risk_predictor import predict_risk
    return predict_risk(**kwargs)


def _recommend_for_inventories(items):
    from services.risk_predictor import recommend_for_inventories
    return recommend_for_inventories(items)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class PredictRiskBody(BaseModel):
    food_name: str | None = None
    category: str | None = None
    quantity: float | int | str | None = None
    unit: str | None = None
    purchase_date: str | None = None
    storage_condition: str | None = None
    storage_type: str | None = None
    shelf_life: int | None = Field(default=None, ge=0)


class InventoryItem(BaseModel):
    id: int | str | None = None
    food_name: str | None = None
    category: str | None = None
    quantity: float | int | str | None = None
    unit: str | None = None
    purchase_date: str | None = None
    expiry_date: str | None = None
    days_left: int | None = None
    storage_location: str | None = None
    storage_condition: str | None = None
    status: str | None = None
    shelf_life: int | None = None


class RecommendBody(BaseModel):
    user_id: int | str | None = None
    inventories: list[InventoryItem] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "message": "F.R.E.S.H AI service is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict[str, Any]:
    """Vision classifier used by the notebook/demo flow."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar.")

    content = await file.read()
    saved_path = _persist_upload(file.filename or "upload", content)

    try:
        prediction = _predict_image_classifier(saved_path)
        recommendation = _generate_recipe_recommendation(prediction["predicted_class"])
        nutrition = _get_nutrition_info(prediction["predicted_class"])
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="File gambar tidak valid.") from exc

    return {
        "filename": file.filename,
        "prediction": {
            "label": prediction["predicted_class"],
            "confidence": prediction["confidence"],
        },
        "recommendation": recommendation,
        "nutrition": nutrition,
    }


@app.post("/scan")
async def scan(
    image: UploadFile | None = File(default=None),
    file: UploadFile | None = File(default=None),
) -> dict[str, Any]:
    """Scanner pipeline used by the backend.

    Accepts the multipart field as either `image` (production) or `file`.
    Returns a single JSON shape that combines vision classification,
    shelf-life estimation, and AI-generated recommendations.
    """
    upload = image or file
    if upload is None:
        raise HTTPException(status_code=400, detail="Field 'image' wajib disertakan.")
    if not upload.content_type or not upload.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar.")

    content = await upload.read()
    saved_path = _persist_upload(upload.filename or "upload", content)

    try:
        prediction = _predict_image_classifier(saved_path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="File gambar tidak valid.") from exc

    detected_food = prediction["predicted_class"]
    confidence = float(prediction["confidence"])
    probabilities = prediction.get("probabilities", {})

    # Build top-3 predictions sorted by probability.
    sorted_probs = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)[:3]
    top_predictions = [
        {
            "label": label,
            "confidence": float(score),
            "percent": round(float(score) * 100, 2),
        }
        for label, score in sorted_probs
    ]

    risk = _predict_risk(
        food_name=detected_food,
        category=None,
        quantity=1,
        storage_condition="Suhu ruang",
        purchase_date=None,
    )

    confidence_threshold = float(os.getenv("AI_SCAN_CONFIDENCE_THRESHOLD", "0.45"))
    is_low_confidence = confidence < confidence_threshold

    try:
        recipe_payload = _generate_recipe_recommendation(detected_food)
    except Exception:
        recipe_payload = None

    recommendations = list(risk.recommendations)
    if isinstance(recipe_payload, dict) and recipe_payload.get("text"):
        recommendations.insert(0, recipe_payload["text"])

    return {
        "detected_food": detected_food,
        "category": risk.category,
        "confidence": confidence,
        "confidence_threshold": confidence_threshold,
        "is_low_confidence": is_low_confidence,
        "needs_review": is_low_confidence,
        "source": "tensorflow_vision_model",
        "estimated_shelf_life_days": risk.shelf_life_days,
        "shelf_life": risk.shelf_life_days,
        "risk_label": risk.risk_label,
        "risk_score": risk.risk_score,
        "risk_drivers": risk.drivers,
        "storage_advice": risk.storage_advice,
        "recommendations": recommendations,
        "top_predictions": top_predictions,
    }


@app.post("/predict-risk")
def predict_risk_endpoint(body: PredictRiskBody) -> dict[str, Any]:
    """Heuristic risk predictor used by the inventory creation flow."""
    risk = _predict_risk(
        food_name=body.food_name,
        category=body.category,
        quantity=body.quantity,
        unit=body.unit,
        purchase_date=body.purchase_date,
        storage_condition=body.storage_condition,
        storage_type=body.storage_type,
        shelf_life_override=body.shelf_life,
    )
    return risk.to_dict()


@app.post("/recommend")
def recommend_endpoint(body: RecommendBody) -> dict[str, Any]:
    """Bulk recommendation endpoint for the rekomendasi page."""
    items = [item.model_dump() for item in body.inventories]
    recommendations = _recommend_for_inventories(items)
    return {
        "user_id": body.user_id,
        "count": len(recommendations),
        "recommendations": recommendations,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
