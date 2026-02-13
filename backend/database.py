import os
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash


def is_postgres():
    return os.getenv("DATABASE_URL") is not None


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

    # ---------------- USERS ----------------
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE,
                password_hash TEXT
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password_hash TEXT
            )
        """
        )

    # ---------------- CUSTOMERS ----------------
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS customers (
                customer_id SERIAL PRIMARY KEY,
                name TEXT,
                mobile TEXT UNIQUE,
                address TEXT,
                measurements TEXT
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
                measurements TEXT
            )
        """
        )

    # ---------------- ORDERS ----------------
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
                status TEXT
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
                status TEXT
            )
        """
        )

    # ---------------- PAYMENTS ----------------
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                payment_id SERIAL PRIMARY KEY,
                order_id INTEGER,
                amount INTEGER,
                payment_date TEXT,
                payment_method TEXT
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
                payment_method TEXT
            )
        """
        )

    # ---------------- REMINDERS ----------------
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

    # ---------------- MEASUREMENT TEMPLATES ----------------
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS measurement_templates (
                id SERIAL PRIMARY KEY,
                garment_type TEXT UNIQUE,
                fields_json TEXT
            )
        """
        )
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS measurement_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                garment_type TEXT UNIQUE,
                fields_json TEXT
            )
        """
        )

    # ---------------- MEASUREMENTS HISTORY ----------------
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS measurements (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER,
                garment_type TEXT,
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
                measurement_values TEXT,
                version_number INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )


    templates = [
        # ================= MEN TOP WEAR =================
        (
            "Shirt",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Bicep","Wrist","Shirt Length"]',
        ),
        (
            "T-Shirt",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Tshirt Length"]',
        ),
        (
            "Kurta",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Kurta Length"]',
        ),
        (
            "Pathani Kurta",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Kurta Length"]',
        ),
        (
            "Sherwani",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Sherwani Length"]',
        ),
        ("Waistcoat", '["Neck","Shoulder","Chest","Waist","Length"]'),
        (
            "Blazer",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Coat Length"]',
        ),
        (
            "Coat",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Coat Length"]',
        ),
        # ================= MEN BOTTOM WEAR =================
        ("Pant", '["Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]'),
        ("Formal Pant", '["Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]'),
        ("Jeans", '["Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]'),
        ("Churidar", '["Waist","Hip","Thigh","Knee","Ankle","Inseam","Outseam"]'),
        ("Pajama", '["Waist","Hip","Thigh","Knee","Bottom","Length"]'),
        ("Salwar (Men)", '["Waist","Hip","Thigh","Knee","Bottom","Length"]'),
        # ================= MEN FULL SETS =================
        (
            "2 Piece Suit",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Coat Length","Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]',
        ),
        (
            "3 Piece Suit",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Coat Length","Waistcoat Length","Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]',
        ),
        # ================= WOMEN TOP WEAR =================
        (
            "Blouse",
            '["Bust","Waist","Shoulder","Armhole","Sleeve Length","Blouse Length","Front Neck Depth","Back Neck Depth"]',
        ),
        (
            "Crop Top",
            '["Bust","Waist","Shoulder","Armhole","Sleeve Length","Top Length"]',
        ),
        (
            "Top",
            '["Bust","Waist","Hip","Shoulder","Armhole","Sleeve Length","Top Length"]',
        ),
        (
            "Kurti",
            '["Bust","Waist","Hip","Shoulder","Armhole","Sleeve Length","Kurti Length"]',
        ),
        (
            "Princess Cut Blouse",
            '["Bust","Waist","Shoulder","Armhole","Sleeve Length","Blouse Length","Front Neck Depth","Back Neck Depth"]',
        ),
        # ================= WOMEN BOTTOM WEAR =================
        ("Leggings", '["Waist","Hip","Thigh","Knee","Ankle","Length"]'),
        ("Palazzo", '["Waist","Hip","Length","Bottom"]'),
        ("Pant (Women)", '["Waist","Hip","Thigh","Knee","Bottom","Length"]'),
        ("Sharara", '["Waist","Hip","Length","Bottom"]'),
        ("Garara", '["Waist","Hip","Length","Bottom"]'),
        ("Skirt", '["Waist","Hip","Length"]'),
        # ================= SALWAR SUITS =================
        (
            "Punjabi Suit",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Kurta Length","Salwar Length","Bottom","Dupatta Length","Dupatta Width"]',
        ),
        (
            "Patiala Suit",
            '["Shoulder","Bust","Waist","Sleeve Length","Kurta Length","Salwar Length","Bottom","Dupatta Length","Dupatta Width"]',
        ),
        (
            "Churidar Suit",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Kurta Length","Churidar Length","Ankle","Dupatta Length","Dupatta Width"]',
        ),
        (
            "Palazzo Suit",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Kurta Length","Palazzo Length","Dupatta Length","Dupatta Width"]',
        ),
        (
            "Straight Suit",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Kurta Length","Pant Length","Dupatta Length","Dupatta Width"]',
        ),
        (
            "Anarkali Suit",
            '["Shoulder","Bust","Waist","Sleeve Length","Anarkali Length","Bottom Length","Dupatta Length","Dupatta Width"]',
        ),
        # ================= LEHENGA =================
        (
            "Lehenga Choli",
            '["Bust","Waist","Shoulder","Blouse Length","Front Neck Depth","Back Neck Depth","Sleeve Length","Lehenga Length","Hip","Dupatta Length","Dupatta Width"]',
        ),
        (
            "Crop Top Lehenga",
            '["Bust","Waist","Shoulder","Top Length","Lehenga Length","Hip","Dupatta Length","Dupatta Width"]',
        ),
        # ================= ONE PIECE =================
        ("Gown", '["Shoulder","Bust","Waist","Hip","Sleeve Length","Gown Length"]'),
        (
            "One Piece Dress",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Dress Length"]',
        ),
        (
            "Indo Western",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Top Length","Bottom Length"]',
        ),
    ]

    if is_postgres():
        cursor.executemany(
            "INSERT INTO measurement_templates (garment_type, fields_json) VALUES (%s,%s) ON CONFLICT (garment_type) DO NOTHING",
            templates,
        )
    else:
        cursor.executemany(
            "INSERT OR IGNORE INTO measurement_templates (garment_type, fields_json) VALUES (?, ?)",
            templates,
        )

    conn.commit()
    conn.close()
