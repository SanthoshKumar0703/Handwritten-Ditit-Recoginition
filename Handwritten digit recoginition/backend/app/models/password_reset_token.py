import uuid
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from app.extensions import db


class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    token_hash = db.Column(db.String(128), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @staticmethod
    def hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    @classmethod
    def generate(cls, user_id: str, expires_minutes: int):
        """Create a new token, returning (raw_token_for_email, model_instance)."""
        raw_token = secrets.token_urlsafe(48)
        instance = cls(
            user_id=user_id,
            token_hash=cls.hash_token(raw_token),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=expires_minutes),
        )
        return raw_token, instance

    def is_valid(self) -> bool:
        expires_at = self.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return (not self.used) and expires_at > datetime.now(timezone.utc)
