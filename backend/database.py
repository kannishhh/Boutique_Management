import os
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor


def get_connection():
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

    conn = sqlite3.connect("boutique.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS customers (
        customer_id SERIAL PRIMARY KEY,
        name TEXT,
        mobile TEXT UNIQUE,
        address TEXT
    )
    """
    )

    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        customer_id INTEGER,
        customer_name TEXT,
        mobile TEXT,
        suit_type TEXT,
        price INTEGER,
        advance_paid INTEGER,
        balance INTEGER,
        delivery_date TEXT,
        status TEXT
    )
    """
    )

    conn.commit()
    conn.close()
