from database import get_connection, is_postgres


def create_notification(user_id, message):
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute(
            "INSERT INTO notifications (user_id, message) VALUES (%s, %s)",
            (user_id, message),
        )
    else:
        cursor.execute(
            "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
            (user_id, message),
        )

    conn.commit()
    conn.close()
