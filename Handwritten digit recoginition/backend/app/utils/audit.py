from functools import wraps

from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from app.extensions import db
from app.models import SystemLog, User


def log_event(event: str, message: str, level: str = "info", user_id: str | None = None):
    """Writes an audit-log row. Never raises — logging should never break
    the request it's attached to."""
    try:
        entry = SystemLog(
            level=level,
            event=event,
            message=message,
            user_id=user_id,
            ip_address=request.remote_addr if request else None,
        )
        db.session.add(entry)
        db.session.commit()
    except Exception:  # noqa: BLE001
        db.session.rollback()


def admin_required(fn):
    """Like @jwt_required(), but also requires the user to have is_admin set.
    Returns 403 (not 404) for non-admins, so the API doesn't pretend these
    routes don't exist — access control should be explicit, not obscured."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required."}), 403
        return fn(*args, **kwargs)

    return wrapper
