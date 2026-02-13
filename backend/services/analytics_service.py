import csv
import os
from database import get_connection


def is_postgres():
    return os.getenv("DATABASE_URL") is not None


# ---------------------------------------------------
# GET DELIVERED ORDERS
# ---------------------------------------------------
def get_delivered_orders_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE status = 'DELIVERED'")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ---------------------------------------------------
# EARNINGS REPORT
# ---------------------------------------------------
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


# ---------------------------------------------------
# Dashboard Metrics
# ---------------------------------------------------
def get_dashboard_stats_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM orders")
    total_orders = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as pending FROM orders WHERE status != 'DELIVERED'")
    pending_orders = cursor.fetchone()["pending"]

    cursor.execute(
        "SELECT COUNT(*) as delivered FROM orders WHERE status = 'DELIVERED'"
    )
    delivered_orders = cursor.fetchone()["delivered"]

    cursor.execute(
        "SELECT SUM(price) as revenue FROM orders WHERE status = 'DELIVERED'"
    )
    revenue = cursor.fetchone()["revenue"] or 0

    conn.close()

    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
        "revenue": revenue,
    }


# ---------------------------------------------------
# EXPORT ORDERS CSV
# ---------------------------------------------------
def export_orders_to_csv():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders")
    rows = cursor.fetchall()
    conn.close()

    filename = "orders_report.csv"

    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow(
            [
                "Order ID",
                "Customer Name",
                "Mobile",
                "Suit Type",
                "Price",
                "Advance Paid",
                "Balance",
                "Delivery Date",
                "Status",
            ]
        )

        for r in rows:
            writer.writerow(
                [
                    r["order_id"],
                    r["customer_name"],
                    r["mobile"],
                    r["suit_type"],
                    r["price"],
                    r["advance_paid"],
                    r["balance"],
                    r["delivery_date"],
                    r["status"],
                ]
            )

    return filename
