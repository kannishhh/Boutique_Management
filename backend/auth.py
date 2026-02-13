import secrets
from functools import wraps
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from database import get_connection, is_postgres


active_tokens = {}

TOKEN_EXPIRY_MINUTES = 60


def generate_token():
    token = secrets.token_hex(16)
    expiry = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES)
    active_tokens[token] = expiry
    return token


def verify_token(token):
    expiry = active_tokens.get(token)

    if not expiry:
        return False

    if datetime.utcnow() > expiry:
        del active_tokens[token]
        return False

    return True


def login_user(username, password):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    else:
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))

    user = cursor.fetchone()
    conn.close()

    if not user:
        return None

    if not check_password_hash(user["password_hash"], password):
        return None

    return generate_token()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token missing"}), 401

        token = auth_header.split(" ")[1]

        if not verify_token(token):
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)

    return decorated


def logout_user(token):
    if token in active_tokens:
        del active_tokens[token]
