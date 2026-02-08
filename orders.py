import csv
from database import get_connection
from database import get_connection


# ---------------------------
# CREATE ORDER (DB)
# ---------------------------
def create_order_db(order):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO orders (
            customer_id, customer_name, mobile, suit_type,
            cloth_provided, price, advance_paid, balance,
            delivery_date, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            order["customer_id"],
            order["customer_name"],
            order["mobile"],
            order["suit_type"],
            int(order["cloth_provided"]),
            order["price"],
            order["advance_paid"],
            order["balance"],
            order["delivery_date"],
            order["status"],
        ),
    )

    conn.commit()
    conn.close()


# ---------------------------
# GET ALL ORDERS
# ---------------------------
def get_all_orders_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ---------------------------
# UPDATE ORDER STATUS
# ---------------------------
def update_order_status_db(order_id, status):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE orders SET status = ? WHERE order_id = ?", (status, order_id)
    )

    conn.commit()
    conn.close()


# ---------------------------
# GET PENDING ORDERS
# ---------------------------
def get_pending_orders_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE status != 'DELIVERED'")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ---------------------------
# GET ORDER BY ID
# ---------------------------
def get_order_by_id_db(order_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
    row = cursor.fetchone()
    conn.close()

    return dict(row) if row else None


# ---------------------------
# GET DELIVERED ORDERS
# ---------------------------
def get_delivered_orders_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE status = 'DELIVERED'")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ---------------------------
# GET EARNINGS REPORT
# ---------------------------
def get_earnings_report_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
SELECT
                   COUNT(*) as total_orders,
                   SUM(price) as total_price,
                   SUM(advance_paid) as total_advance,
                   SUM(balance) as total_balance
                FROM orders
                   """
    )

    row = cursor.fetchone()
    conn.close()

    return dict(row)


# ---------------------------
# Search Orders
# ---------------------------
def search_orders_db(status=None, mobile=None, delivery_date=None, page=1, limit=10):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM orders WHERE 1=1"
    params = []

    if status:
        query += "AND status = ?"
        params.append(status)

    if mobile:
        query += "AND mobile = ?"
        params.append(mobile)

    if delivery_date:
        query += "AND delivery_date = ?"
        params.append(delivery_date)

    offset = (page - 1) * limit
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ---------------------------
# Export Report
# ---------------------------
def export_orders_to_csv():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders")
    rows = cursor.fetchall()
    conn.close()

    filename = "orders_report.csv"

    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        # header row
        writer.writerow([
            "Order ID",
            "Customer Name",
            "Mobile",
            "Suit Type",
            "Price",
            "Advance Paid",
            "Balance",
            "Delivery Date",
            "Status"
        ])

        # data rows
        for r in rows:
            writer.writerow([
                r["order_id"],
                r["customer_name"],
                r["mobile"],
                r["suit_type"],
                r["price"],
                r["advance_paid"],
                r["balance"],
                r["delivery_date"],
                r["status"]
            ])

    return filename


