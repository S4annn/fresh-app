import json
from functools import lru_cache
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image


DEFAULT_IMAGE_SIZE = (224, 224)
MODEL_DIR = Path(__file__).resolve().parent.parent / "model"
MODEL_PATH = MODEL_DIR / "model.keras"
LABEL_PATH = MODEL_DIR / "class_names.json"


@tf.keras.utils.register_keras_serializable(package="custom")
class ChannelAttention(tf.keras.layers.Layer):
    def __init__(self, reduction_ratio=8, **kwargs):
        super().__init__(**kwargs)
        self.reduction_ratio = reduction_ratio
        self.gap = tf.keras.layers.GlobalAveragePooling2D()
        self.reshape = None
        self.dense_reduce = None
        self.dense_expand = None

    def build(self, input_shape):
        channels = int(input_shape[-1])
        reduced_channels = max(channels // self.reduction_ratio, 8)
        self.reshape = tf.keras.layers.Reshape((1, 1, channels))
        self.dense_reduce = tf.keras.layers.Dense(reduced_channels, activation="relu")
        self.dense_expand = tf.keras.layers.Dense(channels, activation="sigmoid")
        super().build(input_shape)

    def call(self, inputs):
        attention = self.gap(inputs)
        attention = self.reshape(attention)
        attention = self.dense_reduce(attention)
        attention = self.dense_expand(attention)
        return inputs * attention

    def get_config(self):
        config = super().get_config()
        config.update({"reduction_ratio": self.reduction_ratio})
        return config


def _ensure_assets_exist():
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(
            "Model tidak ditemukan. Pastikan backend/model/model.keras tersedia."
        )
    if not LABEL_PATH.is_file():
        raise FileNotFoundError(
            "Label tidak ditemukan. Pastikan backend/model/class_names.json tersedia."
        )


@lru_cache
def load_class_names():
    _ensure_assets_exist()
    with LABEL_PATH.open("r", encoding="utf-8") as fp:
        return json.load(fp)


@lru_cache
def load_model():
    _ensure_assets_exist()
    return tf.keras.models.load_model(MODEL_PATH)


def preprocess_image(image_source, image_size=DEFAULT_IMAGE_SIZE):
    image = Image.open(image_source).convert("RGB").resize(image_size)
    array = np.asarray(image, dtype=np.float32)
    return np.expand_dims(array, axis=0)


def predict_array(model, image_batch, class_names):
    probabilities = model(image_batch, training=False).numpy()[0]
    predicted_index = int(np.argmax(probabilities))
    return {
        "predicted_class": class_names[predicted_index],
        "confidence": float(probabilities[predicted_index]),
        "probabilities": {
            class_names[idx]: float(probabilities[idx]) for idx in range(len(class_names))
        },
    }


def predict_uploaded_image(image_path: Path):
    model = load_model()
    class_names = load_class_names()
    batch = preprocess_image(image_path)
    return predict_array(model, batch, class_names)
