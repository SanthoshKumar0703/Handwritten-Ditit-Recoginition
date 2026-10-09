from app import create_app
from app.extensions import db, socketio
from app import models  # noqa: F401  (ensures models are registered before create_all)

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    # socketio.run wraps Flask's dev server so both REST endpoints and the
    # WebSocket connection are served from this one process — no separate
    # socket server to run.
    socketio.run(app, debug=app.config["DEBUG"], port=5000, allow_unsafe_werkzeug=True)
