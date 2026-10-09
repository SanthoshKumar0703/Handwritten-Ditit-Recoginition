import base64
import io

import cv2
import numpy as np
from PIL import Image

ALLOWED_FORMATS = {"PNG", "JPEG", "JPG"}
MAX_DECODED_BYTES = 8 * 1024 * 1024  # 8 MB safety cap


def decode_base64_image(data_url: str) -> np.ndarray:
    """Accepts a raw base64 string or a data URL (data:image/png;base64,...)
    and returns a BGR numpy array, as OpenCV expects."""
    if not data_url or not isinstance(data_url, str):
        raise ValueError("No image data provided.")

    if "," in data_url and data_url.strip().startswith("data:"):
        data_url = data_url.split(",", 1)[1]

    try:
        raw = base64.b64decode(data_url, validate=True)
    except Exception as exc:  # noqa: BLE001
        raise ValueError("Image data is not valid base64.") from exc

    if len(raw) == 0:
        raise ValueError("No image data provided.")
    if len(raw) > MAX_DECODED_BYTES:
        raise ValueError("Image is too large.")

    try:
        pil_image = Image.open(io.BytesIO(raw))
        pil_image.verify()
        pil_image = Image.open(io.BytesIO(raw))  # re-open after verify()
    except Exception as exc:  # noqa: BLE001
        raise ValueError("File is not a valid image.") from exc

    if pil_image.format not in ALLOWED_FORMATS:
        raise ValueError("Only PNG and JPG images are supported.")

    rgb = pil_image.convert("RGB")
    array = np.array(rgb)
    return cv2.cvtColor(array, cv2.COLOR_RGB2BGR)


def encode_thumbnail(image_28x28: np.ndarray) -> str:
    """Encodes the preprocessed 28x28 tensor back to a small base64 PNG,
    for storing a lightweight preview alongside the prediction."""
    pixels = (image_28x28.reshape(28, 28) * 255).astype("uint8")
    success, buffer = cv2.imencode(".png", pixels)
    if not success:
        return ""
    return "data:image/png;base64," + base64.b64encode(buffer).decode("utf-8")
