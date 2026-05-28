#!/usr/bin/env python3
"""
Convert nutrition CSV data to JSON format for backend consumption.
"""
import csv
import json
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_CSV_PATH = SCRIPT_DIR / "data" / "fruits_clean.csv"
DEFAULT_JSON_PATH = SCRIPT_DIR / "data" / "nutrition_data.json"
DEFAULT_SUMMARY_PATH = SCRIPT_DIR / "data" / "nutrition_summary.json"
DEFAULT_CLASS_NAMES_PATH = SCRIPT_DIR / "model" / "class_names.json"

MODEL_CLASS_NUTRITION = {
    "apel": {
        "nama": "Apel",
        "kalori_kcal": 52.0,
        "protein_g": 0.3,
        "lemak_g": 0.2,
        "karbohidrat_g": 13.8,
        "serat_g": 2.4,
        "kalsium_mg": 6.0,
        "air_g": 85.6,
    },
    "bawang merah": {
        "nama": "Bawang Merah",
        "kalori_kcal": 72.0,
        "protein_g": 2.5,
        "lemak_g": 0.1,
        "karbohidrat_g": 16.8,
        "serat_g": 3.2,
        "kalsium_mg": 27.0,
        "air_g": 79.8,
    },
    "bawang putih": {
        "nama": "Bawang Putih",
        "kalori_kcal": 149.0,
        "protein_g": 6.4,
        "lemak_g": 0.5,
        "karbohidrat_g": 33.1,
        "serat_g": 2.1,
        "kalsium_mg": 181.0,
        "air_g": 58.6,
    },
    "cabai": {
        "nama": "Cabai",
        "kalori_kcal": 40.0,
        "protein_g": 1.9,
        "lemak_g": 0.4,
        "karbohidrat_g": 8.8,
        "serat_g": 1.5,
        "kalsium_mg": 14.0,
        "air_g": 88.0,
    },
    "daging ayam": {
        "nama": "Daging Ayam",
        "kalori_kcal": 239.0,
        "protein_g": 27.0,
        "lemak_g": 14.0,
        "karbohidrat_g": 0.0,
        "serat_g": 0.0,
        "kalsium_mg": 15.0,
        "air_g": 59.0,
    },
    "pisang": {
        "nama": "Pisang",
        "kalori_kcal": 89.0,
        "protein_g": 1.1,
        "lemak_g": 0.3,
        "karbohidrat_g": 22.8,
        "serat_g": 2.6,
        "kalsium_mg": 5.0,
        "air_g": 74.9,
    },
    "tahu": {
        "nama": "Tahu",
        "kalori_kcal": 76.0,
        "protein_g": 8.0,
        "lemak_g": 4.8,
        "karbohidrat_g": 1.9,
        "serat_g": 0.3,
        "kalsium_mg": 350.0,
        "air_g": 84.6,
    },
    "telur": {
        "nama": "Telur",
        "kalori_kcal": 155.0,
        "protein_g": 13.0,
        "lemak_g": 11.0,
        "karbohidrat_g": 1.1,
        "serat_g": 0.0,
        "kalsium_mg": 50.0,
        "air_g": 76.0,
    },
    "tempe": {
        "nama": "Tempe",
        "kalori_kcal": 193.0,
        "protein_g": 20.3,
        "lemak_g": 10.8,
        "karbohidrat_g": 7.6,
        "serat_g": 1.4,
        "kalsium_mg": 111.0,
        "air_g": 55.3,
    },
    "tomat": {
        "nama": "Tomat",
        "kalori_kcal": 18.0,
        "protein_g": 0.9,
        "lemak_g": 0.2,
        "karbohidrat_g": 3.9,
        "serat_g": 1.2,
        "kalsium_mg": 10.0,
        "air_g": 94.5,
    },
}


def parse_float(value, default=0.0):
    if value is None:
        return default

    normalized = str(value).strip()
    if not normalized:
        return default

    return float(normalized)


def get_calorie_category(calories):
    """Categorize ingredients by calorie content."""
    if calories < 50:
        return "Rendah Kalori"
    if calories < 150:
        return "Sedang Kalori"
    return "Tinggi Kalori"


def build_backend_entry(base_info, source=None):
    calories = parse_float(base_info.get("kalori_kcal"))
    protein = parse_float(base_info.get("protein_g"))
    fat = parse_float(base_info.get("lemak_g"))

    entry = {
        "nama": base_info["nama"],
        "kalori_kcal": calories,
        "protein_g": protein,
        "lemak_g": fat,
        "karbohidrat_g": parse_float(base_info.get("karbohidrat_g")),
        "serat_g": parse_float(base_info.get("serat_g")),
        "kalsium_mg": parse_float(base_info.get("kalsium_mg")),
        "air_g": parse_float(base_info.get("air_g")),
        "kalori_per_100g": calories,
        "kategori_kalori": get_calorie_category(calories),
        "tinggi_protein": protein > 10,
        "rendah_lemak": fat < 5,
    }

    for extra_key, extra_value in base_info.items():
        if extra_key not in entry:
            entry[extra_key] = extra_value

    if source:
        entry["source"] = source

    return entry


def map_standard_row(row):
    ingredient_name = row["nama_bahan"].strip()
    return ingredient_name.lower(), build_backend_entry({
        "nama": ingredient_name,
        "kalori_kcal": row.get("kalori_kcal"),
        "protein_g": row.get("protein_g"),
        "lemak_g": row.get("lemak_g"),
        "karbohidrat_g": parse_float(row.get("karbohidrat_g")),
        "serat_g": parse_float(row.get("serat_g")),
        "kalsium_mg": parse_float(row.get("kalsium_mg")),
        "air_g": parse_float(row.get("air_g")),
    })


