import uuid
from datetime import datetime, timezone
from app.extensions import db


class SystemLog(db.Model):
    __tablename__ = "system_logs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    level = db.Column(db.String(10), nullable=False, default="info")  # info | warning | error
    event = db.Column(db.String(60), nullable=False)  # e.g. "user_registered", "login_failed"
    message = db.Column(db.String(500), nullable=False)
    user_id = db.Column(
        db.String(36), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    ip_address = db.Column(db.String(64), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "level": self.level,
            "event": self.event,
            "message": self.message,
            "user_id": self.user_id,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
