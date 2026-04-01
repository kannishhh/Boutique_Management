from datetime import datetime as dt
import os
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash
from config.settings import current_config as config


def is_postgres():
    return bool(os.getenv("DATABASE_URL"))


def get_connection():
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

    conn = sqlite3.connect(config.SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():

    conn = get_connection()
    cursor = conn.cursor()

    # USERS TABLE
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE,
                password_hash TEXT,
                reset_token TEXT,
                reset_token_expiry TIMESTAMP,
                profile_image TEXT
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password_hash TEXT,
                reset_token TEXT,
                reset_token_expiry TEXT,
                profile_image TEXT
            )
        """
        )

    # CUSTOMERS TABLE
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS customers (
                customer_id SERIAL PRIMARY KEY,
                name TEXT,
                mobile TEXT UNIQUE,
                address TEXT,
                notes TEXT DEFAULT ''
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS customers (
                customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                mobile TEXT UNIQUE,
                address TEXT,
                notes TEXT DEFAULT ''
            )
        """
        )

    # ORDERS TABLE
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                order_id SERIAL PRIMARY KEY,
                customer_id INTEGER,
                customer_name TEXT,
                mobile TEXT,
                suit_type TEXT,
                cloth_provided BOOLEAN,
                price INTEGER,
                advance_paid INTEGER,
                balance INTEGER,
                delivery_date TEXT,
                status TEXT,
                created_at DATE
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                order_id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                customer_name TEXT,
                mobile TEXT,
                suit_type TEXT,
                cloth_provided BOOLEAN,
                price INTEGER,
                advance_paid INTEGER,
                balance INTEGER,
                delivery_date TEXT,
                status TEXT,
                created_at DATE
            )
        """
        )

    # PAYMENTS TABLE
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                payment_id SERIAL PRIMARY KEY,
                order_id INTEGER,
                amount INTEGER,
                payment_date TEXT,
                payment_method TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                amount INTEGER,
                payment_date TEXT,
                payment_method TEXT,
                created_at TEXT
            )
        """
        )

    # REMINDERS TABLE
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS reminders (
                reminder_id SERIAL PRIMARY KEY,
                order_id INTEGER,
                message TEXT,
                reminder_date TEXT
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS reminders (
                reminder_id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER,
                message TEXT,
                reminder_date TEXT
            )
        """
        )

    # MEASUREMENT TEMPLATES TABLE
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS measurement_templates (
                id SERIAL PRIMARY KEY,
                garment_type TEXT UNIQUE,
                fields_json TEXT,
                gender TEXT
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS measurement_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                garment_type TEXT UNIQUE,
                fields_json TEXT,
                gender TEXT
            )
        """
        )

    # MEASUREMENTS TABLE
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS measurements (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER,
                garment_type TEXT,
                gender TEXT,
                measurement_values TEXT,
                version_number INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS measurements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                garment_type TEXT,
                gender TEXT,
                measurement_values TEXT,
                version_number INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

    # SETTINGS TABLE
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                profile_name TEXT,
                profile_email TEXT,
                profile_phone TEXT,
                boutique_name TEXT,
                boutique_contact TEXT,
                boutique_email TEXT,
                boutique_address TEXT,
                gst_number TEXT,
                notifications JSONB,
                appearance JSONB
            )
        """
        )
        cursor.execute(
            """
            INSERT INTO settings (id, notifications, appearance)
            VALUES (1,
                '{"orderUpdates": true, "deliveryReminders": true, "paymentNotifications": true, "customerMessages": true, "emailNotifications": false}',
                '{"theme": "light", "accent": "#C9A961", "compact": false}'
            )
            ON CONFLICT (id) DO NOTHING
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY,
                profile_name TEXT,
                profile_email TEXT,
                profile_phone TEXT,
                boutique_name TEXT,
                boutique_contact TEXT,
                boutique_email TEXT,
                boutique_address TEXT,
                gst_number TEXT,
                notifications TEXT,
                appearance TEXT
            )
        """
        )
        cursor.execute(
            """
            INSERT OR IGNORE INTO settings (id, notifications, appearance)
            VALUES (1,
                '{"orderUpdates": true, "deliveryReminders": true, "paymentNotifications": true, "customerMessages": true, "emailNotifications": false}',
                '{"theme": "light", "accent": "#C9A961", "compact": false}'
            )
        """
        )

    # NOTIFICATIONS TABLE
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

    _add_all_missing_columns(conn)
    _populate_measurement_templates(conn)

    conn.commit()
    conn.close()


def _add_all_missing_columns(conn=None):
    """Add any missing columns to existing tables."""
    should_close = conn is None
    conn = conn or get_connection()
    cursor = conn.cursor()

    columns_to_add = [
        ("measurements", "gender", "TEXT"),
        ("measurement_templates", "gender", "TEXT"),
        ("orders", "created_at", "DATE"),
        ("customers", "notes", "TEXT DEFAULT ''"),
        ("users", "reset_token", "TEXT"),
        ("users", "reset_token_expiry", "TEXT"),
        ("users", "profile_image", "TEXT"),
    ]

    for table, column, col_type in columns_to_add:
        if is_postgres():
            cursor.execute(
                f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {col_type}"
            )
            conn.commit()
            continue

        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
            conn.commit()
        except Exception:
            conn.rollback()

    if is_postgres():
        cursor.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        conn.commit()
    else:
        try:
            cursor.execute("ALTER TABLE payments ADD COLUMN created_at TEXT")
            conn.commit()
        except Exception:
            conn.rollback()

    if should_close:
        conn.close()


def _populate_measurement_templates(conn=None):
    should_close = conn is None
    conn = conn or get_connection()
    cursor = conn.cursor()

    templates = [
        (
            "Shirt",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Bicep","Wrist","Shirt Length"]',
            "Male",
        ),
        (
            "T-Shirt",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Tshirt Length"]',
            "Male",
        ),
        (
            "Kurta",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Kurta Length"]',
            "Male",
        ),
        (
            "Pathani Kurta",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Kurta Length"]',
            "Male",
        ),
        (
            "Sherwani",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Sherwani Length"]',
            "Male",
        ),
        ("Waistcoat", '["Neck","Shoulder","Chest","Waist","Length"]', "Male"),
        (
            "Blazer",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Coat Length"]',
            "Male",
        ),
        (
            "Coat",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Coat Length"]',
            "Male",
        ),
        ("Pant", '["Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]', "Male"),
        (
            "Formal Pant",
            '["Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]',
            "Male",
        ),
        ("Jeans", '["Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]', "Male"),
        (
            "Churidar",
            '["Waist","Hip","Thigh","Knee","Ankle","Inseam","Outseam"]',
            "Male",
        ),
        ("Pajama", '["Waist","Hip","Thigh","Knee","Bottom","Length"]', "Male"),
        ("Salwar (Men)", '["Waist","Hip","Thigh","Knee","Bottom","Length"]', "Male"),
        (
            "Blouse",
            '["Bust","Waist","Shoulder","Armhole","Sleeve Length","Blouse Length","Front Neck Depth","Back Neck Depth"]',
            "Female",
        ),
        (
            "Crop Top",
            '["Bust","Waist","Shoulder","Armhole","Sleeve Length","Top Length"]',
            "Female",
        ),
        (
            "Top",
            '["Bust","Waist","Hip","Shoulder","Armhole","Sleeve Length","Top Length"]',
            "Female",
        ),
        (
            "Kurti",
            '["Bust","Waist","Hip","Shoulder","Armhole","Sleeve Length","Kurti Length"]',
            "Female",
        ),
        ("Leggings", '["Waist","Hip","Thigh","Knee","Ankle","Length"]', "Female"),
        ("Palazzo", '["Waist","Hip","Length","Bottom"]', "Female"),
        ("Pant (Women)", '["Waist","Hip","Thigh","Knee","Bottom","Length"]', "Female"),
        (
            "Punjabi Suit",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Kurta Length","Salwar Length","Bottom","Dupatta Length"]',
            "Female",
        ),
        (
            "Lehenga Choli",
            '["Bust","Waist","Shoulder","Blouse Length","Lehenga Length","Hip","Dupatta Length"]',
            "Female",
        ),
        (
            "Gown",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Gown Length"]',
            "Female",
        ),
    ]

    try:
        if is_postgres():
            cursor.executemany(
                "INSERT INTO measurement_templates (garment_type, fields_json, gender) VALUES (%s, %s, %s) ON CONFLICT (garment_type) DO NOTHING",
                templates,
            )
        else:
            cursor.executemany(
                "INSERT OR IGNORE INTO measurement_templates (garment_type, fields_json, gender) VALUES (?, ?, ?)",
                templates,
            )
        conn.commit()
    except Exception as e:
        print(f"Template population skipped: {e}")

    if should_close:
        conn.close()
