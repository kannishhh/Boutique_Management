import json
import os
from database import get_connection
from werkzeug.security import check_password_hash, generate_password_hash


def is_postgres():
    return bool(os.getenv("DATABASE_URL"))


# ---------------------------------------------------
# GET SETTINGS
# ---------------------------------------------------
def get_settings_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM settings WHERE id = 1")
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {}

    result = dict(row)

    if not is_postgres():
        try:
            result["notifications"] = (
                json.loads(result["notifications"]) if result["notifications"] else {}
            )
        except:
            result["notifications"] = {}

        try:
            result["appearance"] = (
                json.loads(result["appearance"]) if result["appearance"] else {}
            )
        except:
            result["appearance"] = {}

    return result


# ---------------------------------------------------
# UPDATE PROFILE
# ---------------------------------------------------
def update_profile_db(data):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            UPDATE settings
            SET profile_name = %s,
                profile_email = %s,
                profile_phone = %s
            WHERE id = 1
        """,
            (
                data.get("name"),
                data.get("email"),
                data.get("phone"),
            ),
        )
    else:
        cursor.execute(
            """
            UPDATE settings
            SET profile_name = ?,
                profile_email = ?,
                profile_phone = ?
            WHERE id = 1
        """,
            (
                data.get("name"),
                data.get("email"),
                data.get("phone"),
            ),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------
# UPDATE BOUTIQUE
# ---------------------------------------------------
def update_boutique_db(data):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            UPDATE settings
            SET boutique_name = %s,
                boutique_contact = %s,
                boutique_email = %s,
                boutique_address = %s,
                gst_number = %s
            WHERE id = 1
        """,
            (
                data.get("name"),
                data.get("contact"),
                data.get("email"),
                data.get("address"),
                data.get("gst", ""),
            ),
        )
    else:
        cursor.execute(
            """
            UPDATE settings
            SET boutique_name = ?,
                boutique_contact = ?,
                boutique_email = ?,
                boutique_address = ?,
                gst_number = ?
            WHERE id = 1
        """,
            (
                data.get("name"),
                data.get("contact"),
                data.get("email"),
                data.get("address"),
                data.get("gst", ""),
            ),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------
# UPDATE NOTIFICATIONS
# ---------------------------------------------------
def update_notifications_db(data):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            UPDATE settings
            SET notifications = %s
            WHERE id = 1
        """,
            (json.dumps(data),),
        )
    else:
        cursor.execute(
            """
            UPDATE settings
            SET notifications = ?
            WHERE id = 1
        """,
            (json.dumps(data),),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------
# UPDATE APPEARANCE
# ---------------------------------------------------
def update_appearance_db(data):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            UPDATE settings
            SET appearance = %s
            WHERE id = 1
        """,
            (json.dumps(data),),
        )
    else:
        cursor.execute(
            """
            UPDATE settings
            SET appearance = ?
            WHERE id = 1
        """,
            (json.dumps(data),),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------
# CHANGE PASSWORD
# ---------------------------------------------------
def change_password_db(user_id, current_password, new_password):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
    else:
        cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return {"success": False, "message": "User not found"}

    stored_hash = user["password_hash"]

    if not check_password_hash(stored_hash, current_password):
        conn.close()
        return {"success": False, "message": "Current password is incorrect"}

    new_hash = generate_password_hash(new_password)
    if is_postgres():
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE id = %s",
            (new_hash, user_id),
        )
    else:
        cursor.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (new_hash, user_id),
        )

    conn.commit()
    conn.close()
    return {"success": True}
