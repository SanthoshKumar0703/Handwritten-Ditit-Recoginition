import json
import os
from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import User, Prediction, SystemLog
from app.utils.audit import admin_required, log_event
from app.utils.notify import notify

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

ML_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "ml")


# ---------------------------------------------------------------- users ----
@admin_bp.get("/users")
@admin_required
def list_users():
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 20)), 1), 100)
    q = request.args.get("q", "").strip()

    query = User.query
    if q:
        like = f"%{q}%"
        query = query.filter(db.or_(User.name.ilike(like), User.email.ilike(like)))
    query = query.order_by(User.created_at.desc())

    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()

    results = []
    for u in users:
        d = u.to_dict()
        d["prediction_count"] = Prediction.query.filter_by(user_id=u.id).count()
        d["is_active"] = u.is_active
        results.append(d)

    return jsonify({"users": results, "page": page, "per_page": per_page, "total": total}), 200


@admin_bp.patch("/users/<user_id>")
@admin_required
def update_user(user_id):
    acting_admin_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}

    if "is_admin" in data:
        if user.id == acting_admin_id and not data["is_admin"]:
            return jsonify({"error": "You can't remove your own admin access."}), 400
        user.is_admin = bool(data["is_admin"])

    if "is_active" in data:
        if user.id == acting_admin_id and not data["is_active"]:
            return jsonify({"error": "You can't disable your own account."}), 400
        user.is_active = bool(data["is_active"])

    db.session.commit()
    log_event(
        "admin_user_updated",
        f"Admin updated user {user.email} (admin={user.is_admin}, active={user.is_active})",
        user_id=acting_admin_id,
    )
    notify(
        user.id,
        "admin",
        "Account updated",
        "An administrator changed your account settings (role or access status).",
    )
    return jsonify({"user": user.to_dict() | {"is_active": user.is_active}}), 200


@admin_bp.delete("/users/<user_id>")
@admin_required
def delete_user(user_id):
    acting_admin_id = get_jwt_identity()
    if user_id == acting_admin_id:
        return jsonify({"error": "You can't delete your own account from here."}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    email = user.email
    notify(user.id, "admin", "Account removed", "Your account was removed by an administrator.")
    db.session.delete(user)  # cascades to predictions
    db.session.commit()
    log_event("admin_user_deleted", f"Admin deleted user {email}", user_id=acting_admin_id, level="warning")
    return jsonify({"message": "User deleted."}), 200


# --------------------------------------------------------- predictions ----
@admin_bp.get("/predictions")
@admin_required
def list_all_predictions():
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 20)), 1), 100)

    query = Prediction.query.join(User).order_by(Prediction.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    results = []
    for p in items:
        d = p.to_dict()
        d["user_email"] = p.user.email if p.user else None
        d["user_name"] = p.user.name if p.user else None
        results.append(d)

    return jsonify({"predictions": results, "page": page, "per_page": per_page, "total": total}), 200


@admin_bp.delete("/predictions/<prediction_id>")
@admin_required
def admin_delete_prediction(prediction_id):
    acting_admin_id = get_jwt_identity()
    prediction = Prediction.query.get(prediction_id)
    if not prediction:
        return jsonify({"error": "Prediction not found."}), 404

    db.session.delete(prediction)
    db.session.commit()
    log_event("admin_prediction_deleted", f"Admin deleted prediction {prediction_id}", user_id=acting_admin_id)
    return jsonify({"message": "Prediction deleted."}), 200


# ------------------------------------------------------------ analytics ----
@admin_bp.get("/analytics")
@admin_required
def platform_analytics():
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    fourteen_days_ago = today_start - timedelta(days=13)

    total_users = User.query.count()
    total_predictions = Prediction.query.count()
    today_predictions = Prediction.query.filter(Prediction.created_at >= today_start).count()
    new_users_today = User.query.filter(User.created_at >= today_start).count()

    avg_confidence = db.session.query(func.avg(Prediction.confidence)).scalar()
    avg_confidence = round(float(avg_confidence), 2) if avg_confidence is not None else 0.0

    digit_distribution = [0] * 10
    for digit, count in db.session.query(Prediction.predicted_digit, func.count(Prediction.id)).group_by(
        Prediction.predicted_digit
    ):
        digit_distribution[digit] = count

    daily_rows = (
        db.session.query(func.date(Prediction.created_at), func.count(Prediction.id))
        .filter(Prediction.created_at >= fourteen_days_ago)
        .group_by(func.date(Prediction.created_at))
        .all()
    )
    by_date = {str(d): c for d, c in daily_rows}
    daily_labels, daily_counts = [], []
    for i in range(14):
        day = (fourteen_days_ago + timedelta(days=i)).date()
        daily_labels.append(day.strftime("%b %d"))
        daily_counts.append(by_date.get(str(day), 0))

    source_rows = db.session.query(Prediction.source, func.count(Prediction.id)).group_by(Prediction.source).all()
    source_breakdown = {source: count for source, count in source_rows}

    return jsonify(
        {
            "total_users": total_users,
            "new_users_today": new_users_today,
            "total_predictions": total_predictions,
            "today_predictions": today_predictions,
            "average_confidence": avg_confidence,
            "digit_distribution": digit_distribution,
            "daily_trend": {"labels": daily_labels, "values": daily_counts},
            "source_breakdown": {"draw": source_breakdown.get("draw", 0), "upload": source_breakdown.get("upload", 0)},
        }
    ), 200


# ----------------------------------------------------------- model info ----
@admin_bp.get("/model-stats")
@admin_required
def model_stats():
    from app.services import model_service

    report_path = os.path.join(ML_DIR, "model", "evaluation_report.json")
    model_path = os.path.join(ML_DIR, "model", "digit_model.h5")

    report = None
    if os.path.exists(report_path):
        with open(report_path) as f:
            report = json.load(f)

    model_size_bytes = os.path.getsize(model_path) if os.path.exists(model_path) else 0

    return jsonify(
        {
            "model_loaded": model_service.is_model_loaded(),
            "model_size_bytes": model_size_bytes,
            "evaluation": report,
        }
    ), 200


# ---------------------------------------------------------------- logs ----
@admin_bp.get("/logs")
@admin_required
def list_logs():
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 30)), 1), 100)
    level = request.args.get("level")

    query = SystemLog.query
    if level in {"info", "warning", "error"}:
        query = query.filter(SystemLog.level == level)
    query = query.order_by(SystemLog.created_at.desc())

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({"logs": [l.to_dict() for l in items], "page": page, "per_page": per_page, "total": total}), 200
