"""
Loads the MNIST dataset as (x_train, y_train), (x_test, y_test) with images
as uint8 arrays of shape (N, 28, 28) and labels as int arrays of shape (N,).

Tries the standard TensorFlow/Keras source first (this is what almost every
network will reach). Falls back to a GitHub-hosted mirror of the same
dataset for environments where the default Google Cloud Storage host is
blocked by a firewall or proxy.
"""

import os
import numpy as np
import urllib.request

CACHE_DIR = os.path.join(os.path.dirname(__file__), "data_cache")
MIRROR_URL = "https://raw.githubusercontent.com/SebLague/Mnist-data-numpy-format/master/mnist.npz"
MIRROR_CACHE_PATH = os.path.join(CACHE_DIR, "mnist_mirror.npz")


def _load_from_keras():
    from tensorflow import keras

    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    return (x_train, y_train), (x_test, y_test)


def _load_from_mirror():
    os.makedirs(CACHE_DIR, exist_ok=True)
    if not os.path.exists(MIRROR_CACHE_PATH):
        print(f"Downloading MNIST mirror from {MIRROR_URL} ...")
        urllib.request.urlretrieve(MIRROR_URL, MIRROR_CACHE_PATH)

    data = np.load(MIRROR_CACHE_PATH)

    # This mirror ships pre-normalized (0..1) float pixels, flattened to 784,
    # one-hot labels, and a separate 10k-image validation split. We fold the
    # validation split back into the training set to reproduce the standard
    # 60,000 / 10,000 MNIST split, and convert to the same uint8 / integer
    # format tf.keras.datasets.mnist.load_data() would return.
    x_train = np.concatenate([data["training_images"], data["validation_images"]], axis=0)
    y_train = np.concatenate([data["training_labels"], data["validation_labels"]], axis=0)
    x_test = data["test_images"]
    y_test = data["test_labels"]

    x_train = (x_train.reshape(-1, 28, 28) * 255).astype("uint8")
    x_test = (x_test.reshape(-1, 28, 28) * 255).astype("uint8")
    y_train = y_train.reshape(-1, 10).argmax(axis=1).astype("uint8")
    y_test = y_test.reshape(-1, 10).argmax(axis=1).astype("uint8")

    return (x_train, y_train), (x_test, y_test)


def load_mnist():
    try:
        return _load_from_keras()
    except Exception as exc:  # noqa: BLE001
        print(f"Default MNIST source unreachable ({exc}); falling back to GitHub mirror.")
        return _load_from_mirror()


if __name__ == "__main__":
    (x_train, y_train), (x_test, y_test) = load_mnist()
    print("train:", x_train.shape, y_train.shape)
    print("test:", x_test.shape, y_test.shape)
