"""
Heuristic shelf-life and food-waste risk predictor.

Deterministic, rule-based feature engineering layer designed
to support the F.R.E.S.H research questions:

    RQ1. Bagaimana memprediksi risiko food waste berdasarkan pola
         konsumsi dan masa simpan bahan makanan?
    RQ2. Fitur apa saja yang paling berpengaruh terhadap kemungkinan
         makanan terbuang?

It accepts the same feature set the backend already sends:
food_name, category, quantity, unit, purchase_date, storage_condition.

The output schema is shared between the inventory pipeline (`/predict-risk`)
and the AI scanner pipeline (`/scan`) so the frontend can render the
result consistently.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Iterable
import json
from pathlib import Path
from functools import lru_cache

@lru_cache
def _load_food_metadata() -> dict:
    metadata_path = Path(__file__).resolve().parent.parent / "model" / "food_metadata.json"
    if metadata_path.is_file():
        with metadata_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return {}

# ---------------------------------------------------------------------------
# Reference data (tuned from public Indonesian food-safety guidelines)
# ---------------------------------------------------------------------------
_DEFAULT_SHELF_LIFE = {
    "buah":    {"kulkas": 7,  "freezer": 30, "suhu ruang": 4},
    "sayur":   {"kulkas": 5,  "freezer": 30, "suhu ruang": 2},
    "protein": {"kulkas": 3,  "freezer": 90, "suhu ruang": 1},
    "daging":  {"kulkas": 3,  "freezer": 90, "suhu ruang": 1},
    "ikan":    {"kulkas": 2,  "freezer": 90, "suhu ruang": 1},
    "susu":    {"kulkas": 7,  "freezer": 30, "suhu ruang": 1},
    "olahan":  {"kulkas": 5,  "freezer": 60, "suhu ruang": 3},
    "roti":    {"kulkas": 7,  "freezer": 30, "suhu ruang": 3},
    "minuman": {"kulkas": 14, "freezer": 60, "suhu ruang": 7},
    "lainnya": {"kulkas": 7,  "freezer": 30, "suhu ruang": 5},
}

_FOOD_ADJUSTMENT = {
    "apel":        2,
    "pisang":     -1,
    "tomat":      -1,
    "alpukat":    -1,
    "bayam":      -2,
    "kangkung":   -1,
    "tahu":       -1,
    "tempe":       0,
    "telur":      14,
    "yogurt":     -2,
    "ikan":       -1,
    "ayam":       -1,
    "daging sapi": -1,
}

_RISK_HIGH_DAYS = 2
_RISK_WARNING_DAYS = 5


@dataclass
class RiskPrediction:
    food_name: str
    category: str
    storage_condition: str
    shelf_life_days: int
    days_left: int
    risk_label: str
    risk_score: float
    drivers: list[str]
    storage_advice: str
    recommendations: list[str]
    expiry_date: str

    def to_dict(self) -> dict:
        return {
            "food_name": self.food_name,
            "category": self.category,
            "storage_condition": self.storage_condition,
            "shelf_life": self.shelf_life_days,
            "shelf_life_days": self.shelf_life_days,
            "estimated_shelf_life_days": self.shelf_life_days,
            "days_left": self.days_left,
            "risk_label": self.risk_label,
            "risk_score": self.risk_score,
            "risk_drivers": self.drivers,
            "storage_advice": self.storage_advice,
            "recommendations": self.recommendations,
            "expiry_date": self.expiry_date,
        }


def _normalize(value: str | None) -> str:
    return (value or "").strip().lower()


def _resolve_storage_key(storage: str) -> str:
    s = _normalize(storage)
    if "freezer" in s or "beku" in s:
        return "freezer"
    if "kulkas" in s or "fridge" in s or "chiller" in s:
        return "kulkas"
    return "suhu ruang"


def _resolve_category_key(category: str) -> str:
    c = _normalize(category)
    if c in _DEFAULT_SHELF_LIFE:
        return c
    if c in {"vegetable", "vegetables", "sayuran"}:
        return "sayur"
    if c in {"fruit", "fruits", "buah-buahan"}:
        return "buah"
    if c in {"meat", "daging-dagingan"}:
        return "protein"
    if c in {"dairy", "susu-susu"}:
        return "susu"
    return "lainnya"


def _parse_purchase_date(value: str | None) -> datetime:
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    if not value:
        return today
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(str(value)[:10], fmt)
        except ValueError:
            continue
    return today


def _build_recommendations(food_name: str, risk_label: str) -> list[str]:
    name = food_name.strip().title() if food_name else "Bahan ini"
    if risk_label == "high":
        return [
            f"Olah {name} hari ini menjadi menu praktis seperti tumis, sup, atau panggangan.",
            f"Jual sisa {name} di Marketplace surplus dengan diskon agar tidak terbuang.",
            f"Donasikan {name} ke komunitas terdekat lewat fitur Donasi sebelum kualitas turun.",
        ]
    if risk_label == "warning":
        return [
            f"Susun rencana menu mingguan yang memprioritaskan {name} sebagai bahan utama.",
            f"Simpan {name} di lokasi yang lebih dingin (kulkas/freezer) untuk memperpanjang masa simpan.",
            f"Bagikan info ke anggota keluarga atau tim dapur agar {name} dipakai lebih dulu.",
        ]
    return [
        f"{name} masih dalam kondisi aman, gunakan sesuai rotasi FIFO (first in, first out).",
        f"Pantau {name.lower()} setiap kali memeriksa stok untuk mencegah pemborosan.",
        f"Catat sisa {name.lower()} di inventaris agar prediksi risiko tetap akurat.",
    ]


def _build_storage_advice(category_key: str, storage_key: str) -> str:
    if category_key in {"protein", "daging", "ikan"} and storage_key == "suhu ruang":
        return (
            "Daging/ikan sebaiknya disimpan di kulkas atau freezer untuk mencegah "
            "kontaminasi dan memperpanjang masa simpan."
        )
    if category_key == "sayur" and storage_key == "freezer":
        return (
            "Beberapa sayuran kehilangan tekstur saat dibekukan. Gunakan kulkas "
            "untuk daun-daunan dan freezer hanya untuk sayur potong/blansir."
        )
    if category_key == "roti" and storage_key == "kulkas":
        return (
            "Roti cenderung cepat keras di kulkas. Simpan pada suhu ruang dalam "
            "wadah kedap udara atau bekukan untuk persediaan jangka panjang."
        )
    if category_key == "susu":
        return "Pastikan kemasan susu/olahan tertutup rapat dan tetap di kulkas (<=4 C)."
    return "Simpan di tempat yang sesuai standar kategori bahan agar masa simpan optimal."


def _drivers(storage_key: str, category_key: str, quantity: float, days_left: int) -> list[str]:
    drivers: list[str] = []
    if days_left <= _RISK_HIGH_DAYS:
        drivers.append("Sisa masa simpan <= 2 hari (faktor utama risiko)")
    elif days_left <= _RISK_WARNING_DAYS:
        drivers.append("Mendekati masa kedaluwarsa (3-5 hari)")

    if storage_key == "suhu ruang" and category_key in {
        "sayur", "buah", "protein", "daging", "ikan", "susu",
    }:
        drivers.append("Disimpan pada suhu ruang untuk kategori mudah rusak")

    if quantity >= 5:
        drivers.append("Stok besar (>5 unit) berisiko tidak habis tepat waktu")

    if not drivers:
        drivers.append("Kondisi penyimpanan dan masa simpan masih aman")

    return drivers


def predict_risk(
    *,
    food_name: str | None,
    category: str | None,
    quantity: float | int | str | None,
    unit: str | None = None,
    purchase_date: str | None = None,
    storage_condition: str | None = None,
    storage_type: str | None = None,
    shelf_life_override: int | None = None,
) -> RiskPrediction:
    """Return a deterministic risk prediction for the given food item."""
    del unit  # accepted for API compatibility but not used in heuristics yet
    storage_key = _resolve_storage_key(storage_condition or storage_type or "")
    category_key = _resolve_category_key(category or "")

    metadata = _load_food_metadata()
    food_key = _normalize(food_name)
    meta = metadata.get(food_key)

    if meta:
        category_key = _resolve_category_key(meta.get("category", category_key))
        if shelf_life_override and int(shelf_life_override) > 0:
            shelf_life_days = int(shelf_life_override)
        else:
            shelf_life_days = int(meta.get("shelf_life", 1))
        display_food_name = meta.get("detected_food", food_name or "")
    else:
        base_shelf = _DEFAULT_SHELF_LIFE.get(category_key, _DEFAULT_SHELF_LIFE["lainnya"])[storage_key]
        food_adjustment = _FOOD_ADJUSTMENT.get(_normalize(food_name), 0)
        if shelf_life_override and int(shelf_life_override) > 0:
            shelf_life_days = int(shelf_life_override)
        else:
            shelf_life_days = max(int(base_shelf + food_adjustment), 1)
        display_food_name = food_name or ""

    purchase_dt = _parse_purchase_date(purchase_date)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    elapsed_days = max(int((today - purchase_dt).total_seconds() // 86400), 0)
    days_left = max(shelf_life_days - elapsed_days, 0)

    if days_left <= _RISK_HIGH_DAYS:
        risk_label = "high"
    elif days_left <= _RISK_WARNING_DAYS:
        risk_label = "warning"
    else:
        risk_label = "fresh"

    risk_score = round(max(0.0, min(1.0, 1.0 - days_left / max(shelf_life_days, 1))), 4)

    try:
        qty_value = float(quantity) if quantity is not None else 1.0
    except (TypeError, ValueError):
        qty_value = 1.0

    drivers = _drivers(storage_key, category_key, qty_value, days_left)
    
    if meta and meta.get("recommendations"):
        recommendations = meta["recommendations"]
    else:
        recommendations = _build_recommendations(display_food_name, risk_label)
        
    if meta and meta.get("storage_advice"):
        storage_advice = meta["storage_advice"]
    else:
        storage_advice = _build_storage_advice(category_key, storage_key)
        
    expiry_date = (purchase_dt + timedelta(days=shelf_life_days)).strftime("%Y-%m-%d")

    return RiskPrediction(
        food_name=display_food_name,
        category=category_key,
        storage_condition=storage_condition or storage_type or "Suhu ruang",
        shelf_life_days=shelf_life_days,
        days_left=days_left,
        risk_label=risk_label,
        risk_score=risk_score,
        drivers=drivers,
        storage_advice=storage_advice,
        recommendations=recommendations,
        expiry_date=expiry_date,
    )


def recommend_for_inventories(items: Iterable[dict]) -> list[dict]:
    """Generate recommendations for a list of inventory items."""
    output: list[dict] = []
    for item in (items or []):
        prediction = predict_risk(
            food_name=item.get("food_name"),
            category=item.get("category"),
            quantity=item.get("quantity"),
            unit=item.get("unit"),
            purchase_date=item.get("purchase_date"),
            storage_condition=item.get("storage_condition") or item.get("storage_location"),
            shelf_life_override=item.get("shelf_life") or item.get("shelf_life_days"),
        )
        output.append({
            "inventory_id": item.get("id") or item.get("inventory_id"),
            "id": item.get("id") or item.get("inventory_id"),
            "food_name": item.get("food_name"),
            "category": item.get("category"),
            "storage_location": item.get("storage_location") or item.get("storage_condition"),
            "quantity": item.get("quantity"),
            "unit": item.get("unit"),
            "expiry_date": item.get("expiry_date") or prediction.expiry_date,
            "days_left": item.get("days_left", prediction.days_left),
            "status": item.get("status") or prediction.risk_label,
            "urgency": item.get("status") or prediction.risk_label,
            "title": prediction.recommendations[0] if prediction.recommendations else "",
            "recipe": prediction.recommendations[0] if prediction.recommendations else "",
            "recipe_description": " ".join(prediction.recommendations[:2]),
            "recommendation": " ".join(prediction.recommendations[:2]),
            "risk_drivers": prediction.drivers,
            "storage_advice": prediction.storage_advice,
        })
    return output
