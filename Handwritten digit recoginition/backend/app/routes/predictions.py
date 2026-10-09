from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, false

from app.extensions import db, limiter
from app.models import Prediction
from app.utils.image_decode import decode_base64_image, encode_thumbnail
from app.services import model_service
from app.utils.notify import notify
from ml.preprocess import preprocess_image  # noqa: E402

predictions_bp = Blueprint("predictions", __name__, url_prefix="/api/predictions")

VALID_SOURCES = {"draw", "upload"}
SORTABLE_FIELDS = {
    "created_at": Prediction.created_at,
    "confidence": Prediction.confidence,
    "predicted_digit": Prediction.predicted_digit,
}


@predictions_bp.post("/predict")
@jwt_required()
@limiter.limit("60 per minute")
def predict():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    image_data = data.get("image")
    source = data.get("source", "draw")
    if source not in VALID_SOURCES:
        source = "draw"

    try:
        image = decode_base64_image(image_data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    try:
        result = model_service.predict_digit(image)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503

    thumbnail = encode_thumbnail(preprocess_image(image))

    prediction = Prediction(
        user_id=user_id,
        predicted_digit=result["predicted_digit"],
        confidence=result["confidence"],
        top_predictions=result["top_predictions"],
        processing_time_ms=result["processing_time_ms"],
        source=source,
        image_data=thumbnail,
    )
    db.session.add(prediction)
    db.session.commit()

    notify(
        user_id,
        "prediction",
        "Prediction complete",
        f"Recognized digit {prediction.predicted_digit} with {prediction.confidence}% confidence.",
        link="/dashboard/history",
    )

    return jsonify({"prediction": prediction.to_dict()}), 201


@predictions_bp.get("")
@jwt_required()
def list_predictions():
    user_id = get_jwt_identity()
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 20)), 1), 100)

    query = Prediction.query.filter_by(user_id=user_id)

    # search — matches an exact predicted digit (e.g. typing "7")
    q = request.args.get("q", "").strip()
    if q:
        if q.isdigit() and 0 <= int(q) <= 9:
            query = query.filter(Prediction.predicted_digit == int(q))
        else:
            query = query.filter(false())  # no non-digit fields to search yet

    # filters
    source = request.args.get("source")
    if source in VALID_SOURCES:
        query = query.filter(Prediction.source == source)

    digit = request.args.get("digit")
    if digit is not None and digit != "" and digit.isdigit():
        query = query.filter(Prediction.predicted_digit == int(digit))

    date_from = request.args.get("date_from")
    if date_from:
        query = query.filter(Prediction.created_at >= date_from)
    date_to = request.args.get("date_to")
    if date_to:
        query = query.filter(Prediction.created_at <= date_to)

    # sort
    sort_by = request.args.get("sort_by", "created_at")
    order = request.args.get("order", "desc")
    sort_column = SORTABLE_FIELDS.get(sort_by, Prediction.created_at)
    sort_column = sort_column.asc() if order == "asc" else sort_column.desc()
    query = query.order_by(sort_column)

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify(
        {
            "predictions": [p.to_dict() for p in items],
            "page": page,
            "per_page": per_page,
            "total": total,
        }
    ), 200


@predictions_bp.get("/<prediction_id>")
@jwt_required()
def get_prediction(prediction_id):
    user_id = get_jwt_identity()
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()
    if not prediction:
        return jsonify({"error": "Prediction not found."}), 404
    return jsonify({"prediction": prediction.to_dict()}), 200


@predictions_bp.delete("/<prediction_id>")
@jwt_required()
def delete_prediction(prediction_id):
    user_id = get_jwt_identity()
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()
    if not prediction:
        return jsonify({"error": "Prediction not found."}), 404
    db.session.delete(prediction)
    db.session.commit()
    return jsonify({"message": "Prediction deleted."}), 200


@predictions_bp.get("/analytics/summary")
@jwt_required()
def analytics_summary():
    user_id = get_jwt_identity()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    fourteen_days_ago = today_start - timedelta(days=13)

    base = Prediction.query.filter_by(user_id=user_id)
    total_predictions = base.count()
    today_predictions = base.filter(Prediction.created_at >= today_start).count()

    avg_confidence = (
        db.session.query(func.avg(Prediction.confidence)).filter(Prediction.user_id == user_id).scalar()
    )
    avg_confidence = round(float(avg_confidence), 2) if avg_confidence is not None else 0.0

    digit_distribution = [0] * 10
    digit_rows = (
        db.session.query(Prediction.predicted_digit, func.count(Prediction.id))
        .filter(Prediction.user_id == user_id)
        .group_by(Prediction.predicted_digit)
        .all()
    )
    for digit, count in digit_rows:
        digit_distribution[digit] = count

    daily_rows = (
        db.session.query(func.date(Prediction.created_at), func.count(Prediction.id), func.avg(Prediction.confidence))
        .filter(Prediction.user_id == user_id, Prediction.created_at >= fourteen_days_ago)
        .group_by(func.date(Prediction.created_at))
        .all()
    )
    by_date = {str(d): (c, round(float(avg), 2)) for d, c, avg in daily_rows}

    daily_labels, daily_counts, daily_confidence = [], [], []
    for i in range(14):
        day = (fourteen_days_ago + timedelta(days=i)).date()
        key = str(day)
        count, avg = by_date.get(key, (0, None))
        daily_labels.append(day.strftime("%b %d"))
        daily_counts.append(count)
        daily_confidence.append(avg if avg is not None else 0)

    model_accuracy = _read_model_accuracy()

    return jsonify(
        {
            "total_predictions": total_predictions,
            "today_predictions": today_predictions,
            "average_confidence": avg_confidence,
            "model_accuracy": model_accuracy,
            "digit_distribution": digit_distribution,
            "daily_trend": {"labels": daily_labels, "values": daily_counts},
            "confidence_trend": {"labels": daily_labels, "values": daily_confidence},
        }
    ), 200


def _read_model_accuracy() -> float:
    import json
    import os

    report_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "ml", "model", "evaluation_report.json"
    )
    try:
        with open(report_path) as f:
            report = json.load(f)
        return round(report["test_accuracy"] * 100, 2)
    except Exception:  # noqa: BLE001
        return 0.0
