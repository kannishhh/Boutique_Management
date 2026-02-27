import csv
import os
from database import get_connection
from datetime import datetime


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
def get_dashboard_data_db():
    conn = get_connection()
    cursor = conn.cursor()

    POSTGRES = is_postgres()

    cursor.execute("SELECT COUNT(*) as total FROM orders")
    total_orders = cursor.fetchone()["total"] or 0

    cursor.execute("SELECT COUNT(*) as pending FROM orders WHERE status != 'DELIVERED'")
    pending_orders = cursor.fetchone()["pending"] or 0

    cursor.execute(
        "SELECT COUNT(*) as delivered FROM orders WHERE status = 'DELIVERED'"
    )
    delivered_orders = cursor.fetchone()["delivered"] or 0

    cursor.execute(
        "SELECT SUM(price) as revenue FROM orders WHERE status = 'DELIVERED'"
    )
    revenue_row = cursor.fetchone()
    revenue = float(revenue_row["revenue"] or 0)

    cursor.execute(
        "SELECT COUNT(*) as stitching FROM orders WHERE status = 'STITCHING'"
    )
    in_stitching = cursor.fetchone()["stitching"] or 0

    cursor.execute("SELECT COUNT(*) as ready FROM orders WHERE status = 'READY'")
    ready = cursor.fetchone()["ready"] or 0

    cursor.execute(
        """
        SELECT order_id, customer_name, suit_type, status, delivery_date, price
        FROM orders
        ORDER BY order_id DESC
        LIMIT 4
    """
    )
    recent_rows = cursor.fetchall()

    recent_orders = []
    for row in recent_rows:
        recent_orders.append(
            {
                "id": f"ORD-{row['order_id']:03}",
                "customer": row["customer_name"],
                "outfit": row["suit_type"],
                "status": row["status"],
                "delivery": str(row["delivery_date"]),
                "amount": f"₹{row['price']}",
            }
        )

    if POSTGRES:
        group_concat = "STRING_AGG(order_id::text, ',')"
    else:
        group_concat = "GROUP_CONCAT(order_id)"

    cursor.execute(
        f"""
        SELECT delivery_date, {group_concat} as orders, COUNT(*) as count
        FROM orders
        WHERE status != 'DELIVERED'
        GROUP BY delivery_date
        ORDER BY delivery_date ASC
        LIMIT 4
    """
    )

    upcoming_rows = cursor.fetchall()

    upcoming_deliveries = []
    for row in upcoming_rows:
        order_list = row["orders"].split(",")
        formatted_orders = ", ".join([f"ORD-{int(o):03}" for o in order_list])

        upcoming_deliveries.append(
            {
                "date": str(row["delivery_date"]),
                "count": row["count"],
                "orders": formatted_orders,
            }
        )

    if POSTGRES:
        cursor.execute(
            """
            SELECT 
                TO_CHAR(TO_DATE(delivery_date, 'DD-MM-YYYY'), 'Mon') as month,
                DATE_TRUNC('month', TO_DATE(delivery_date, 'DD-MM-YYYY')) as sort_date,
                SUM(price) as revenue,
                COUNT(*) as orders
            FROM orders
            WHERE status = 'DELIVERED'
            GROUP BY month, sort_date
            ORDER BY sort_date
        """
        )
    else:
        cursor.execute(
            """
            SELECT 
                strftime('%Y-%m',
                    substr(delivery_date,7,4) || '-' ||
                    substr(delivery_date,4,2) || '-' ||
                    substr(delivery_date,1,2)
                ) as month,
                SUM(price) as revenue,
                COUNT(*) as orders
            FROM orders
            WHERE status = 'DELIVERED'
            GROUP BY month
            ORDER BY month
        """
        )

    chart_rows = cursor.fetchall()

    revenue_chart = []
    orders_chart = []

    for row in chart_rows:
        month_raw = row["month"]

        if "-" in month_raw:
            dt = datetime.strptime(month_raw, "%Y-%m")
            month_label = dt.strftime("%b")
        else:
            month_label = month_raw

        revenue_chart.append(
            {"month": month_label, "revenue": float(row["revenue"] or 0)}
        )

        orders_chart.append({"month": month_label, "orders": int(row["orders"] or 0)})

    if len(revenue_chart) >= 2:
        last_month = revenue_chart[-2]["revenue"]
        this_month = revenue_chart[-1]["revenue"]

        if last_month > 0:
            revenue_growth = round(((this_month - last_month) / last_month) * 100, 1)
        else:
            revenue_growth = 100 if this_month > 0 else 0
    else:
        revenue_growth = 0

    if len(orders_chart) >= 2:
        last_orders = orders_chart[-2]["orders"]
        this_orders = orders_chart[-1]["orders"]

        if last_orders > 0:
            weekly_growth = round(((this_orders - last_orders) / last_orders) * 100, 1)
        else:
            weekly_growth = 100 if this_orders > 0 else 0
    else:
        weekly_growth = 0

    delivery_rate = (
        round((delivered_orders / total_orders) * 100, 1) if total_orders else 0
    )
    pending_rate = (
        round((pending_orders / total_orders) * 100, 1) if total_orders else 0
    )
    stitching_rate = (
        round((in_stitching / total_orders) * 100, 1) if total_orders else 0
    )
    ready_rate = round((ready / total_orders) * 100, 1) if total_orders else 0

    conn.close()

    return {
        "stats": {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "delivered_orders": delivered_orders,
            "revenue": revenue,
            "in_stitching": in_stitching,
            "ready": ready,
            "weekly_growth": weekly_growth,
            "revenue_growth": revenue_growth,
            "delivery_rate": delivery_rate,
            "pending_rate": pending_rate,
            "stitching_rate": stitching_rate,
            "ready_rate": ready_rate,
        },
        "recent_orders": recent_orders,
        "upcoming_deliveries": upcoming_deliveries,
        "revenue_chart": revenue_chart,
        "orders_chart": orders_chart,
    }


