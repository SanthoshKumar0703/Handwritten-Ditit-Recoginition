import uuid
from datetime import datetime, timezone
from app.extensions import db


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)

    predicted_digit = db.Column(db.SmallInteger, nullable=False)
    confidence = db.Column(db.Float, nullable=False)  # 0-100
    top_predictions = db.Column(db.JSON, nullable=False)  # [{digit, confidence}, ...] top 3
    processing_time_ms = db.Column(db.Float, nullable=False)

    source = db.Column(db.String(10), nullable=False)  # "draw" | "upload"
    image_data = db.Column(db.Text, nullable=True)  # base64 PNG, small (28x28-derived preview)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = db.relationship("User", backref=db.backref("predictions", lazy=True, cascade="all, delete-orphan"))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "predicted_digit": self.predicted_digit,
            "confidence": round(self.confidence, 2),
            "top_predictions": self.top_predictions,
            "processing_time_ms": round(self.processing_time_ms, 1),
            "source": self.source,
            "image_data": self.image_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
