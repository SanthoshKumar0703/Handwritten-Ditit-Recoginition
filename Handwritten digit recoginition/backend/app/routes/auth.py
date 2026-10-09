from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from app.extensions import db, limiter
from app.models import User, PasswordResetToken
from app.utils.validators import (
    validate_name,
    validate_email_address,
    validate_password_strength,
)
from app.utils.mailer import send_password_reset_email
from app.utils.audit import log_event
from app.utils.notify import notify

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
@limiter.limit("10 per hour")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = data.get("email") or ""
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    error = validate_name(name)
    if error:
        return jsonify({"error": error}), 400

    email_error, normalized_email = validate_email_address(email)
    if email_error:
        return jsonify({"error": email_error}), 400

    error = validate_password_strength(password)
    if error:
        return jsonify({"error": error}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    if User.query.filter_by(email=normalized_email).first():
        return jsonify({"error": "An account with this email already exists."}), 409

    user = User(name=name, email=normalized_email)
    user.set_password(password)

    admin_emails = {e.strip().lower() for e in current_app.config.get("ADMIN_EMAILS", []) if e.strip()}
    if normalized_email.lower() in admin_emails:
        user.is_admin = True

    db.session.add(user)
    db.session.commit()
    log_event("user_registered", f"New account created: {user.email}", user_id=user.id)

    # Auto-login on first registration only
    access_token = create_access_token(
        identity=user.id, expires_delta=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    )

    return (
        jsonify({"message": "Account created.", "token": access_token, "user": user.to_dict()}),
        201,
    )


@auth_bp.post("/login")
@limiter.limit("20 per hour")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    remember_me = bool(data.get("remember_me"))

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        log_event("login_failed", f"Failed login attempt for {email}", level="warning")
        return jsonify({"error": "Invalid email or password."}), 401

    if not user.is_active:
        log_event("login_blocked", f"Login blocked for disabled account: {email}", level="warning", user_id=user.id)
        return jsonify({"error": "This account has been disabled."}), 403

    expires_delta = (
        current_app.config["JWT_REMEMBER_ME_EXPIRES"]
        if remember_me
        else current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
    )
    access_token = create_access_token(identity=user.id, expires_delta=expires_delta)
    log_event("login_success", f"{email} logged in", user_id=user.id)

    return jsonify({"token": access_token, "user": user.to_dict()}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.patch("/profile")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}

    if "name" in data:
        error = validate_name(data.get("name", ""))
        if error:
            return jsonify({"error": error}), 400
        user.name = data["name"].strip()

    if "avatar_url" in data:
        avatar = data.get("avatar_url") or None
        if avatar and len(avatar) > 2_000_000:  # ~2MB of base64
            return jsonify({"error": "Image is too large."}), 400
        user.avatar_url = avatar

    db.session.commit()
    notify(user_id, "security", "Profile updated", "Your name or photo was just changed.")
    return jsonify({"message": "Profile updated.", "user": user.to_dict()}), 200


@auth_bp.post("/change-password")
@jwt_required()
@limiter.limit("10 per hour")
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""
    confirm_password = data.get("confirm_password") or ""

    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect."}), 401

    error = validate_password_strength(new_password)
    if error:
        return jsonify({"error": error}), 400
    if new_password != confirm_password:
        return jsonify({"error": "New passwords do not match."}), 400
    if user.check_password(new_password):
        return jsonify({"error": "New password must be different from the current one."}), 400

    user.set_password(new_password)
    db.session.commit()
    log_event("password_changed", f"{user.email} changed their password", user_id=user.id)
    notify(user_id, "security", "Password changed", "Your password was just changed. If this wasn't you, contact support immediately.")
    return jsonify({"message": "Password updated."}), 200


@auth_bp.delete("/account")
@jwt_required()
@limiter.limit("5 per hour")
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    password = data.get("password") or ""
    if not user.check_password(password):
        return jsonify({"error": "Incorrect password."}), 401

    log_event("account_deleted", f"{user.email} deleted their account", user_id=user.id)
    db.session.delete(user)  # cascades to predictions and reset tokens
    db.session.commit()
    return jsonify({"message": "Account deleted."}), 200


@auth_bp.post("/forgot-password")
@limiter.limit("5 per hour")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    generic_response = jsonify(
        {"message": "If an account exists for that email, a reset link has been sent."}
    )

    if not email:
        return jsonify({"error": "Email is required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Do not reveal whether the account exists
        return generic_response, 200

    raw_token, token_record = PasswordResetToken.generate(
        user.id, current_app.config["RESET_TOKEN_EXPIRES_MINUTES"]
    )
    db.session.add(token_record)
    db.session.commit()

    reset_link = f"{current_app.config['FRONTEND_URL']}/reset-password/{raw_token}"

    try:
        send_password_reset_email(user.email, user.name, reset_link)
    except Exception as exc:  # noqa: BLE001
        current_app.logger.error(f"Failed to send reset email: {exc}")
        return jsonify({"error": "Could not send reset email. Try again later."}), 500

    return generic_response, 200


@auth_bp.post("/reset-password/<token>")
@limiter.limit("10 per hour")
def reset_password(token):
    data = request.get_json(silent=True) or {}
    new_password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    error = validate_password_strength(new_password)
    if error:
        return jsonify({"error": error}), 400
    if new_password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    token_hash = PasswordResetToken.hash_token(token)
    token_record = PasswordResetToken.query.filter_by(token_hash=token_hash).first()

    if not token_record or not token_record.is_valid():
        return jsonify({"error": "This reset link is invalid or has expired."}), 400

    user = User.query.get(token_record.user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    user.set_password(new_password)
    token_record.used = True
    db.session.commit()

    return jsonify({"message": "Password updated. You can now log in."}), 200