# ---------------------------------------------------
# REVENUE DASHBOARD
# ---------------------------------------------------
def get_full_revenue_dashboard_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT 
            COUNT(*) as total_orders,
            SUM(price) as total_price,
            SUM(advance_paid) as total_advance,
            SUM(balance) as total_pending
        FROM orders
        WHERE status = 'DELIVERED'
    """
    )
    row = cursor.fetchone()

    total_orders = row[0] or 0
    total_price = row[1] or 0
    total_advance = row[2] or 0
    total_pending = row[3] or 0

    if is_postgres():
        month_expr = "TO_CHAR(created_at, 'YYYY-MM)"
    else:
        month_expr = "strftime('%Y-%m', created_at)"

    cursor.execute(
        f"""
        SELECT {month_expr} as month,
               SUM(price) as revenue,
               COUNT(*) as orders
        FROM orders
        WHERE status='DELIVERED'
        GROUP BY month
        ORDER BY month
    """
    )
    monthly_data = cursor.fetchall()

    monthlyRevenue = [
        {"month": row[0], "revenue": row[1] or 0, "orders": row[2] or 0}
        for row in monthly_data
    ]

    cursor.execute(
        """
        SELECT suit_type,
               SUM(price) as revenue,
               COUNT(*) as count
        FROM orders
        WHERE status='DELIVERED'
        GROUP BY suit_type
        ORDER BY revenue DESC
    """
    )
    outfit_data = cursor.fetchall()

    outfitRevenue = [
        {"outfit": row[0], "revenue": row[1] or 0, "count": row[2] or 0}
        for row in outfit_data
    ]

    cursor.execute(
        """
        SELECT customer_name,
               SUM(price) as revenue, 
               COUNT(*) as count
        FROM orders
        WHERE status='DELIVERED'
        GROUP BY customer_name
        ORDER BY revenue DESC
        LIMIT 5
    """
    )
    customer_data = cursor.fetchall()

    topCustomers = [
        {"name": row[0], "revenue": row[1] or 0, "orders": row[2] or 0}
        for row in customer_data
    ]

    # ---------------------------------------

    if is_postgres():
        cursor.execute(
            """
            SELECT
                SUM(CASE 
                    WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
                    THEN price ELSE 0 END) as this_month,
                SUM(CASE 
                    WHEN DATE_TRUNC('month', created_at) = 
                         DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                    THEN price ELSE 0 END) as last_month
            FROM orders
            WHERE status = 'DELIVERED'
        """
        )
    else:
        cursor.execute(
            """
            SELECT
                SUM(CASE 
                    WHEN strftime('%Y-%m', created_at) = strftime('%Y-%m','now')
                    THEN price ELSE 0 END) as this_month,
                SUM(CASE 
                    WHEN strftime('%Y-%m', created_at) = strftime('%Y-%m','now','-1 month')
                    THEN price ELSE 0 END) as last_month
            FROM orders
            WHERE status = 'DELIVERED'
        """
        )

    growth_row = cursor.fetchone()

    this_month = growth_row[0] or 0
    last_month = growth_row[1] or 0

    growth_percent = 0
    if last_month > 0:
        growth_percent = ((this_month - last_month) / last_month) * 100
    conn.close()

    return {
        "totalRevenue": total_price,
        "totalOrders": total_orders,
        "advanceCollected": total_advance,
        "pending": total_pending,
        "averageOrderValue": total_price / total_orders if total_orders else 0,
        "growthPercent": round(growth_percent, 1),
        "thisMonthRevenue": this_month,
        "monthlyRevenue": monthlyRevenue,
        "outfitRevenue": outfitRevenue,
        "topCustomers": topCustomers,
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
