from flask import Blueprint, jsonify, request

from auth import token_required
from services.payments_service import add_payment_db, get_payments_by_order_db


payments_bp = Blueprint("payments", __name__, url_prefix="/orders")


@payments_bp.route("/<int:order_id>/payments", methods=["POST"])
@token_required
def add_payment(order_id):
    data = request.get_json()

    amount = data.get("amount")
    method = data.get("method")

    if not amount or amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    add_payment_db(order_id, amount, method)

    return jsonify({"message": "Payment recorded successfully"})


@payments_bp.route("/<int:order_id>/payments", methods=["GET"])
@token_required
def get_payments(order_id):
    return jsonify(get_payments_by_order_db(order_id))
