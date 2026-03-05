from datetime import datetime, timedelta
import secrets

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from middleware.auth import (
    generate_token,
    logout_token,
    token_required,
)
from services.auth_service import (
    find_user_by_username,
    save_reset_token,
    find_user_by_reset_token,
    update_user_password,
    clear_reset_token,
    verify_credentials,
    get_current_user,
)


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing JSON"}), 400

    user = verify_credentials(data.get("username"), data.get("password"))

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user["id"])

    return jsonify({"message": "Login Successful", "token": token})


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout():
    auth_header = request.headers.get("Authorization")
    token = auth_header.split(" ")[1]

    logout_token(token)

    return jsonify({"message": "Logged out successfully"})


@auth_bp.route("/auth/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    user = find_user_by_username(data["username"])

    if not user:
        return jsonify({"message": "If user exists, reset link sent"}), 200

    token = secrets.token_urlsafe(32)
    expiry = (datetime.utcnow() + timedelta(minutes=15)).isoformat()

    save_reset_token(user["id"], token, expiry)

    # TODO: send email here
    print("Reset link:", f"http://localhost:5173/reset-password/{token}")

    return jsonify({"message": "Reset link sent"}), 200


@auth_bp.route("/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("password")

    user = find_user_by_reset_token(token)

    if not user:
        return jsonify({"error": "Invalid or expired token"}), 400

    update_user_password(user["id"], generate_password_hash(new_password))

    clear_reset_token(user["id"])

    return jsonify({"message": "Password reset successful"}), 200


@auth_bp.route("/auth/me", methods=["GET"])
@token_required
def auth_me():
    return get_current_user()
