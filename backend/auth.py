import secrets
from functools import wraps
from flask import request, jsonify, g
from werkzeug.security import check_password_hash
from datetime import datetime, timedelta
from database import get_connection, is_postgres
from services.auth_service import find_user_by_username

active_tokens = {}

TOKEN_EXPIRY_MINUTES = 60


def generate_token(user_id):
    token = secrets.token_hex(16)
    expiry = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES)
    active_tokens[token] = {"user_id": user_id, "expiry": expiry}
    return token


def verify_token(token):
    token_data = active_tokens.get(token)

    if not token_data:
        return None

    if datetime.utcnow() > token_data["expiry"]:
        del active_tokens[token]
        return None

    return token_data


def login_user(username, password):

    user = find_user_by_username(username)

    if not user:
        return None

    if not check_password_hash(user["password_hash"], password):
        return None

    return generate_token(user["id"])


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token missing"}), 401

        token = auth_header.split(" ")[1]

        data = verify_token(token)
        if not data:
            return jsonify({"error": "Invalid or expired token"}), 401

        g.current_user = {"id": data["user_id"]}

        return f(*args, **kwargs)

    return decorated


def logout_user(token):
    if token in active_tokens:
        del active_tokens[token]


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
