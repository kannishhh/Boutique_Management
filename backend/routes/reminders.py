from flask import Blueprint, jsonify

from auth import token_required
from services.reminders_service import generate_due_reminders_db


reminders_bp = Blueprint("reminders", __name__, url_prefix="/reminders")


@reminders_bp.route("/generate", methods=["POST"])
@token_required
def generate_reminders():
    reminders = generate_due_reminders_db()
    return jsonify(reminders)
