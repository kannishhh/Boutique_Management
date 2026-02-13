import json
import os
from database import get_connection



def is_postgres():
    return os.getenv("DATABASE_URL") is not None


# ---------------------------------------------------
# SAVE MEASUREMENTS
# ---------------------------------------------------
def save_measurements(customer_id, suit_type, measurements):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            INSERT INTO measurements (customer_id, garment_type, measurement_values)
            VALUES (%s, %s, %s)
            """,
            (customer_id, suit_type, json.dumps(measurements)),
        )
    else:
        cursor.execute(
            """
            INSERT INTO measurements (customer_id, garment_type, measurement_values)
            VALUES (?, ?, ?)
            """,
            (customer_id, suit_type, json.dumps(measurements)),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------
# CREATE ORDER
# ---------------------------------------------------
def create_order_db(order):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            INSERT INTO orders (
                customer_id, customer_name, mobile, suit_type,
                cloth_provided, price, advance_paid, balance,
                delivery_date, status
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                order["customer_id"],
                order["customer_name"],
                order["mobile"],
                order["suit_type"],
                order["cloth_provided"],
                order["price"],
                order["advance_paid"],
                order["balance"],
                order["delivery_date"],
                order["status"],
            ),
        )
    else:
        cursor.execute(
            """
            INSERT INTO orders (
                customer_id, customer_name, mobile, suit_type,
                cloth_provided, price, advance_paid, balance,
                delivery_date, status
            )
            VALUES (?,?,?,?,?,?,?,?,?,?)
            """,
            (
                order["customer_id"],
                order["customer_name"],
                order["mobile"],
                order["suit_type"],
                order["cloth_provided"],
                order["price"],
                order["advance_paid"],
                order["balance"],
                order["delivery_date"],
                order["status"],
            ),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------
# GET ALL ORDERS
# ---------------------------------------------------
def get_all_orders_db():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ---------------------------------------------------
# UPDATE ORDER STATUS
# ---------------------------------------------------
def update_order_status_db(order_id, status):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "UPDATE orders SET status = %s WHERE order_id = %s",
            (status, order_id),
        )
    else:
        cursor.execute(
            "UPDATE orders SET status = ? WHERE order_id = ?",
            (status, order_id),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------
# GET ORDER BY ID
# ---------------------------------------------------
def get_order_by_id_db(order_id):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("SELECT * FROM orders WHERE order_id = %s", (order_id,))
    else:
        cursor.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))

    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None


# ---------------------------------------------------
# SEARCH ORDERS
# ---------------------------------------------------
def search_orders_db(status=None, mobile=None, delivery_date=None, page=1, limit=10):

    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM orders WHERE 1=1"
    params = []

    if status:
        query += " AND status = %s" if is_postgres() else " AND status = ?"
        params.append(status)

    if mobile:
        query += " AND mobile = %s" if is_postgres() else " AND mobile = ?"
        params.append(mobile)

    if delivery_date:
        query += (
            " AND delivery_date = %s" if is_postgres() else " AND delivery_date = ?"
        )
        params.append(delivery_date)

    offset = (page - 1) * limit
    query += " LIMIT %s OFFSET %s" if is_postgres() else " LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


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
