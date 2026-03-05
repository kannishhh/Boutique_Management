import json
import os
from database import get_connection


def is_postgres():
    return os.getenv("DATABASE_URL") is not None


# ---------------------------------------------------
# CREATE MEASUREMENTS
# ---------------------------------------------------
def create_measurement_db(customer_id, garment_type, gender, measurements):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            INSERT INTO measurements (customer_id, garment_type, gender, measurement_values)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (customer_id, garment_type, gender, json.dumps(measurements)),
        )
        measurement_id = cursor.fetchone()[0]
    else:
        cursor.execute(
            """
            INSERT INTO measurements (customer_id, garment_type, gender, measurement_values)
            VALUES (?, ?, ?, ?)
            """,
            (customer_id, garment_type, gender, json.dumps(measurements)),
        )
        measurement_id = cursor.lastrowid

    conn.commit()
    conn.close()
    
    return measurement_id


# ---------------------------------------------------
# GET MEASUREMENTS
# ---------------------------------------------------
def get_all_measurements_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT 
            m.id AS measurement_id, 
            m.customer_id,
            c.name AS customer_name,
            m.garment_type AS template_name, 
            m.gender,
            m.measurement_values,
            m.created_at
        FROM measurements m
        JOIN customers c On c.customer_id = m.customer_id
        ORDER BY m.created_at DESC
        """
    )

    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        item = dict(r)
        item["measurements"] = json.loads(item["measurement_values"])
        result.append(item)

    return result


# ---------------------------------------------------
# UPDATE MEASUREMENTS
# ---------------------------------------------------
def update_measurement_db(mid, measurements):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            UPDATE measurements
            SET measurement_values = %s
            WHERE id = %s
""",
            (json.dumps(measurements), mid),
        )

    else:
        cursor.execute(
            """
            UPDATE measurements
            SET measurement_values = ?
            WHERE id = ?
""",
            (json.dumps(measurements), mid),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------
# DELETE MEASUREMENTS
# ---------------------------------------------------
def delete_measurement_db(mid):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("DELETE FROM measurements WHERE id = %s", (mid,))
    else:
        cursor.execute("DELETE FROM measurements WHERE id = ?", (mid,))

    conn.commit()
    conn.close()


# ---------------------------------------------------
# MEASUREMENT HISTORY
# ---------------------------------------------------
def get_measurement_history_db(customer_id):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            SELECT * FROM measurements
            WHERE customer_id = %s
            ORDER BY created_at DESC
            """,
            (customer_id,),
        )
    else:
        cursor.execute(
            """
            SELECT * FROM measurements
            WHERE customer_id = ?
            ORDER BY created_at DESC
            """,
            (customer_id,),
        )

    rows = cursor.fetchall()
    conn.close()

    return [dict(r) for r in rows]
