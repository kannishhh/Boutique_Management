from flask import Blueprint, jsonify
from database import get_connection
from auth import token_required

calendar_bp = Blueprint("calendar", __name__)


@calendar_bp.route("/calendar/orders", methods=["GET"])
@token_required
def get_calendar_orders():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT order_id, customer_name, suit_type, delivery_date, status
        FROM orders
        WHERE status != 'CANCELLED'
    """
    )

    rows = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])