def map_fruit_row(row):
    ingredient_name = row["fruit_name"].strip()
    calories = parse_float(row.get("calories"))
    sugar = parse_float(row.get("sugar_g"))
    fiber = parse_float(row.get("fiber_g_per_100g"))
    water = parse_float(row.get("water_percent"))
    weight = parse_float(row.get("avg_weight_g"))

    # Fruit dataset does not provide full macro and mineral detail expected by the
    # backend, so these fields stay present with safe defaults for compatibility.
    return ingredient_name.lower(), build_backend_entry({
        "nama": ingredient_name,
        "kalori_kcal": calories,
        "protein_g": 0.0,
        "lemak_g": 0.0,
        "karbohidrat_g": sugar,
        "serat_g": fiber,
        "kalsium_mg": 0.0,
        "air_g": water,
        "kalori_per_100g": calories,
        "kategori_kalori": get_calorie_category(calories),
        "tinggi_protein": False,
        "rendah_lemak": True,
        "season": row.get("season", "").strip(),
        "top_vitamin": row.get("top_vitamin", "").strip(),
        "top_mineral": row.get("top_mineral", "").strip(),
        "avg_weight_g": weight,
        "acidity_ph": parse_float(row.get("acidity_ph")),
        "taste_profile": row.get("taste_profile", "").strip(),
        "shelf_life_days": parse_float(row.get("shelf_life_days")),
    }, source="fruit_csv")


def convert_row(row):
    if "nama_bahan" in row:
        return map_standard_row(row)
    if "fruit_name" in row:
        return map_fruit_row(row)
    raise KeyError("CSV schema tidak dikenali. Kolom wajib tidak ditemukan.")


def convert_csv_to_json(csv_path, json_path):
    """
    Convert nutrition CSV to structured JSON.

    Args:
        csv_path: Path to input CSV file
        json_path: Path to output JSON file
    """
    nutrition_data = {}
    csv_path = Path(csv_path)
    json_path = Path(json_path)

    with csv_path.open("r", encoding="utf-8", newline="") as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            ingredient_key, nutrition_info = convert_row(row)
            nutrition_data[ingredient_key] = nutrition_info

    json_path.parent.mkdir(parents=True, exist_ok=True)
    with json_path.open("w", encoding="utf-8") as jsonfile:
        json.dump(nutrition_data, jsonfile, ensure_ascii=False, indent=2)

    print(f"Converted {len(nutrition_data)} ingredients")
    print(f"CSV: {csv_path}")
    print(f"JSON: {json_path}")

    return nutrition_data


def load_model_classes(class_names_path):
    class_names_path = Path(class_names_path)
    with class_names_path.open("r", encoding="utf-8") as class_file:
        return json.load(class_file)


def merge_model_class_nutrition(nutrition_data, class_names_path=DEFAULT_CLASS_NAMES_PATH):
    merged = dict(nutrition_data)

    for class_name in load_model_classes(class_names_path):
        key = class_name.lower().strip()
        if key in merged:
            continue

        template = MODEL_CLASS_NUTRITION.get(key)
        if template is None:
            template = {
                "nama": class_name,
                "kalori_kcal": 0.0,
                "protein_g": 0.0,
                "lemak_g": 0.0,
                "karbohidrat_g": 0.0,
                "serat_g": 0.0,
                "kalsium_mg": 0.0,
                "air_g": 0.0,
            }

        merged[key] = build_backend_entry(template, source="model_class_manual")

    return merged


def create_nutrition_summary(nutrition_data):
    """Create summary statistics."""
    total_ingredients = len(nutrition_data)
    summary = {
        "total_ingredients": total_ingredients,
        "avg_calories": (
            sum(item["kalori_kcal"] for item in nutrition_data.values()) / total_ingredients
            if total_ingredients
            else 0.0
        ),
        "high_protein_count": sum(
            1 for item in nutrition_data.values() if item["tinggi_protein"]
        ),
        "low_fat_count": sum(
            1 for item in nutrition_data.values() if item["rendah_lemak"]
        ),
        "categories": {},
    }

    for item in nutrition_data.values():
        category = item["kategori_kalori"]
        summary["categories"][category] = summary["categories"].get(category, 0) + 1

    return summary


if __name__ == "__main__":
    nutrition_data = convert_csv_to_json(DEFAULT_CSV_PATH, DEFAULT_JSON_PATH)
    nutrition_data = merge_model_class_nutrition(
        nutrition_data,
        DEFAULT_CLASS_NAMES_PATH,
    )

    with DEFAULT_JSON_PATH.open("w", encoding="utf-8") as jsonfile:
        json.dump(nutrition_data, jsonfile, ensure_ascii=False, indent=2)

    summary = create_nutrition_summary(nutrition_data)
    with DEFAULT_SUMMARY_PATH.open("w", encoding="utf-8") as summary_file:
        json.dump(summary, summary_file, ensure_ascii=False, indent=2)

    print(f"Summary: {DEFAULT_SUMMARY_PATH}")
    print(f"Average calories: {summary['avg_calories']:.1f} kcal")
    print(f"High protein ingredients: {summary['high_protein_count']}")
    print(f"Low fat ingredients: {summary['low_fat_count']}")
