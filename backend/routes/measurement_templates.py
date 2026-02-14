import json
from flask import Blueprint, jsonify
from database import get_connection, is_postgres

templates_bp = Blueprint("templates_bp", __name__)


@templates_bp.route("/api/templates", methods=["GET"])
def get_templates():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT garment_type, fields_json FROM measurement_templates")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    templates = {}

    for row in rows:
        if is_postgres():
            garment = row["garment_type"]
            fields = row["fields_json"]
        else:
            garment = row[0]
            fields = row[1]

        if isinstance(fields, str):
            fields = json.loads(fields)

        templates[garment] = fields

    return jsonify(templates)
