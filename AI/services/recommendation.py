import os

try:
    from google import genai
except ImportError:
    genai = None

try:
    from settings import load_env_file
except ImportError:  # When imported as part of the AI package
    from ..settings import load_env_file


load_env_file()


DEFAULT_MODEL_NAME = "gemini-2.5-flash"


def build_fallback_recommendation(predicted_class: str) -> dict:
    normalized_label = predicted_class.strip()
    return {
        "text": (
            f"{normalized_label.capitalize()} cocok digunakan sebagai bumbu dasar "
            "masakan gurih, tumisan, atau kuah hangat sehari-hari."
        ),
        "source": "fallback",
    }


def build_recommendation_prompt(predicted_class: str) -> str:
    return (
        "Kamu adalah asisten rekomendasi bahan makanan untuk frontend aplikasi kuliner. "
        "Buat 2 kalimat singkat dalam Bahasa Indonesia yang menjelaskan penggunaan bahan "
        f"'{predicted_class}'. Fokus pada ide penggunaan masakan rumahan dan manfaat praktis. "
        "Jangan gunakan bullet list, jangan gunakan markdown, maksimal 45 kata."
    )


class GeminiRecommendationService:
    def __init__(self, api_key: str | None = None, model_name: str | None = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name or os.getenv("GEMINI_MODEL", DEFAULT_MODEL_NAME)

    def generate(self, predicted_class: str) -> dict:
        if not self.api_key or genai is None:
            return build_fallback_recommendation(predicted_class)

        try:
            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(
                model=self.model_name,
                contents=build_recommendation_prompt(predicted_class),
            )
            text = (response.text or "").strip()
            if not text:
                return build_fallback_recommendation(predicted_class)
            return {"text": text, "source": "gemini"}
        except Exception:
            return build_fallback_recommendation(predicted_class)


def generate_recommendation(predicted_class: str) -> dict:
    service = GeminiRecommendationService()
    return service.generate(predicted_class)
