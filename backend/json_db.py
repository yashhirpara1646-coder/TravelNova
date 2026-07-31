import os
import json
import threading
from datetime import datetime
from backend.config import USERS_FILE, TRIPS_FILE, BOOKINGS_FILE

from backend.sqlite_db import sqlite_db

class JSONDatabaseManager:
    """Thread-safe JSON file database manager for TravelNova with SQLite secondary backup."""
    
    def __init__(self):
        self.lock = threading.Lock()
        self._init_files()

    def _init_files(self):
        for filepath in [USERS_FILE, TRIPS_FILE, BOOKINGS_FILE]:
            if not os.path.exists(filepath):
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump([], f, indent=2)

    def _read_file(self, filepath):
        if not os.path.exists(filepath):
            return []
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []

    def _write_file(self, filepath, data):
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    # --- USER OPERATIONS ---
    def get_users(self):
        with self.lock:
            return self._read_file(USERS_FILE)

    def find_user_by_email(self, email):
        users = self.get_users()
        email_clean = email.strip().lower()
        for user in users:
            if user.get('email', '').strip().lower() == email_clean:
                return user

        # Secondary SQLite DB lookup fallback
        sq_user = sqlite_db.find_user_by_email(email_clean)
        if sq_user:
            with self.lock:
                users.append(sq_user)
                self._write_file(USERS_FILE, users)
            return sq_user

        return None

    def add_user(self, name, email, password):
        with self.lock:
            users = self._read_file(USERS_FILE)
            next_id = max([u.get('id', 0) for u in users], default=0) + 1
            now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            
            new_user = {
                'id': next_id,
                'name': name.strip(),
                'email': email.strip().lower(),
                'password': password,
                'created_at': now_str
            }
            users.append(new_user)
            self._write_file(USERS_FILE, users)
            
            # Secondary SQLite DB backup
            sqlite_db.add_user(name=name, email=email, password=password)
            return new_user

    # --- TRIP OPERATIONS ---
    def get_trips(self):
        with self.lock:
            return self._read_file(TRIPS_FILE)

    def add_trip(self, user_email, destination, days, budget, interests='General Sightseeing'):
        with self.lock:
            trips = self._read_file(TRIPS_FILE)
            next_id = max([t.get('id', 0) for t in trips], default=0) + 1
            now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            
            # Find user id if user registered
            users = self._read_file(USERS_FILE)
            user_id = None
            for u in users:
                if u.get('email', '').strip().lower() == user_email.strip().lower():
                    user_id = u.get('id')
                    break

            new_trip = {
                'id': next_id,
                'user_id': user_id,
                'user_email': user_email.strip().lower(),
                'destination': destination.strip(),
                'days': int(days),
                'budget': float(budget),
                'interests': interests.strip() or 'General Sightseeing',
                'created_at': now_str
            }
            trips.append(new_trip)
            self._write_file(TRIPS_FILE, trips)
            
            # Secondary SQLite DB backup
            sqlite_db.add_trip(user_email=user_email, destination=destination, days=days, budget=budget, interests=interests)
            return new_trip

    # --- BOOKING OPERATIONS ---
    def get_bookings(self):
        with self.lock:
            return self._read_file(BOOKINGS_FILE)

    def add_booking(self, booking_ref, user_name, user_email, user_phone, destination, days, total_amount, payment_method):
        with self.lock:
            bookings = self._read_file(BOOKINGS_FILE)
            next_id = max([b.get('id', 0) for b in bookings], default=0) + 1
            now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

            users = self._read_file(USERS_FILE)
            user_id = None
            for u in users:
                if u.get('email', '').strip().lower() == user_email.strip().lower():
                    user_id = u.get('id')
                    break

            new_booking = {
                'id': next_id,
                'booking_ref': booking_ref,
                'user_id': user_id,
                'user_name': user_name.strip(),
                'user_email': user_email.strip().lower(),
                'user_phone': user_phone.strip(),
                'destination': destination.strip(),
                'days': int(days),
                'total_amount': float(total_amount),
                'payment_method': payment_method,
                'booked_at': now_str
            }
            bookings.append(new_booking)
            self._write_file(BOOKINGS_FILE, bookings)
            
            # Secondary SQLite DB backup
            sqlite_db.add_booking(
                booking_ref=booking_ref, user_name=user_name, user_email=user_email,
                user_phone=user_phone, destination=destination, days=days,
                total_amount=total_amount, payment_method=payment_method
            )
            return new_booking

    # --- ADMIN DUMP & RESET ---
    def get_all_data(self):
        users = self.get_users()
        trips = self.get_trips()
        bookings = self.get_bookings()

        # Sanitize passwords for security in dump
        safe_users = [{k: v for k, v in u.items() if k != 'password'} for u in users]
        
        total_revenue = sum(b.get('total_amount', 0) for b in bookings)
        
        return {
            'summary': {
                'total_users': len(users),
                'total_trips': len(trips),
                'total_bookings': len(bookings),
                'total_revenue': total_revenue
            },
            'users': sorted(safe_users, key=lambda x: x.get('id', 0), reverse=True),
            'trips': sorted(trips, key=lambda x: x.get('id', 0), reverse=True),
            'bookings': sorted(bookings, key=lambda x: x.get('id', 0), reverse=True)
        }

    def reset_table(self, table_name):
        with self.lock:
            file_map = {
                'users': USERS_FILE,
                'trips': TRIPS_FILE,
                'bookings': BOOKINGS_FILE
            }
            if table_name not in file_map:
                return False, "Invalid table name."
            
            filepath = file_map[table_name]
            self._write_file(filepath, [])
            return True, f"Table '{table_name}' has been reset successfully!"

    def delete_record(self, table_name, record_id):
        with self.lock:
            file_map = {
                'users': USERS_FILE,
                'trips': TRIPS_FILE,
                'bookings': BOOKINGS_FILE
            }
            if table_name not in file_map:
                return False, "Invalid table name."

            filepath = file_map[table_name]
            records = self._read_file(filepath)
            initial_count = len(records)
            record_id_str = str(record_id).strip().lower()

            filtered = []
            for r in records:
                r_id = str(r.get('id', '')).strip().lower()
                r_email = str(r.get('email', '')).strip().lower()
                r_ref = str(r.get('booking_ref', '')).strip().lower()

                if record_id_str in [r_id, r_email, r_ref]:
                    continue
                filtered.append(r)

            if len(filtered) == initial_count:
                return False, f"Record '{record_id}' not found in '{table_name}'."

            self._write_file(filepath, filtered)
            return True, f"Record '{record_id}' successfully deleted from '{table_name}'!"

# Global Singleton Instance
db = JSONDatabaseManager()
