import psycopg2
from datetime import date, datetime
from database import get_connection, is_postgres


def create_customer_db(name, mobile, address, notes):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if is_postgres():
            cursor.execute(
                """
                INSERT INTO customers (name, mobile, address, notes)
                VALUES (%s, %s, %s, %s)
                RETURNING customer_id
                """,
                (
                    name.strip(),
                    mobile.strip(),
                    address.strip() if address else "",
                    notes.strip() if notes else "",
                ),
            )
            customer_id = cursor.fetchone()["customer_id"]
        else:
            cursor.execute(
                """
                INSERT INTO customers (name, mobile, address, notes)
                VALUES (?, ?, ?, ?)
                """,
                (
                    name.strip(),
                    mobile.strip(),
                    address.strip() if address else "",
                    notes.strip() if notes else "",
                ),
            )
            customer_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return True, "Customer created successfully", customer_id

    except psycopg2.errors.UniqueViolation:
        return False, "Customer with this mobile already exists", None

    except Exception as e:
        print("DB ERROR:", e)
        return False, "Database error", None


def get_all_customers_db():
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT 
            c.customer_id,
            c.name,
            c.mobile,
            c.address,
            c.notes,

            COUNT(o.order_id) AS totalOrders,

            SUM(
                CASE 
                    WHEN o.status IS NOT NULL AND o.status != 'DELIVERED' 
                    THEN 1 
                    ELSE 0 
                END
            ) AS pendingOrders,

            MAX(o.created_at) AS lastOrder

        FROM customers c
        LEFT JOIN orders o 
            ON o.customer_id = c.customer_id

        GROUP BY c.customer_id
        ORDER BY c.customer_id DESC
    """

    cursor.execute(query)

    rows = cursor.fetchall()
    conn.close()

    customers = []
    for row in rows:
        customer = dict(row)

        for key, value in customer.items():
            if isinstance(value, (date, datetime)):
                customer[key] = value.isoformat()

        customer["display_id"] = f"CUST-{int(customer['customer_id']):03}"

        customer["totalOrders"] = int(customer["totalOrders"] or 0)
        customer["pendingOrders"] = int(customer["pendingOrders"] or 0)
        customer["lastOrder"] = customer["lastOrder"] or "—"

        customers.append(customer)

    return customers


def find_customer_by_mobile(mobile):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("SELECT * FROM customers WHERE mobile = %s", (mobile,))
    else:
        cursor.execute("SELECT * FROM customers WHERE mobile = ?", (mobile,))

    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None


def delete_customer_db(customer_id):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("DELETE FROM customers WHERE customer_id=%s", (customer_id,))
    else:
        cursor.execute("DELETE FROM customers WHERE customer_id=?", (customer_id,))

    conn.commit()
    conn.close()


def update_customer_db(customer_id, data):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            """
            UPDATE customers
            SET name=%s, mobile=%s, address=%s, notes=%s
            WHERE customer_id=%s
            """,
            (data["name"], data["mobile"], data["address"], data["notes"], customer_id),
        )
    else:
        cursor.execute(
            """
            UPDATE customers
            SET name=?, mobile=?, address=?, notes=?
            WHERE customer_id=?
            """,
            (data["name"], data["mobile"], data["address"], data["notes"], customer_id),
        )

    conn.commit()
    conn.close()
