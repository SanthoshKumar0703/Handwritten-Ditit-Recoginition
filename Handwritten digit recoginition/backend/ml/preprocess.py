"""
Turns an arbitrary input image (a canvas drawing, a photo of a digit, a
scanned page) into the exact 28x28 normalized tensor the CNN was trained
on. This is the same pipeline the recognition API calls for every
prediction, so what the model sees at inference time matches MNIST's
conventions as closely as possible:

  1. grayscale
  2. auto-invert so the digit is light-on-dark (MNIST convention) regardless
     of whether the source was a white-background photo or a canvas drawing
  3. Otsu threshold + bounding-box crop, so a digit drawn small in the
     corner of a canvas is treated the same as one that fills it
  4. square-pad and resize to 28x28
  5. normalize to [0, 1] and reshape to (1, 28, 28, 1)
"""

import cv2
import numpy as np


def _to_grayscale(image: np.ndarray) -> np.ndarray:
    if image.ndim == 2:
        return image
    if image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def _auto_invert(gray: np.ndarray) -> np.ndarray:
    # MNIST digits are light strokes on a dark background. If the image is
    # mostly bright (a typical white-paper photo, or a canvas with dark
    # strokes on white), invert it so the stroke is bright instead.
    if gray.mean() > 127:
        return cv2.bitwise_not(gray)
    return gray


def _crop_to_digit(gray: np.ndarray) -> np.ndarray:
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    coords = cv2.findNonZero(thresh)

    if coords is None:
        return gray  # blank image — nothing to crop, let the caller handle it

    x, y, w, h = cv2.boundingRect(coords)
    pad = int(max(w, h) * 0.2)
    x0, y0 = max(x - pad, 0), max(y - pad, 0)
    x1, y1 = min(x + w + pad, gray.shape[1]), min(y + h + pad, gray.shape[0])
    return gray[y0:y1, x0:x1]


def _square_pad(gray: np.ndarray) -> np.ndarray:
    h, w = gray.shape
    size = max(h, w)
    top = (size - h) // 2
    bottom = size - h - top
    left = (size - w) // 2
    right = size - w - left
    return cv2.copyMakeBorder(gray, top, bottom, left, right, cv2.BORDER_CONSTANT, value=0)


def is_blank(image: np.ndarray, threshold: float = 8.0) -> bool:
    """True if the image has essentially no drawn content (empty canvas)."""
    gray = _to_grayscale(image)
    gray = _auto_invert(gray)
    return float(gray.std()) < threshold


def preprocess_image(image: np.ndarray) -> np.ndarray:
    """image: a BGR/RGB/RGBA/grayscale numpy array (as read by cv2 or PIL).
    Returns a (1, 28, 28, 1) float32 tensor normalized to [0, 1]."""
    gray = _to_grayscale(image)
    gray = _auto_invert(gray)
    gray = _crop_to_digit(gray)
    gray = _square_pad(gray)

    # Resize to 20x20 first (standard MNIST convention keeps a margin around
    # the digit), then pad back out to 28x28.
    digit = cv2.resize(gray, (20, 20), interpolation=cv2.INTER_AREA)
    canvas = np.zeros((28, 28), dtype=np.uint8)
    canvas[4:24, 4:24] = digit

    tensor = canvas.astype("float32") / 255.0
    return tensor.reshape(1, 28, 28, 1)
