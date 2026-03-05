from flask import Flask, jsonify
from flask_cors import CORS

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
CORS(
    app,
    resources={
        r"/*": {
            "origins": config.CORS_ORIGINS,
            "supports_credentials": config.CORS_SUPPORTS_CREDENTIALS,
            "allow_headers": config.CORS_ALLOW_HEADERS,
            "methods": config.CORS_METHODS,
        }
    },
)

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


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Boutique Management App is running!"})


if __name__ == "__main__":
    app.run(debug=True)
