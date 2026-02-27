from flask import Blueprint, jsonify, g
from auth import token_required
from database import get_connection, is_postgres

notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")


# -----------------------------
# GET ALL NOTIFICATIONS
# -----------------------------
@notifications_bp.get("", strict_slashes=False)
@token_required
def get_notifications():
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            SELECT id, message, is_read, created_at
            FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC
          """,
            (g.current_user["id"],),
        )
    else:
        cursor.execute(
            """
            SELECT id, message, is_read, created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
          """,
            (g.current_user["id"],),
        )

    rows = cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])


# -----------------------------
# MARK ONE AS READ
# -----------------------------
@notifications_bp.put("/<int:notification_id>/read")
@token_required
def mark_notifications_read(notification_id):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "UPDATE notifications SET is_read = TRUE WHERE id= %s AND user_id = %s",
            (
                notification_id,
                g.current_user["id"],
            ),
        )
    else:
        cursor.execute(
            "UPDATE notifications SET is_read = 1 WHERE id= ? AND user_id = ?",
            (
                notification_id,
                g.current_user["id"],
            ),
        )

    conn.commit()
    conn.close()

    return jsonify({"message": "Notification marked as read"})


# -----------------------------
# MARK ALL AS READ
# -----------------------------
@notifications_bp.put("/mark-all")
@token_required
def mark_all_notifications():
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = %s",
            (g.current_user["id"],),
        )
    else:
        cursor.execute(
            "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
            (g.current_user["id"],),
        )

    conn.commit()
    conn.close()

    return jsonify({"message": "All notifications marked as read"})
