import os
from datetime import datetime, timedelta
from database import get_connection


def is_postgres():
    return os.getenv("DATABASE_URL") is not None


# ---------------------------------------------------
# GET PENDING ORDERS
# ---------------------------------------------------
def get_due_orders_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE status != 'DELIVERED'")
    rows = cursor.fetchall()
    conn.close()

    due_soon = []
    overdue = []

    today = datetime.today()

    for r in rows:
        day, month, year = r["delivery_date"].split("-")
        delivery_date = datetime(int(year), int(month), int(day))
        diff = (delivery_date - today).days

        if diff < 0:
            overdue.append(dict(r))

        if diff < 2:
            due_soon.append(dict(r))

    return {"due_soon": due_soon, "overdue": overdue}


# ---------------------------------------------------
# DUE REMINDERS
# ---------------------------------------------------
def generate_due_reminders_db():
    conn = get_connection()
    cursor = conn.cursor()

    today = datetime.today().date()
    soon_date = today + timedelta(days=2)

    cursor.execute("SELECT * FROM orders WHERE status != 'DELIVERED'")
    orders = cursor.fetchall()

    reminders_created = []

    for o in orders:
        try:
            delivery = datetime.strptime(o["delivery_date"], "%d-%m-%Y").date()
        except Exception as e:
            print("DATE ERROR:", o["delivery_date"], e)
            continue

        print("Checking order", o["order_id"], "delivery:", delivery)

        if delivery <= soon_date:
            message = f"Hello {o['customer_name']}, your {o['suit_type']} is ready for delivery. Please visit the shop."

            if is_postgres():
                cursor.execute(
                    "INSERT INTO reminders (order_id, message, reminder_date) VALUES (%s,%s,%s)",
                    (o["order_id"], message, today.strftime("%d-%m-%Y")),
                )
            else:
                cursor.execute(
                    "INSERT INTO reminders (order_id, message, reminder_date) VALUES (?,?,?)",
                    (o["order_id"], message, today.strftime("%d-%m-%Y")),
                )

            reminders_created.append(
                {"order_id": o["order_id"], "mobile": o["mobile"], "message": message}
            )

    conn.commit()
    conn.close()

    print("Reminders created:", len(reminders_created))
    return reminders_created
