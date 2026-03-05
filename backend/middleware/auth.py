import secrets
from functools import wraps
from datetime import datetime, timedelta

from flask import request, jsonify, g

from config.settings import current_config as config


active_tokens = {}


def generate_token(user_id):
    token = secrets.token_hex(16)
    expiry = datetime.utcnow() + timedelta(minutes=config.TOKEN_EXPIRY_MINUTES)
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


def logout_token(token):
    if token in active_tokens:
        del active_tokens[token]


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
