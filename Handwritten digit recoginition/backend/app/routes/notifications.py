from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Notification

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifications_bp.get("")
@jwt_required()
def list_notifications():
    user_id = get_jwt_identity()
    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 20)), 1), 50)

    query = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc())
    total = query.count()
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return jsonify(
        {
            "notifications": [n.to_dict() for n in items],
            "unread_count": unread_count,
            "page": page,
            "per_page": per_page,
            "total": total,
        }
    ), 200


@notifications_bp.post("/<notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    user_id = get_jwt_identity()
    entry = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not entry:
        return jsonify({"error": "Notification not found."}), 404
    entry.is_read = True
    db.session.commit()
    return jsonify({"notification": entry.to_dict()}), 200


@notifications_bp.post("/read-all")
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read."}), 200
