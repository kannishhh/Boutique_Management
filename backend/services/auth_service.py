from database import get_connection, is_postgres
from datetime import datetime


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

    # Convert string to datetime if sqlite
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
