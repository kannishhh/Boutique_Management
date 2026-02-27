from datetime import datetime as dt
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
                password_hash TEXT,
                reset_token TEXT,
                reset_token_expiry TIMESTAMP
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
                reset_token_expiry TEXT
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

    # ---------------- MEASUREMENTS HISTORY ----------------
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

    templates = [
        # ================= MEN TOP WEAR =================
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
        # ================= MEN BOTTOM WEAR =================
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
        # ================= MEN FULL SETS =================
        (
            "2 Piece Suit",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Coat Length","Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]',
            "Male",
        ),
        (
            "3 Piece Suit",
            '["Neck","Shoulder","Chest","Waist","Hip","Sleeve Length","Coat Length","Waistcoat Length","Waist","Hip","Thigh","Knee","Bottom","Inseam","Outseam"]',
            "Male",
        ),
        # ================= WOMEN TOP WEAR =================
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
        (
            "Princess Cut Blouse",
            '["Bust","Waist","Shoulder","Armhole","Sleeve Length","Blouse Length","Front Neck Depth","Back Neck Depth"]',
            "Female",
        ),
        # ================= WOMEN BOTTOM WEAR =================
        ("Leggings", '["Waist","Hip","Thigh","Knee","Ankle","Length"]', "Female"),
        ("Palazzo", '["Waist","Hip","Length","Bottom"]', "Female"),
        ("Pant (Women)", '["Waist","Hip","Thigh","Knee","Bottom","Length"]', "Female"),
        ("Sharara", '["Waist","Hip","Length","Bottom"]', "Female"),
        ("Garara", '["Waist","Hip","Length","Bottom"]', "Female"),
        ("Skirt", '["Waist","Hip","Length"]', "Female"),
        # ================= SALWAR SUITS =================
        (
            "Punjabi Suit",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Kurta Length","Salwar Length","Bottom","Dupatta Length","Dupatta Width"]',
            "Female",
        ),
        (
            "Patiala Suit",
            '["Shoulder","Bust","Waist","Sleeve Length","Kurta Length","Salwar Length","Bottom","Dupatta Length","Dupatta Width"]',
            "Female",
        ),
        (
            "Churidar Suit",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Kurta Length","Churidar Length","Ankle","Dupatta Length","Dupatta Width"]',
            "Female",
        ),
        (
            "Palazzo Suit",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Kurta Length","Palazzo Length","Dupatta Length","Dupatta Width"]',
            "Female",
        ),
        (
            "Straight Suit",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Kurta Length","Pant Length","Dupatta Length","Dupatta Width"]',
            "Female",
        ),
        (
            "Anarkali Suit",
            '["Shoulder","Bust","Waist","Sleeve Length","Anarkali Length","Bottom Length","Dupatta Length","Dupatta Width"]',
            "Female",
        ),
        # ================= LEHENGA =================
        (
            "Lehenga Choli",
            '["Bust","Waist","Shoulder","Blouse Length","Front Neck Depth","Back Neck Depth","Sleeve Length","Lehenga Length","Hip","Dupatta Length","Dupatta Width"]',
            "Female",
        ),
        (
            "Crop Top Lehenga",
            '["Bust","Waist","Shoulder","Top Length","Lehenga Length","Hip","Dupatta Length","Dupatta Width"]',
            "Female",
        ),
        # ================= ONE PIECE =================
        (
            "Gown",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Gown Length"]',
            "Female",
        ),
        (
            "One Piece Dress",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Dress Length"]',
            "Female",
        ),
        (
            "Indo Western",
            '["Shoulder","Bust","Waist","Hip","Sleeve Length","Top Length","Bottom Length"]',
            "Female",
        ),
    ]

    if is_postgres():
        cursor.executemany(
            "INSERT INTO measurement_templates (garment_type, fields_json, gender) VALUES (%s, %s, %s) ON CONFLICT (garment_type) DO NOTHING",
            templates,
        )
    else:
        cursor.executemany(
            "INSERT OR IGNORE INTO measurement_templates (garment_type, fields_json,gender) VALUES (?, ?, ?)",
            templates,
        )

    # ---------------- SETTINGS ----------------
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
            INSERT INTO settings (
                id,
                notifications,
                appearance
            )
            VALUES (
                1,
                '{"orderUpdates": true, "deliveryReminders": true, "paymentNotifications": true, "customerMessages": true, "emailNotifications": false}',
                '{"theme": "light", "accent": "#C9A961", "compact": false}'
            )
            ON CONFLICT (id) DO NOTHING;
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
            INSERT OR IGNORE INTO settings (
                id,
                notifications,
                appearance
            )
            VALUES (
                1,
                '{"orderUpdates": true, "deliveryReminders": true, "paymentNotifications": true, "customerMessages": true, "emailNotifications": false}',
                '{"theme": "light", "accent": "#C9A961", "compact": false}'
            )
        """
        )

    # ---------------- SETTINGS ----------------
    if is_postgres():
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS notifications(
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
            """
        )

    conn.commit()
    conn.close()


# ---------------- GENDER ----------------
def add_gender_column():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE measurements ADD COLUMN gender TEXT")
        conn.commit()
        print("gender column added to measurements")
    except Exception:
        print("gender column already exists")

    conn.close()


def add_gender_to_templates():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE measurement_templates ADD COLUMN gender TEXT")
        conn.commit()
        print("gender column added to measurement_templates")
    except Exception:
        print("gender column already exists")

    conn.close()


# ---------------- CREATED AT COLUMN ----------------
def add_created_at_column():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE orders ADD COLUMN created_at DATE")
        conn.commit()
        print("created_at column added")
    except Exception as e:

        print("created_at already exists")

    conn.close()


def fill_created_at_for_old_orders():
    conn = get_connection()
    cursor = conn.cursor()

    today = dt.now().date()

    try:
        if is_postgres():
            cursor.execute(
                "UPDATE orders SET created_at = %s WHERE created_at IS NULL",
                (today,),
            )
        else:
            cursor.execute(
                "UPDATE orders SET created_at = ? WHERE created_at IS NULL",
                (today,),
            )

        conn.commit()
        print("created_at filled for old orders")

    except Exception as e:
        print("created_at fill skipped:", e)

    conn.close()


# ---------------- Notes ----------------
def add_notes_column():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE customers ADD COLUMN notes TEXT DEFAULT ''")
        conn.commit()
        print("notes column added to customers")
    except Exception:

        print("notes column already exists")

    conn.close()


def add_reset_columns():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN reset_token TEXT")
    except:
        print("reset_token already exists")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN reset_token_expiry TEXT")
    except:
        print("reset_token_expiry already exists")

    conn.commit()
    conn.close()


def add_profile_image():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN profile_image TEXT")
    except:
        print("profile_image column already exists")




add_created_at_column()
fill_created_at_for_old_orders()
add_notes_column()
add_gender_column()
add_gender_to_templates()
add_reset_columns()
add_profile_image()
