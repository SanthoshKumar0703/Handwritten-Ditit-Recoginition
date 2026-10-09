from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_socketio import SocketIO

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
mail = Mail()
cors = CORS()
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per minute"])

# async_mode="threading" needs no extra dependency (no eventlet/gevent) and
# works fine with Flask's dev server via socketio.run() — the right choice
# for this project's scale. For a multi-process production deployment behind
# gunicorn, switch to eventlet/gevent and point message_queue at Redis so
# every worker sees every emit.
socketio = SocketIO(cors_allowed_origins=[], async_mode="threading")
