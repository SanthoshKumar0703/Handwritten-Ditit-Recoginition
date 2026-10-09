import uuid
from datetime import datetime, timezone
from app.extensions import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    category = db.Column(db.String(20), nullable=False)  # "prediction" | "report" | "security" | "admin"
    title = db.Column(db.String(120), nullable=False)
    message = db.Column(db.String(300), nullable=False)
    link = db.Column(db.String(200), nullable=True)  # frontend route to open on click, e.g. /dashboard/history

    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "category": self.category,
            "title": self.title,
            "message": self.message,
            "link": self.link,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
