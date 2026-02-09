import psycopg2
from database import get_connection


# ---------------------------
# CREATE CUSTOMER (DB)
# ---------------------------
def create_customer_db(name, mobile, address, measurements):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO customers (name, mobile, address, measurements)
            VALUES (%s, %s, %s, %s)
            """,
            (
                name.strip(),
                mobile.strip(),
                address.strip() if address else "",
                measurements.strip() if measurements else "",
            ),
        )

        conn.commit()
        conn.close()

        return True, "Customer created successfully"

    except psycopg2.errors.UniqueViolation:
        return False, "Customer with this mobile already exists"

    except Exception as e:
        print("DB ERROR:", e)
        return False, "Database error"


# ---------------------------
# GET ALL CUSTOMERS (DB)
# ---------------------------
def get_all_customers_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT customer_id, name, mobile, address, measurements FROM customers ORDER BY customer_id DESC"
    )
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
