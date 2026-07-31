import os
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from backend.config import MONGODB_URI

class MongoDBManager:
    """MongoDB database manager for TravelNova."""
    
    def __init__(self):
        self.client = None
        self.db = None
        self._connect()

    def _connect(self):
        if not MONGODB_URI or "<username>" in MONGODB_URI:
            print("[Warning] MONGODB_URI is not set or contains placeholders. Database operations will fail.")
            return

        try:
            self.client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            self.client.admin.command('ping')
            self.db = self.client.travelnova
            print("[Database] Successfully connected to MongoDB.")
            self.seed_initial_data()
        except Exception as e:
            print(f"[Error] Could not connect to MongoDB: {e}")

    def seed_initial_data(self):
        if self.db is None: return
        try:
            from backend.config import USERS_FILE, TRIPS_FILE, BOOKINGS_FILE
            import json

            if self.db.users.count_documents({}) == 0 and os.path.exists(USERS_FILE):
                with open(USERS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if data:
                        self.db.users.insert_many(data)
                        print(f"[Database] Seeded {len(data)} users into MongoDB.")

            if self.db.bookings.count_documents({}) == 0 and os.path.exists(BOOKINGS_FILE):
                with open(BOOKINGS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if data:
                        self.db.bookings.insert_many(data)
                        print(f"[Database] Seeded {len(data)} bookings into MongoDB.")

            if self.db.trips.count_documents({}) == 0 and os.path.exists(TRIPS_FILE):
                with open(TRIPS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if data:
                        self.db.trips.insert_many(data)
                        print(f"[Database] Seeded {len(data)} trips into MongoDB.")
        except Exception as e:
            print(f"[Database Seed Warning] {e}")

    # --- USER OPERATIONS ---
    def get_users(self):
        if self.db is None: return []
        users = list(self.db.users.find({}, {"_id": 0}))
        return sorted(users, key=lambda x: x.get('id', 0))

    def find_user_by_email(self, email):
        if self.db is None: return None
        return self.db.users.find_one({"email": email.strip().lower()}, {"_id": 0})

    def add_user(self, name, email, password):
        if self.db is None: return None
        
        # Determine next ID
        last_user = self.db.users.find_one(sort=[("id", -1)])
        next_id = (last_user["id"] + 1) if last_user and "id" in last_user else 1
        
        now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        new_user = {
            'id': next_id,
            'name': name.strip(),
            'email': email.strip().lower(),
            'password': password,
            'created_at': now_str
        }
        self.db.users.insert_one(new_user)
        # Remove _id before returning to match previous behavior
        new_user.pop('_id', None)
        return new_user

    # --- TRIP OPERATIONS ---
    def get_trips(self):
        if self.db is None: return []
        trips = list(self.db.trips.find({}, {"_id": 0}))
        return sorted(trips, key=lambda x: x.get('id', 0))

    def add_trip(self, user_email, destination, days, budget, interests='General Sightseeing'):
        if self.db is None: return None
        
        last_trip = self.db.trips.find_one(sort=[("id", -1)])
        next_id = (last_trip["id"] + 1) if last_trip and "id" in last_trip else 1
        
        user = self.find_user_by_email(user_email)
        user_id = user.get('id') if user else None
        
        now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
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
        self.db.trips.insert_one(new_trip)
        new_trip.pop('_id', None)
        return new_trip

    # --- BOOKING OPERATIONS ---
    def get_bookings(self):
        if self.db is None: return []
        bookings = list(self.db.bookings.find({}, {"_id": 0}))
        return sorted(bookings, key=lambda x: x.get('id', 0))

    def add_booking(self, booking_ref, user_name, user_email, user_phone, destination, days, total_amount, payment_method):
        if self.db is None: return None
        
        last_booking = self.db.bookings.find_one(sort=[("id", -1)])
        next_id = (last_booking["id"] + 1) if last_booking and "id" in last_booking else 1
        
        user = self.find_user_by_email(user_email)
        user_id = user.get('id') if user else None
        
        now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
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
        self.db.bookings.insert_one(new_booking)
        new_booking.pop('_id', None)
        return new_booking

    # --- ADMIN DUMP & RESET ---
    def get_all_data(self):
        users = self.get_users()
        trips = self.get_trips()
        bookings = self.get_bookings()

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
        if self.db is None: return False, "Database not connected."
        
        if table_name not in ['users', 'trips', 'bookings']:
            return False, "Invalid table name."
            
        self.db[table_name].delete_many({})
        return True, f"Table '{table_name}' has been reset successfully!"

    def delete_record(self, table_name, record_id):
        if self.db is None: return False, "Database not connected."
        
        if table_name not in ['users', 'trips', 'bookings']:
            return False, "Invalid table name."
            
        record_id_str = str(record_id).strip().lower()
        
        # Try finding by 'id' first, which is an integer in our design, but might be string
        try:
            int_id = int(record_id_str)
            result = self.db[table_name].delete_one({"id": int_id})
            if result.deleted_count > 0:
                return True, f"Record '{record_id}' successfully deleted from '{table_name}'!"
        except ValueError:
            pass

        # Try finding by email or booking_ref
        result = self.db[table_name].delete_one({"$or": [{"email": record_id_str}, {"booking_ref": record_id_str}]})
        
        if result.deleted_count > 0:
            return True, f"Record '{record_id}' successfully deleted from '{table_name}'!"
            
        return False, f"Record '{record_id}' not found in '{table_name}'."

# Global Singleton Instance
db = MongoDBManager()
