import os
import sqlite3
import json
import re
from flask import Flask, request, jsonify

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'travelnova.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 2. Trips Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_email TEXT,
        destination TEXT NOT NULL,
        days INTEGER NOT NULL,
        budget REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 3. Bookings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_ref TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_phone TEXT,
        destination TEXT NOT NULL,
        days INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()

# Initialize DB on startup
init_db()

# CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password):
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    if not password or not password[0].isupper():
        errors.append("First character of password must be CAPITAL letter")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>\-_]', password):
        errors.append("Password must contain at least one special character (!@#$%^&* etc.)")
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number (0-9)")
    return errors

POPULAR_CITIES = {
    'indian': ['Jaipur', 'Goa', 'Manali', 'Udaipur', 'Agra', 'Varanasi', 'Shimla', 'Amritsar', 'Delhi', 'Mumbai', 'Ahmedabad', 'Rajkot'],
    'international': ['Paris', 'Tokyo', 'London', 'Dubai', 'Singapore', 'Rome', 'Bangkok', 'Bali', 'New York', 'Cairo', 'Sydney', 'Amsterdam']
}

@app.route('/')
def home():
    return jsonify({
        'name': 'TravelNova Python Backend API & SQLite Database',
        'status': 'Online',
        'version': '3.0.0',
        'database': 'travelnova.db (SQLite)',
        'endpoints': {
            '/api/health': 'GET - Health status',
            '/api/register': 'POST - Register user',
            '/api/login': 'POST - User login',
            '/api/save-trip': 'POST - Save generated trip',
            '/api/book-trip': 'POST - Save trip booking',
            '/api/admin/all-data': 'GET - Admin database dump'
        }
    })

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'backend': 'Python Flask', 'database': 'SQLite travelnova.db', 'port': 5000})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not name or len(name) < 2:
        return jsonify({'success': False, 'message': 'Please enter a valid name (min 2 characters).'}), 400

    if not email or not validate_email(email):
        return jsonify({'success': False, 'message': 'Please enter a valid email address.'}), 400

    pwd_errors = validate_password(password)
    if pwd_errors:
        return jsonify({'success': False, 'message': 'Invalid Password Rules: ' + ', '.join(pwd_errors), 'errors': pwd_errors}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email.lower(),))
    if cursor.fetchone():
        conn.close()
        return jsonify({'success': False, 'message': 'Email address already registered. Please login instead.'}), 409

    cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email.lower(), password))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'success': True,
        'message': 'User registered successfully in TravelNova database!',
        'user': {'id': user_id, 'name': name, 'email': email.lower()}
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not validate_email(email):
        return jsonify({'success': False, 'message': 'Please enter a valid email address.'}), 400

    if not password:
        return jsonify({'success': False, 'message': 'Please enter your password.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, password FROM users WHERE LOWER(email) = ?", (email.lower(),))
    user = cursor.fetchone()
    conn.close()

    if not user or user['password'] != password:
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    return jsonify({
        'success': True,
        'message': f'Welcome back, {user["name"]}!',
        'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}
    })

@app.route('/api/save-trip', methods=['POST'])
def save_trip():
    data = request.get_json() or {}
    user_email = data.get('user_email', 'guest@travelnova.com').strip()
    destination = data.get('destination', '').strip()
    days = int(data.get('days', 3))
    budget = float(data.get('budget', 10000))

    if not destination:
        return jsonify({'success': False, 'message': 'Destination required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    
    # Get user_id if registered
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (user_email.lower(),))
    row = cursor.fetchone()
    user_id = row['id'] if row else None

    cursor.execute("INSERT INTO trips (user_id, user_email, destination, days, budget) VALUES (?, ?, ?, ?, ?)",
                   (user_id, user_email, destination, days, budget))
    conn.commit()
    trip_id = cursor.lastrowid
    conn.close()

    return jsonify({'success': True, 'message': 'Trip saved to database!', 'trip_id': trip_id})

@app.route('/api/book-trip', methods=['POST'])
def book_trip():
    data = request.get_json() or {}
    booking_ref = data.get('booking_ref', f'TN-{os.urandom(3).hex().upper()}')
    user_name = data.get('user_name', 'Traveler').strip()
    user_email = data.get('user_email', 'user@example.com').strip()
    user_phone = data.get('user_phone', '9876543210').strip()
    destination = data.get('destination', 'Jaipur').strip()
    days = int(data.get('days', 3))
    total_amount = float(data.get('total_amount', 10000))
    payment_method = data.get('payment_method', 'Pay at Hotel / UPI')

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (user_email.lower(),))
    row = cursor.fetchone()
    user_id = row['id'] if row else None

    cursor.execute("""
    INSERT INTO bookings (booking_ref, user_id, user_name, user_email, user_phone, destination, days, total_amount, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (booking_ref, user_id, user_name, user_email, user_phone, destination, days, total_amount, payment_method))
    
    conn.commit()
    booking_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'success': True,
        'message': f'🎉 Booking Confirmed! Ref: {booking_ref}',
        'booking': {
            'id': booking_id,
            'booking_ref': booking_ref,
            'user_name': user_name,
            'user_email': user_email,
            'destination': destination,
            'days': days,
            'total_amount': total_amount,
            'payment_method': payment_method
        }
    }), 201

# ADMIN DATABASE DUMP ENDPOINT
@app.route('/api/admin/all-data')
def admin_all_data():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, email, created_at FROM users ORDER BY id DESC")
    users = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT id, user_email, destination, days, budget, created_at FROM trips ORDER BY id DESC")
    trips = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT id, booking_ref, user_name, user_email, user_phone, destination, days, total_amount, payment_method, booked_at FROM bookings ORDER BY id DESC")
    bookings = [dict(r) for r in cursor.fetchall()]

    conn.close()

    total_revenue = sum(b['total_amount'] for b in bookings)

    return jsonify({
        'summary': {
            'total_users': len(users),
            'total_trips': len(trips),
            'total_bookings': len(bookings),
            'total_revenue': total_revenue
        },
        'users': users,
        'trips': trips,
        'bookings': bookings
    })

# RESET DATABASE TABLE ENDPOINT
@app.route('/api/admin/reset-table', methods=['POST'])
def reset_table():
    data = request.get_json() or {}
    table = data.get('table', '').strip()
    if table not in ['users', 'trips', 'bookings']:
        return jsonify({'success': False, 'message': 'Invalid table name.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(f"DELETE FROM {table}")
        try:
            cursor.execute("UPDATE sqlite_sequence SET seq = 0 WHERE name = ?", (table,))
        except Exception:
            pass
        conn.commit()
        success = True
        msg = f"Table {table} has been reset successfully!"
    except Exception as e:
        success = False
        msg = f"Error resetting table: {str(e)}"
    finally:
        conn.close()

    return jsonify({'success': success, 'message': msg})

if __name__ == '__main__':
    print('[SERVER] TravelNova Python Backend & Database running on http://127.0.0.1:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)


