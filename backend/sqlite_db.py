import sqlite3
import os
import threading
from datetime import datetime
from backend.config import DATA_DIR

DB_PATH = os.path.join(DATA_DIR, 'travelnova_sqlite.db')

class SQLiteDatabaseManager:
    """Thread-safe SQLite Database Manager for TravelNova secondary database storage."""
    
    def __init__(self):
        self.lock = threading.Lock()
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        with self.lock:
            try:
                conn = self._get_connection()
                cursor = conn.cursor()
                
                # 1. Users Table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        created_at TEXT
                    )
                ''')
                
                # 2. Trips Table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS trips (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_email TEXT NOT NULL,
                        destination TEXT NOT NULL,
                        days INTEGER,
                        budget REAL,
                        interests TEXT,
                        created_at TEXT
                    )
                ''')

                # 3. Bookings Table
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS bookings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        booking_ref TEXT UNIQUE NOT NULL,
                        user_name TEXT,
                        user_email TEXT NOT NULL,
                        user_phone TEXT,
                        destination TEXT NOT NULL,
                        days INTEGER,
                        total_amount REAL,
                        payment_method TEXT,
                        booked_at TEXT
                    )
                ''')
                
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"[SQLite DB Init Warning]: {e}")

    def add_user(self, name, email, password):
        with self.lock:
            try:
                conn = self._get_connection()
                cursor = conn.cursor()
                now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
                cursor.execute(
                    "INSERT OR REPLACE INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
                    (name.strip(), email.strip().lower(), password, now_str)
                )
                conn.commit()
                user_id = cursor.lastrowid
                conn.close()
                return {'id': user_id, 'name': name, 'email': email}
            except Exception as e:
                return None

    def find_user_by_email(self, email):
        with self.lock:
            try:
                conn = self._get_connection()
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email.strip().lower(),))
                row = cursor.fetchone()
                conn.close()
                if row:
                    return dict(row)
                return None
            except Exception:
                return None

    def add_trip(self, user_email, destination, days, budget, interests='General Sightseeing'):
        with self.lock:
            try:
                conn = self._get_connection()
                cursor = conn.cursor()
                now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
                cursor.execute(
                    "INSERT INTO trips (user_email, destination, days, budget, interests, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_email.strip().lower(), destination.strip(), int(days), float(budget), interests.strip(), now_str)
                )
                conn.commit()
                conn.close()
            except Exception:
                pass

    def add_booking(self, booking_ref, user_name, user_email, user_phone, destination, days, total_amount, payment_method):
        with self.lock:
            try:
                conn = self._get_connection()
                cursor = conn.cursor()
                now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
                cursor.execute(
                    "INSERT OR REPLACE INTO bookings (booking_ref, user_name, user_email, user_phone, destination, days, total_amount, payment_method, booked_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (booking_ref, user_name, user_email.strip().lower(), user_phone, destination, int(days), float(total_amount), payment_method, now_str)
                )
                conn.commit()
                conn.close()
            except Exception:
                pass

# Global Singleton SQLite Manager
sqlite_db = SQLiteDatabaseManager()
