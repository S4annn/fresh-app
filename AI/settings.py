import os
from pathlib import Path

from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parent
DEFAULT_ENV_PATH = PROJECT_ROOT / ".env"


def load_env_file(env_path: str | os.PathLike | None = None) -> Path:
    target_path = Path(env_path) if env_path else DEFAULT_ENV_PATH
    load_dotenv(target_path, override=False)
    return target_path
