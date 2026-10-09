import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


def _bool(name, default="False"):
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes", "on")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    DEBUG = _bool("DEBUG", "True")

    # ---- Database ----
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "digit_recognition")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---- JWT ----
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", 60))
    )
    JWT_REMEMBER_ME_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REMEMBER_ME_EXPIRES_DAYS", 30))
    )
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_TYPE = "Bearer"

    # ---- Mail ----
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = _bool("MAIL_USE_TLS", "True")
    MAIL_USE_SSL = _bool("MAIL_USE_SSL", "False")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", MAIL_USERNAME)

    # ---- App-specific ----
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    RESET_TOKEN_EXPIRES_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRES_MINUTES", 30))

    # Set by scripts that don't need the (slow-to-load) TensorFlow model.
    SKIP_MODEL_LOAD = _bool("SKIP_MODEL_LOAD", "False")

    # ---- Admin bootstrap ----
    # Comma-separated emails that are automatically granted admin access
    # the moment they register. Meant for initial setup only — promote or
    # demote further admins from the admin panel itself once one exists.
    ADMIN_EMAILS = [e for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()]
