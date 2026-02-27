import os
import uuid

from flask import Blueprint, jsonify, request, g
from werkzeug.utils import secure_filename

from auth import token_required
from database import get_connection, is_postgres
from services.settings_service import (
    get_settings_db,
    update_profile_db,
    update_boutique_db,
    update_notifications_db,
    update_appearance_db,
    change_password_db,
)

settings_bp = Blueprint("settings", __name__, url_prefix="/settings")

UPLOAD_FOLDER = "uploads/profile"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@settings_bp.get("")
@token_required
def get_settings():
    return jsonify(get_settings_db())


@settings_bp.put("/profile")
@token_required
def update_profile():
    data = request.json
    update_profile_db(data)
    return jsonify({"message": "Profile updated"})


@settings_bp.put("/boutique")
@token_required
def update_boutique():
    data = request.json
    update_boutique_db(data)
    return jsonify({"message": "Boutique updated"})


@settings_bp.put("/notifications")
@token_required
def update_notifications():
    data = request.json
    update_notifications_db(data)
    return jsonify({"message": "Notifications updated"})


@settings_bp.put("/appearance")
@token_required
def update_appearance():
    data = request.json
    update_appearance_db(data)
    return jsonify({"message": "Appearance updated"})


@settings_bp.put("/change-password")
@token_required
def change_password():
    data = request.json
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    user_id = g.current_user["id"]

    if not current_password or not new_password:
        return jsonify({"error": "Missing fields"}), 400

    result = change_password_db(user_id, current_password, new_password)

    if not result["success"]:
        return jsonify({"error": result["message"]}), 400

    return jsonify({"message": "Password changed successfully"})


@settings_bp.put("/upload/profile")
@token_required
def upload_profile_picture():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    original_filename = secure_filename(file.filename)
    ext = original_filename.rsplit(".", 1)[-1]
    unique_filename = f"{uuid.uuid4().hex}.{ext}"

    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)

    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "UPDATE users SET profile_image = %s WHERE id = %s",
            (unique_filename, g.current_user["id"]),
        )
    else:
        cursor.execute(
            "UPDATE users SET profile_image = ? WHERE id = ?",
            (unique_filename, g.current_user["id"]),
        )

    conn.commit()
    conn.close()

    return jsonify({"filename": unique_filename})
