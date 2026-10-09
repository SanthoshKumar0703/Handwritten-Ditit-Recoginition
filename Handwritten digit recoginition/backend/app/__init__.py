from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, bcrypt, jwt, mail, cors, limiter, socketio


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)
    limiter.init_app(app)
    socketio.init_app(app, cors_allowed_origins=app.config["CORS_ORIGINS"])

    from app.routes.auth import auth_bp
    from app.routes.predictions import predictions_bp
    from app.routes.reports import reports_bp
    from app.routes.admin import admin_bp
    from app.routes.notifications import notifications_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(predictions_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notifications_bp)

    # Registers the @socketio.on(...) handlers (connect/disconnect auth).
    from app import sockets  # noqa: F401

    if not app.config.get("TESTING") and not app.config.get("SKIP_MODEL_LOAD"):
        from app.services import model_service

        try:
            model_service.load_model()
        except FileNotFoundError as exc:
            app.logger.warning(
                f"{exc} The /api/predictions/predict endpoint will return 503 until it's trained."
            )

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Session expired. Please log in again."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"error": "Invalid authentication token."}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        return jsonify({"error": "Authentication required."}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found."}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error."}), 500

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        return response

    return app
