from flask import Blueprint, jsonify, request, g

from middleware.auth import token_required
from services.measurements_service import (
    create_measurement_db,
    get_all_measurements_db,
    update_measurement_db,
    delete_measurement_db,
)
from services.notification_service import create_notification


measurements_bp = Blueprint("measurements", __name__, url_prefix="/measurements")


@measurements_bp.route("", methods=["GET"])
@token_required
def get_measurements():
    return jsonify(get_all_measurements_db())


@measurements_bp.route("", methods=["POST"])
@token_required
def create_measurement():
    data = request.get_json()
    required = ["customer_id", "template_name", "gender", "measurements"]

    if not data or not all(field in data for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    measurement_id = create_measurement_db(
        data["customer_id"], data["template_name"], data["gender"], data["measurements"]
    )

    template_name = data.get("template_name", "measurement")
    notification_message = f"New {template_name} measurement MEAS-{str(measurement_id).zfill(3)} has been added."
    create_notification(g.current_user["id"], notification_message)

    return jsonify({"message": "Measurement saved"}), 201


@measurements_bp.route("/<int:mid>", methods=["PUT"])
@token_required
def update_measurement(mid):
    data = request.get_json()
    update_measurement_db(mid, data["measurements"])

    notification_message = f"Measurement MEAS-{str(mid).zfill(3)} has been updated."
    create_notification(g.current_user["id"], notification_message)

    return jsonify({"message": "Measurement updated"})


@measurements_bp.route("/<int:mid>", methods=["DELETE"])
@token_required
def delete_measurement(mid):
    delete_measurement_db(mid)
    return jsonify({"message": "Measurement deleted"})
