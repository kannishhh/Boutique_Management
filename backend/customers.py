from database import get_connection
from utils import is_valid_mobile


# ---------------------------
# CREATE CUSTOMER (DB)
# ---------------------------
def create_customer_db(name, mobile, address, measurements):
    if not name or not is_valid_mobile(mobile):
        return None, "Invalid input"

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO customers (name, mobile, address, measurements) VALUES (%s, %s, %s, %s)",
        (name, mobile, address, measurements),
    )

    conn.commit()
    conn.close()

    return True, "Customer created"


# ---------------------------
# GET ALL CUSTOMERS (DB)
# ---------------------------
def get_all_customers_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT customer_id, name, mobile, address FROM customers")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ---------------------------
# FIND CUSTOMER BY MOBILE
# ---------------------------
def find_customer_by_mobile(mobile):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM customers WHERE mobile = %s", (mobile,))
    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None
