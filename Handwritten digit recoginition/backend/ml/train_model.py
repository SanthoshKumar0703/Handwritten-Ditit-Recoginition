"""
Trains the digit-recognition CNN on MNIST and saves it as digit_model.h5.

Usage:
    cd backend
    python ml/train_model.py

Expected runtime: a few minutes on CPU. Targets >99% test accuracy.
"""

import os
import json
import time
import numpy as np
import tensorflow as tf
from tensorflow import keras

from data import load_mnist  # noqa: E402  (run as a script from backend/ml)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "digit_model.h5")
HISTORY_PATH = os.path.join(MODEL_DIR, "training_history.json")
REPORT_PATH = os.path.join(MODEL_DIR, "evaluation_report.json")

SEED = 42


def build_model() -> keras.Model:
    model = keras.Sequential(
        [
            keras.layers.Input(shape=(28, 28, 1)),
            keras.layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
            keras.layers.Conv2D(32, (3, 3), activation="relu"),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.Dropout(0.25),
            keras.layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
            keras.layers.Conv2D(64, (3, 3), activation="relu"),
            keras.layers.MaxPooling2D((2, 2)),
            keras.layers.Dropout(0.25),
            keras.layers.Flatten(),
            keras.layers.Dense(256, activation="relu"),
            keras.layers.Dropout(0.4),
            keras.layers.Dense(10, activation="softmax"),
        ],
        name="digit_cnn",
    )
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model


def main():
    tf.random.set_seed(SEED)
    np.random.seed(SEED)
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Loading MNIST...")
    (x_train, y_train), (x_test, y_test) = load_mnist()

    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0
    x_train = x_train[..., np.newaxis]
    x_test = x_test[..., np.newaxis]

    print(f"train: {x_train.shape}, test: {x_test.shape}")

    # Mild augmentation — small rotations/shifts — makes the model more
    # robust to imperfect handwriting from a canvas or photo, without
    # hurting accuracy on clean MNIST digits.
    augment = keras.Sequential(
        [
            keras.layers.RandomRotation(0.06),
            keras.layers.RandomTranslation(0.08, 0.08),
            keras.layers.RandomZoom(0.08),
        ],
        name="augmentation",
    )

    inputs = keras.Input(shape=(28, 28, 1))
    x = augment(inputs)
    model_core = build_model()
    outputs = model_core(x)
    train_model = keras.Model(inputs, outputs)
    train_model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

    callbacks = [
        keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=4, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-5),
    ]

    print("Training...")
    start = time.time()
    history = train_model.fit(
        x_train,
        y_train,
        batch_size=128,
        epochs=20,
        validation_split=0.1,
        callbacks=callbacks,
        verbose=2,
    )
    train_time = time.time() - start
    print(f"Training took {train_time:.1f}s")

    print("Evaluating on held-out test set...")
    test_loss, test_accuracy = model_core.evaluate(x_test, y_test, verbose=0)
    print(f"Test accuracy: {test_accuracy * 100:.2f}%  (loss: {test_loss:.4f})")

    # Save the inference-only model (no augmentation layer inside it)
    model_core.save(MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")

    with open(HISTORY_PATH, "w") as f:
        json.dump({k: [float(v) for v in vals] for k, vals in history.history.items()}, f, indent=2)

    y_pred = np.argmax(model_core.predict(x_test, verbose=0), axis=1)
    per_class_accuracy = {}
    for digit in range(10):
        mask = y_test == digit
        per_class_accuracy[str(digit)] = float((y_pred[mask] == digit).mean())

    report = {
        "test_accuracy": float(test_accuracy),
        "test_loss": float(test_loss),
        "train_samples": int(x_train.shape[0]),
        "test_samples": int(x_test.shape[0]),
        "epochs_run": len(history.history["loss"]),
        "training_seconds": round(train_time, 1),
        "per_class_accuracy": per_class_accuracy,
    }
    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)
    print(f"Saved evaluation report to {REPORT_PATH}")


if __name__ == "__main__":
    main()
