from flask import Blueprint, jsonify, request, send_file

from auth import token_required, verify_token
from services.analytics_service import (
    get_dashboard_data_db,
    get_delivered_orders_db,
    get_earnings_report_db,
    export_orders_to_csv,
    get_full_revenue_dashboard_db,
)
from services.orders_service import get_order_by_id_db


analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/bill/<int:order_id>", methods=["GET"])
@token_required
def generate_bill_api(order_id):
    order = get_order_by_id_db(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order)


@analytics_bp.route("/dashboard/stats", methods=["GET"])
@token_required
def get_dashboard_stats():
    return jsonify(get_dashboard_data_db())


@analytics_bp.route("/dashboard/revenue", methods=["GET"])
@token_required
def full_revenue_dashboard():
    return jsonify(get_full_revenue_dashboard_db())


@analytics_bp.route("/reports/daily", methods=["GET"])
@token_required
def daily_report():
    delivered_orders = get_delivered_orders_db()

    return jsonify(
        {"total_delivered_orders": len(delivered_orders), "orders": delivered_orders}
    )


@analytics_bp.route("/reports/earnings", methods=["GET"])
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


@analytics_bp.route("/reports/export/orders", methods=["GET"])
def export_orders():
    token = request.headers.get("Authorization")

    if not token:
        token = request.args.get("token")

    if not token:
        return jsonify({"error": "Missing token"}), 401

    token = token.replace("Bearer ", "")

    if not verify_token(token):
        return jsonify({"error": "Invalid token"}), 401

    filename = export_orders_to_csv()
    return send_file(filename, as_attachment=True)
