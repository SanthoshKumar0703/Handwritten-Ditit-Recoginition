"""
Loads the trained CNN exactly once (at Flask startup) and exposes a single
predict() function the recognition route calls. Keeping the model as a
module-level singleton avoids reloading a multi-megabyte .h5 file — and
rebuilding the TensorFlow graph — on every request.
"""

import os
import time

import numpy as np

from ml.preprocess import preprocess_image, is_blank

ML_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "ml")
MODEL_PATH = os.path.join(ML_DIR, "model", "digit_model.h5")

_model = None


def load_model():
    """Loads the model into memory. Called once from the app factory."""
    global _model
    if _model is not None:
        return _model

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"No trained model found at {MODEL_PATH}. Run `python ml/train_model.py` first."
        )

    # Imported lazily so importing this module doesn't pull in TensorFlow
    # (and its startup cost) for code paths that never predict.
    from tensorflow import keras

    print(f"Loading digit recognition model from {MODEL_PATH} ...")
    start = time.time()
    _model = keras.models.load_model(MODEL_PATH)
    # Warm up the graph so the *first real request* isn't the slow one.
    _model.predict(np.zeros((1, 28, 28, 1), dtype="float32"), verbose=0)
    print(f"Model loaded and warmed up in {time.time() - start:.2f}s")
    return _model


def is_model_loaded() -> bool:
    return _model is not None


def predict_digit(image: np.ndarray) -> dict:
    """image: a numpy array as decoded from the incoming canvas/upload data.
    Returns predicted_digit, confidence (0-100), top_3 predictions, and
    processing time in milliseconds."""
    if _model is None:
        raise RuntimeError("Model has not been loaded yet.")

    start = time.time()

    if is_blank(image):
        raise ValueError("The image appears to be blank. Draw or upload a digit first.")

    tensor = preprocess_image(image)
    probabilities = _model.predict(tensor, verbose=0)[0]

    top_indices = np.argsort(probabilities)[::-1][:3]
    top_predictions = [
        {"digit": int(i), "confidence": round(float(probabilities[i]) * 100, 2)} for i in top_indices
    ]

    elapsed_ms = (time.time() - start) * 1000

    return {
        "predicted_digit": int(top_indices[0]),
        "confidence": top_predictions[0]["confidence"],
        "top_predictions": top_predictions,
        "processing_time_ms": round(elapsed_ms, 1),
    }
