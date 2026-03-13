from flask import Flask, jsonify, request, make_response

from config.settings import current_config as config
from database import init_db
from routes.analytics import analytics_bp
from routes.auth import auth_bp
from routes.calendar import calendar_bp
from routes.customers import customers_bp
from routes.measurement_templates import templates_bp
from routes.measurements import measurements_bp
from routes.media import media_bp
from routes.notifications import notifications_bp
from routes.orders import orders_bp
from routes.payments import payments_bp
from routes.reminders import reminders_bp
from routes.settings import settings_bp


app = Flask(__name__)


def is_allowed_origin(origin):
    if not origin:
        return False

    if origin in config.CORS_ORIGINS:
        return True

    localhost_prefixes = (
        "http://localhost:",
        "http://127.0.0.1:",
        "https://localhost:",
        "https://127.0.0.1:",
    )
    return origin.startswith(localhost_prefixes)


@app.before_request
def handle_options_preflight():
    if request.method == "OPTIONS":
        response = make_response("", 204)
        return add_cors_headers(response)
    return None


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if is_allowed_origin(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"

    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = ", ".join(
        config.CORS_ALLOW_HEADERS
    )
    response.headers["Access-Control-Allow-Methods"] = ", ".join(
        config.CORS_METHODS
    )
    return response

init_db()


app.register_blueprint(templates_bp)
app.register_blueprint(calendar_bp)
app.register_blueprint(settings_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(customers_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(measurements_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(reminders_bp)
app.register_blueprint(media_bp)


@app.errorhandler(Exception)
def handle_unexpected_error(error):
    app.logger.exception("Unhandled backend error", exc_info=error)
    return jsonify({"error": "Internal server error"}), 500


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Boutique Management App is running!"})


if __name__ == "__main__":
    app.run(debug=True)
