from flask import Blueprint, jsonify, g, request
from auth import token_required
from services.notification_service import create_notification
from services.orders_service import (
    create_order_db,
    update_order_db,
    update_order_status_db,
    get_order_by_id_db,
    search_orders_db,
    delete_order_db,
)
from customers import find_customer_by_mobile
from services.measurements_service import create_measurement_db
from utils import is_valid_date
from services.reminders_service import get_due_orders_db
from database import get_connection, is_postgres


orders_bp = Blueprint("orders", __name__, url_prefix="/orders")


# -----------------------------
# GET ORDERS
# -----------------------------
@orders_bp.get("", strict_slashes=False)
@token_required
def get_orders():
    status = request.args.get("status")
    mobile = request.args.get("mobile")
    delivery_date = request.args.get("delivery_date")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))

    results = search_orders_db(status, mobile, delivery_date, page, limit)

    return jsonify(results)


# -----------------------------
# CREATE ORDERS
# -----------------------------
@orders_bp.post("", strict_slashes=False)
@token_required
def create_order_api():
    data = request.get_json()

    required_fields = ["mobile", "suit_type", "price", "advance_paid", "delivery_date"]

    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    customer = find_customer_by_mobile(data["mobile"])
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    measurement_values = data.get("measurement_values", {})
    gender = data.get("gender")

    if measurement_values:
        create_measurement_db(
            customer["customer_id"], data["suit_type"], gender, measurement_values
        )

    if data["advance_paid"] > data["price"]:
        return jsonify({"error": "Advance cannot exceed price"}), 400

    if not is_valid_date(data["delivery_date"]):
        return jsonify({"error": "Invalid delivery date format (DD-MM-YYYY)"}), 400

    order = {
        "customer_id": customer["customer_id"],
        "customer_name": customer["name"],
        "mobile": customer["mobile"],
        "suit_type": data["suit_type"],
        "cloth_provided": bool(data.get("cloth_provided", False)),
        "price": data["price"],
        "advance_paid": data["advance_paid"],
        "balance": data["price"] - data["advance_paid"],
        "delivery_date": data["delivery_date"],
        "status": "PENDING",
    }

    order_id = create_order_db(order)

    customer_name = customer["name"]
    suit_type = data["suit_type"]
    notification_message = f"New order ORD-{str(order_id).zfill(3)}({customer_name} - {suit_type}) has been created."
    create_notification(g.current_user["id"], notification_message)

    return jsonify({"message": "Order created successfully"}), 201


# -----------------------------
# UPDATE ORDERS
# -----------------------------
@orders_bp.put("/<int:order_id>")
@token_required
def update_order_api(order_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    from services.orders_service import get_order_by_id_db

    old_order = get_order_by_id_db(order_id)
    old_status = old_order.get("status") if old_order else None
    new_status = data.get("status")

    update_order_db(order_id, data)

    if new_status and new_status in ["READY", "DELIVERED"] and old_status != new_status:
        message = f"Order ORD-{str(order_id).zfill(3)} is now {new_status}."
        create_notification(g.current_user["id"], message)

    elif data:

        has_changes = False
        for key, value in data.items():
            if key != "status" and old_order and old_order.get(key) != value:
                has_changes = True
                break

        if has_changes:
            customer_name = old_order.get("customer_name", "Customer")
            notification_message = (
                f"Order ORD-{str(order_id).zfill(3)}({customer_name}) has been updated."
            )
            create_notification(g.current_user["id"], notification_message)

    return jsonify({"message": "Order updated successfully"})


# -----------------------------
# UPDATE ORDERS STATUS
# -----------------------------
@orders_bp.patch("/<int:order_id>/status")
@token_required
def update_order_status_api(order_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    new_status = data.get("status")

    VALID_STATUSES = ["PENDING", "CUTTING", "STITCHING", "TRIAL", "READY", "DELIVERED"]

    if new_status not in VALID_STATUSES:
        return jsonify({"error": "Invalid status"}), 400

    update_order_status_db(order_id, new_status)

    if new_status in ["READY", "DELIVERED"]:
        message = f"Order ORD-{str(order_id).zfill(3)} is now {new_status}."
        create_notification(g.current_user["id"], message)

    if new_status == "DELIVERED":
        order = get_order_by_id_db(order_id)

        if order:
            price = order["price"]
            advance = order["advance_paid"] or 0
            balance = price - advance

            if balance > 0:
                message = (
                    f"Order ORD-{order_id:03} delivered with pending balance ₹{balance}"
                )

    return jsonify({"message": "Status updated successfully"})


# -----------------------------
# DELETE ORDERS
# -----------------------------
@orders_bp.delete("/<int:order_id>")
@token_required
def delete_order_api(order_id):
    delete_order_db(order_id)
    return jsonify({"message": "Order deleted successfully"})


# -----------------------------
# DUE ORDERS
# -----------------------------
@orders_bp.get("/due")
@token_required
def get_due_orders():
    return jsonify(get_due_orders_db())


# -----------------------------
# UPDATE PAYMENT STATUS
# -----------------------------
@orders_bp.patch("/<int:order_id>/payment")
@token_required
def update_order_payment_api(order_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "SELECT price, advance_paid FROM orders WHERE order_id = %s",
            (order_id,),
        )
    else:
        cursor.execute(
            "SELECT price, advance_paid FROM orders WHERE order_id = ?",
            (order_id,),
        )

    order = cursor.fetchone()

    if not order:
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    price = order["price"]
    advance_paid = order["advance_paid"] or 0
    balance = price - advance_paid

    if data.get("clear") is True:
        new_advance = price
    else:
        amount = data.get("amount")

        if amount is None:
            conn.close()
            return jsonify({"error": "Payment amount is required"}), 400

        try:
            amount = float(amount)
        except:
            conn.close()
            return jsonify({"error": "Invalid payment amount"}), 400

        if amount <= 0:
            conn.close()
            return jsonify({"error": "Payment must be greater than zero"}), 400

        if amount > balance:
            conn.close()
            return jsonify({"error": "Payment exceeds remaining balance"}), 400

        new_advance = advance_paid + amount

    new_balance = price - new_advance

    if is_postgres():
        cursor.execute(
            "UPDATE orders SET advance_paid = %s, balance = %s WHERE order_id = %s",
            (new_advance, new_balance, order_id),
        )
    else:
        cursor.execute(
            "UPDATE orders SET advance_paid = ?, balance = ? WHERE order_id = ?",
            (new_advance, new_balance, order_id),
        )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Payment updated successfully",
        "new_advance_paid": new_advance,
        "balance": new_balance
    })