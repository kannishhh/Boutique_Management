from flask import Blueprint, jsonify, request, g

from auth import token_required
from customers import (
    delete_customer_db,
    create_customer_db,
    get_all_customers_db,
    update_customer_db,
)
from services.measurements_service import get_measurement_history_db
from services.notification_service import create_notification


customers_bp = Blueprint("customers", __name__, url_prefix="/customers")


@customers_bp.route("", methods=["GET"])
@token_required
def get_customers():
    customers = get_all_customers_db()
    return jsonify(customers)


@customers_bp.route("", methods=["POST"])
@token_required
def create_customer():
    data = request.get_json()

    success, message, customer_id = create_customer_db(
        data.get("name"), data.get("mobile"), data.get("address"), data.get("notes")
    )

    if success:
        customer_name = data.get("name")
        notification_message = f"New customer CUST-{str(customer_id).zfill(3)}({customer_name}) has been added."
        create_notification(g.current_user["id"], notification_message)
        return jsonify({"message": message}), 201

    return jsonify({"error": message}), 400


@customers_bp.route("/<int:cid>", methods=["PUT"])
@token_required
def update_customer(cid):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 401

    update_customer_db(cid, data)

    customer_name = data.get("name", "Customer")
    notification_message = (
        f"Customer CUST-{str(cid).zfill(3)}({customer_name}) has been updated."
    )
    create_notification(g.current_user["id"], notification_message)

    return jsonify({"message": "Customer updated successfully"})


@customers_bp.route("/<int:cid>", methods=["DELETE"])
@token_required
def delete_customer(cid):
    delete_customer_db(cid)
    return jsonify({"message": "Customer deleted"})


@customers_bp.route("/<int:customer_id>/measurements", methods=["GET"])
@token_required
def get_customer_measurements(customer_id):
    return jsonify(get_measurement_history_db(customer_id))
