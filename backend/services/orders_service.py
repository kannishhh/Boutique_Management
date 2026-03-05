import json
import os
from database import get_connection


def is_postgres():
    return os.getenv("DATABASE_URL") is not None


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
            RETURNING order_id
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
        order_id = cursor.fetchone()[0]
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
        order_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return order_id


# ---------------------------------------------------
# GET ALL ORDERS
# ---------------------------------------------------
def get_all_orders_db():
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT 
            o.*,
            m.measurement_values

        FROM orders o

        LEFT JOIN measurements m 
            ON m.customer_id = o.customer_id
            AND m.garment_type = o.suit_type
            AND m.id = (
                SELECT id FROM measurements
                WHERE customer_id = o.customer_id
                AND garment_type = o.suit_type
                ORDER BY created_at DESC
                LIMIT 1
            )

        ORDER BY o.order_id DESC
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    orders = []

    for row in rows:
        order = dict(row)

        price = order.get("price", 0)
        advance = order.get("advance_paid", 0) or 0
        balance = price - advance

        if advance == 0:
            payment_status = "PENDING"
        elif advance < price:
            payment_status = "PARTIAL"
        else:
            payment_status = "PAID"

        order["balance"] = balance
        order["payment_status"] = payment_status

        if order.get("measurement_values"):
            try:
                order["measurement_values"] = json.loads(order["measurement_values"])
            except:
                pass

        orders.append(order)

    return orders


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

    if is_postgres():
        query = """
        SELECT
            o.*,
            m.measurement_values
        FROM orders o
        LEFT JOIN measurements m
            ON m.customer_id = o.customer_id
           AND m.garment_type = o.suit_type
           AND m.created_at = (
                SELECT MAX(created_at)
                FROM measurements
                WHERE customer_id = o.customer_id
                AND garment_type = o.suit_type
           )
        WHERE 1=1
        """
    else:
        query = """
        SELECT
            o.*,
            m.measurement_values
        FROM orders o
        LEFT JOIN measurements m
            ON m.customer_id = o.customer_id
           AND m.garment_type = o.suit_type
           AND m.created_at = (
                SELECT MAX(created_at)
                FROM measurements
                WHERE customer_id = o.customer_id
                AND garment_type = o.suit_type
           )
        WHERE 1=1
        """

    params = []

    if status:
        query += " AND o.status = %s" if is_postgres() else " AND o.status = ?"
        params.append(status)

    if mobile:
        query += " AND o.mobile = %s" if is_postgres() else " AND o.mobile = ?"
        params.append(mobile)

    if delivery_date:
        query += (
            " AND o.delivery_date = %s" if is_postgres() else " AND o.delivery_date = ?"
        )
        params.append(delivery_date)

    offset = (page - 1) * limit
    query += " ORDER BY o.order_id DESC"
    query += " LIMIT %s OFFSET %s" if is_postgres() else " LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    orders = []

    for row in rows:
        order = dict(row)

        price = order.get("price", 0)
        advance = order.get("advance_paid", 0) or 0
        balance = price - advance

        if advance == 0:
            payment_status = "PENDING"
        elif advance < price:
            payment_status = "PARTIAL"
        else:
            payment_status = "PAID"

        order["balance"] = balance
        order["payment_status"] = payment_status

        orders.append(order)

    return orders


# ---------------------------------------------------
# DELETE ORDER
# ---------------------------------------------------
def delete_order_db(order_id):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("DELETE FROM orders WHERE order_id=%s", (order_id,))
    else:
        cursor.execute("DELETE FROM orders WHERE order_id=?", (order_id,))

    conn.commit()
    conn.close()


# ---------------------------------------------------
# UPDATE ORDER FULL
# ---------------------------------------------------
def update_order_db(order_id, data):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            UPDATE orders
            SET customer_name=%s,
                mobile=%s,
                suit_type=%s,
                price=%s,
                advance_paid=%s,
                balance=%s,
                delivery_date=%s,
                cloth_provided=%s,
                status=%s
            WHERE order_id=%s
            """,
            (
                data["customer_name"],
                data["mobile"],
                data["suit_type"],
                data["price"],
                data["advance_paid"],
                data["price"] - data["advance_paid"],
                data["delivery_date"],
                data["cloth_provided"],
                data["status"],
                order_id,
            ),
        )
    else:
        cursor.execute(
            """
            UPDATE orders
            SET customer_name=?,
                mobile=?,
                suit_type=?,
                price=?,
                advance_paid=?,
                balance=?,
                delivery_date=?,
                cloth_provided=?,
                status=?
            WHERE order_id=?
            """,
            (
                data["customer_name"],
                data["mobile"],
                data["suit_type"],
                data["price"],
                data["advance_paid"],
                data["price"] - data["advance_paid"],
                data["delivery_date"],
                data["cloth_provided"],
                data["status"],
                order_id,
            ),
        )

    conn.commit()
    conn.close()
