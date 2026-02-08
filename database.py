import sqlite3

DB_NAME = "boutique.db"


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Customers table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS customers (
            customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            address TEXT,
            measurements TEXT
        )
    """
    )

    # Orders table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            customer_name TEXT,
            mobile TEXT,
            suit_type TEXT,
            cloth_provided INTEGER,
            price REAL,
            advance_paid REAL,
            balance REAL,
            delivery_date TEXT,
            status TEXT
        )
    """
    )

    conn.commit()
    conn.close()
