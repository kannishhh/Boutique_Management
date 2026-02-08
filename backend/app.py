from flask import Flask, request, jsonify
from customers import find_customer_by_mobile, create_customer_db, get_all_customers_db
from orders import (
    create_order_db,
    get_all_orders_db,
    update_order_status_db,
    get_pending_orders_db,
    get_order_by_id_db,
    get_delivered_orders_db,
    get_earnings_report_db,
    search_orders_db,
    export_orders_to_csv,
)
from utils import is_valid_date
from auth import login_user, token_required, logout_user
from database import init_db
from flask import send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

init_db()


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Boutique Management App is running!"})


# ---------- AUTH ----------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON"}), 400

    token = login_user(data.get("username"), data.get("password"))

    if not token:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({"message": "Login Successful", "token": token})


@app.route("/logout", methods=["POST"])
@token_required
def logout():
    auth_header = request.headers.get("Authorization")
    token = auth_header.split(" ")[1]

    logout_user(token)

    return jsonify({"message": "Logged out successfully"})


# ---------- CUSTOMERS ----------
@app.route("/customers", methods=["GET"])
@token_required
def get_customers():
    customers = get_all_customers_db()
    return jsonify(customers)


@app.route("/customers", methods=["POST"])
@token_required
def create_customer():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    success, message = create_customer_db(
        data.get("name"),
        data.get("mobile"),
        data.get("address", ""),
        data.get("measurements", ""),
    )

    if not success:
        return jsonify({"error": message}), 400

    return jsonify({"message": message}), 201


# ---------- ORDERS ----------
@app.route("/orders", methods=["GET"])
@token_required
def get_orders():
    status = request.args.get("status")
    mobile = request.args.get("mobile")
    delivery_date = request.args.get("delivery_date")

    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))

    results = search_orders_db(status, mobile, delivery_date, page, limit)

    return jsonify(results)


@app.route("/orders", methods=["POST"])
@token_required
def create_order_api():
    data = request.get_json()

    required_fields = ["mobile", "suit_type", "price", "advance_paid", "delivery_date"]

    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    customer = find_customer_by_mobile(data["mobile"])
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    if data["advance_paid"] > data["price"]:
        return jsonify({"error": "Advance cannot exceed price"}), 400

    if not is_valid_date(data["delivery_date"]):
        return jsonify({"error": "Invalid delivery date format (DD-MM-YYYY)"}), 400

    order = {
        "customer_id": customer["customer_id"],
        "customer_name": customer["name"],
        "mobile": customer["mobile"],
        "suit_type": data["suit_type"],
        "cloth_provided": data.get("cloth_provided", False),
        "price": data["price"],
        "advance_paid": data["advance_paid"],
        "balance": data["price"] - data["advance_paid"],
        "delivery_date": data["delivery_date"],
        "status": "PENDING",
    }

    create_order_db(order)

    return jsonify({"message": "Order created successfully"}), 201


@app.route("/orders/<int:order_id>/status", methods=["PATCH"])
@token_required
def update_order_status_api(order_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    new_status = data.get("status")

    if new_status not in ["PENDING", "IN PROGRESS", "DELIVERED"]:
        return jsonify({"error": "Invalid status"}), 400

    update_order_status_db(order_id, new_status)

    return jsonify({"message": "Status updated successfully"})


@app.route("/orders/pending", methods=["GET"])
@token_required
def get_pending_orders():
    return jsonify(get_pending_orders_db())


@app.route("/bill/<int:order_id>", methods=["GET"])
@token_required
def generate_bill_api(order_id):
    order = get_order_by_id_db(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order)


@app.route("/reports/daily", methods=["GET"])
@token_required
def daily_report():
    delivered_orders = get_delivered_orders_db()

    return jsonify(
        {"total_delivered_orders": len(delivered_orders), "orders": delivered_orders}
    )


@app.route("/reports/earnings", methods=["GET"])
@token_required
def earnings_report():
    report = get_earnings_report_db()
    return jsonify(
        {
            "total_orders": report["total_orders"] or 0,
            "total_price": report["total_price"] or 0,
            "total_advance_collected": report["total_advance"] or 0,
            "total_pending_balance": report["total_balance"] or 0,
        }
    )


@app.route("/reports/export/orders", methods=["GET"])
@token_required
def export_orders():
    filename = export_orders_to_csv()
    return send_file(filename, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True)
