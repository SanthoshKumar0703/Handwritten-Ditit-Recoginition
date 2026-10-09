from app.extensions import db, socketio
from app.models import Notification

VALID_CATEGORIES = {"prediction", "report", "security", "admin"}


def notify(user_id: str, category: str, title: str, message: str, link: str | None = None):
    """Creates a Notification row and pushes it to that user's browser(s) in
    real time. Never raises — a notification failing to send should never
    break the action that triggered it (a prediction still succeeded even
    if, say, the socket emit hiccups)."""
    if category not in VALID_CATEGORIES:
        category = "security"

    try:
        entry = Notification(
            user_id=user_id, category=category, title=title, message=message, link=link
        )
        db.session.add(entry)
        db.session.commit()

        socketio.emit("notification", entry.to_dict(), room=user_id)
    except Exception:  # noqa: BLE001
        db.session.rollback()
