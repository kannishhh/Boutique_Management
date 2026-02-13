import os
from datetime import datetime
from database import get_connection


def is_postgres():
    return os.getenv("DATABASE_URL") is not None


# ---------------------------------------------------
# PAYMENT TABLE
# ---------------------------------------------------
def add_payment_db(order_id, amount, method):
    conn = get_connection()
    cursor = conn.cursor()

    today = datetime.today().strftime("%d-%m-%Y")

    if is_postgres():
        cursor.execute(
            "INSERT INTO payments (order_id, amount, payment_date, payment_method) VALUES (%s,%s,%s,%s)",
            (order_id, amount, today, method),
        )

        # update order balance
        cursor.execute(
            "UPDATE orders SET balance = balance - %s WHERE order_id = %s",
            (amount, order_id),
        )
    else:
        cursor.execute(
            "INSERT INTO payments (order_id, amount, payment_date, payment_method) VALUES (?,?,?,?)",
            (order_id, amount, today, method),
        )

        cursor.execute(
            "UPDATE orders SET balance = balance - ? WHERE order_id = ?",
            (amount, order_id),
        )

    conn.commit()
    conn.close()


# ---------------------------------------------------
# GET PAYMENT HISTORY
# ---------------------------------------------------
def get_payments_by_order_db(order_id):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "SELECT * FROM payments WHERE order_id = %s ORDER BY payment_id DESC",
            (order_id,),
        )
    else:
        cursor.execute(
            "SELECT * FROM payments WHERE order_id = ? ORDER BY payment_id DESC",
            (order_id,),
        )

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]
