from werkzeug.security import check_password_hash
from database import get_connection, is_postgres
from datetime import datetime
from flask import jsonify, g


def find_user_by_username(username):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    else:
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))

    user = cursor.fetchone()
    conn.close()

    return dict(user) if user else None


def save_reset_token(user_id, token, expiry):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "UPDATE users SET reset_token=%s, reset_token_expiry=%s WHERE id=%s",
            (token, expiry, user_id),
        )
    else:
        cursor.execute(
            "UPDATE users SET reset_token=?, reset_token_expiry=? WHERE id=?",
            (token, expiry, user_id),
        )

    conn.commit()
    conn.close()


def find_user_by_reset_token(token):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("SELECT * FROM users WHERE reset_token=%s", (token,))
    else:
        cursor.execute("SELECT * FROM users WHERE reset_token=?", (token,))

    user = cursor.fetchone()
    conn.close()

    if not user:
        return None

    user = dict(user)

    expiry = user.get("reset_token_expiry")
    if not expiry:
        return None

    if isinstance(expiry, str):
        expiry = datetime.fromisoformat(expiry)

    if datetime.utcnow() > expiry:
        return None

    return user


def update_user_password(user_id, hashed_password):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "UPDATE users SET password_hash=%s WHERE id=%s",
            (hashed_password, user_id),
        )
    else:
        cursor.execute(
            "UPDATE users SET password_hash=? WHERE id=?",
            (hashed_password, user_id),
        )

    conn.commit()
    conn.close()


def clear_reset_token(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "UPDATE users SET reset_token=NULL, reset_token_expiry=NULL WHERE id=%s",
            (user_id,),
        )
    else:
        cursor.execute(
            "UPDATE users SET reset_token=NULL, reset_token_expiry=NULL WHERE id=?",
            (user_id,),
        )

    conn.commit()
    conn.close()


def verify_credentials(username, password):
    user = find_user_by_username(username)

    if not user:
        return None

    if not check_password_hash(user["password_hash"], password):
        return None

    return user


def get_current_user():
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            SELECT 
                u.id, 
                u.username, 
                u.profile_image,
                s.profile_name 
            FROM users u 
            LEFT JOIN settings s ON s.id = 1 
            WHERE u.id = %s
            """,
            (g.current_user["id"],),
        )
    else:
        cursor.execute(
            """
            SELECT 
                u.id, 
                u.username, 
                u.profile_image,
                s.profile_name 
            FROM users u 
            LEFT JOIN settings s ON s.id = 1 
            WHERE u.id = ?
            """,
            (g.current_user["id"],),
        )

    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(dict(user))
