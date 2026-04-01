from database import get_connection, is_postgres


# ---------------------------------------------------
# PAYMENT TABLE
# ---------------------------------------------------
def add_payment_db(order_id, amount, method):
    if amount <= 0:
        raise ValueError("Amount must be greater than 0")

    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            INSERT INTO payments (order_id, amount, payment_method, payment_date, created_at) VALUES (%s,%s,%s, CURRENT_DATE, CURRENT_TIMESTAMP)
            """,
            (order_id, amount, method),
        )
        cursor.execute("UPDATE orders SET advance_paid = advance_paid + %s WHERE order_id = %s", (amount, order_id))

    else:
        cursor.execute(
            """INSERT INTO payments (order_id, amount, payment_method, payment_date,created_at) VALUES (?,?,?,date('now'), datetime('now'))""",
            (order_id, amount, method),
        )
        cursor.execute("UPDATE orders SET advance_paid = advance_paid + ? WHERE order_id = ?", (amount, order_id))

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
            "SELECT payment_id, amount, payment_method, payment_date FROM payments WHERE order_id = %s ORDER BY created_at DESC",
            (order_id,),
        )
    else:
        cursor.execute(
            "SELECT payment_id, amount, payment_method, payment_date FROM payments WHERE order_id = ? ORDER BY created_at DESC",
            (order_id,),
        )

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ---------------------------------------------------
# GET PAYMENT SUMMARY
# ---------------------------------------------------
def get_payment_summary_db(order_id):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "SELECT COALESCE(SUM(amount), 0) as paid FROM payments WHERE order_id = %s",
            (order_id,),
        )
    else:
        cursor.execute(
            "SELECT IFNULL(SUM(amount), 0) as paid FROM payments WHERE order_id = ?",
            (order_id,),
        )

    payment_row = cursor.fetchone()
    payment_sum = payment_row["paid"] if payment_row else 0

    if is_postgres():
        cursor.execute(
            "SELECT price, advance_paid FROM orders WHERE order_id = %s",
            (order_id,),
        )
    else:
        cursor.execute(
            "SELECT price, advance_paid FROM orders WHERE order_id = ?",
            (order_id,),
        )

    order_row = cursor.fetchone()

    if not order_row:
        conn.close()
        return {
            "total": 0,
            "paid": 0,
            "balance": 0,
            "status": "PENDING",
        }

    total = order_row["price"] or 0
    advance = order_row["advance_paid"] or 0

    paid = payment_sum + advance
    balance = max(total - paid, 0)

    conn.close()

    return {
        "total": total,
        "paid": paid,
        "balance": balance,
        "status": "PAID" if balance == 0 else "PARTIAL",
    }
