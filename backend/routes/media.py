from flask import Blueprint, send_from_directory


media_bp = Blueprint("media", __name__)


@media_bp.route("/uploads/profile/<filename>")
def serve_profile_image(filename):
    return send_from_directory("uploads/profile", filename)
