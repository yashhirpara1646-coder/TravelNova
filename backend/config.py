import os
from dotenv import load_dotenv

# Base Directories
BACKEND_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, '..'))
DATA_DIR = os.path.join(BACKEND_DIR, 'data')

# Load environment variables from .env file at PROJECT_ROOT or BACKEND_DIR
env_file_path = os.path.join(PROJECT_ROOT, '.env')
if not os.path.exists(env_file_path):
    env_file_path = os.path.join(BACKEND_DIR, '.env')

load_dotenv(dotenv_path=env_file_path, override=True)

# Ensure Data Directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# JSON Database Files
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
TRIPS_FILE = os.path.join(DATA_DIR, 'trips.json')
BOOKINGS_FILE = os.path.join(DATA_DIR, 'bookings.json')

# API Keys loaded from .env
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '').strip()
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '').strip()
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'TravelNovaAdmin123!').strip()

# Database Config
MONGODB_URI = os.getenv('MONGODB_URI', '').strip()

# Server Config
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')
