import re
from email_validator import validate_email, EmailNotValidError

PASSWORD_MIN_LENGTH = 8


def validate_name(name):
    if not name or not isinstance(name, str):
        return "Name is required."
    name = name.strip()
    if len(name) < 2 or len(name) > 120:
        return "Name must be between 2 and 120 characters."
    return None


def validate_email_address(email):
    if not email or not isinstance(email, str):
        return "Email is required.", None
    try:
        result = validate_email(email, check_deliverability=False)
        return None, result.normalized
    except EmailNotValidError as e:
        return str(e), None


def validate_password_strength(password):
    if not password or not isinstance(password, str):
        return "Password is required."
    if len(password) < PASSWORD_MIN_LENGTH:
        return f"Password must be at least {PASSWORD_MIN_LENGTH} characters."
    if not re.search(r"[A-Z]", password):
        return "Password must include at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return "Password must include at least one lowercase letter."
    if not re.search(r"\d", password):
        return "Password must include at least one number."
    return None
