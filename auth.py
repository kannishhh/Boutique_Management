import secrets
from functools import wraps
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta


ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = generate_password_hash("REMOVED_SECRET")

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
    if username != ADMIN_USERNAME:
        return None

    if not check_password_hash(ADMIN_PASSWORD_HASH, password):
        return None

    return generate_token()


def logout_user(token):
    if token in active_tokens:
        del active_tokens[token]


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
