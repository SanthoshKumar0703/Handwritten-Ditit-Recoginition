"""
Real-time layer. A client connects with its JWT (the same access token used
for REST calls) passed as Socket.IO auth, gets verified here, and is placed
in a room named after their user id. Every notification is then emitted only
to that room — one user's events never reach another user's browser tab.
"""

from flask_jwt_extended import decode_token
from flask_socketio import join_room

from app.extensions import socketio


@socketio.on("connect")
def handle_connect(auth):
    token = (auth or {}).get("token")
    if not token:
        return False  # reject the connection — no token, no socket

    try:
        decoded = decode_token(token)
    except Exception:  # noqa: BLE001 — any decode failure means "not authenticated"
        return False

    user_id = decoded["sub"]
    join_room(user_id)
    # Flask-SocketIO keeps per-session state on request.sid automatically;
    # nothing else to store here.
    return True


@socketio.on("disconnect")
def handle_disconnect():
    pass  # room membership is cleaned up automatically when the session ends
