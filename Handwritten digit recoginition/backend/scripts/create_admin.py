"""
Promotes an existing user to admin.

Usage:
    cd backend
    python scripts/create_admin.py someone@example.com
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["SKIP_MODEL_LOAD"] = "True"  # this script doesn't need the CNN loaded

from app import create_app
from app.extensions import db
from app.models import User


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/create_admin.py <email>")
        sys.exit(1)

    email = sys.argv[1].strip().lower()
    app = create_app()

    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"No account found for {email}. They need to register first.")
            sys.exit(1)

        if user.is_admin:
            print(f"{email} is already an admin.")
            return

        user.is_admin = True
        db.session.commit()
        print(f"{email} is now an admin.")


if __name__ == "__main__":
    main()
