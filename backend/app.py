import os
import sys

# Ensure backend package can be imported properly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, jsonify, send_from_directory, request
from backend.config import PROJECT_ROOT, HOST, PORT, DEBUG
from backend.routes.auth_routes import auth_bp
from backend.routes.trip_routes import trip_bp
from backend.routes.admin_routes import admin_bp
from backend.routes.api_routes import api_bp

app = Flask(__name__)

# Register Flask Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(trip_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(api_bp)

# CORS Header Middleware & Preflight Handling
@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,Admin-Key,admin-key'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return response, 200

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,Admin-Key,admin-key'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

# Root & Frontend Route
@app.route('/')
def home():
    frontend_dir = os.path.join(PROJECT_ROOT, 'frontend')
    return send_from_directory(frontend_dir, 'index.html')

@app.route('/api')
def api_info():
    return jsonify({
        'name': 'TravelNova AI Backend API (Groq Llama 3)',
        'status': 'Online',
        'version': '4.6.0',
        'models': {
            'ai_engine': 'Google Gemini (gemini-2.5-flash)',
            'weather_api': 'OpenWeather API',
            'maps_api': 'Google Maps JS API',
            'directions_api': 'Google Directions API',
            'places_api': 'Google Places API'
        }
    })

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'ok',
        'backend': 'Python Flask (Modular AI)',
        'model': 'gemini-2.5-flash',
        'database': 'MongoDB',
        'port': PORT
    })

# Static files route for web frontend
@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    frontend_dir = os.path.join(PROJECT_ROOT, 'frontend')
    if os.path.exists(os.path.join(frontend_dir, path)):
        return send_from_directory(frontend_dir, path)
    
    return send_from_directory(frontend_dir, 'index.html')

if __name__ == '__main__':
    print(f"[SERVER] TravelNova Modular Backend & Gemini AI running on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
