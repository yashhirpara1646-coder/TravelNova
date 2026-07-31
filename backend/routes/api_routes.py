from flask import Blueprint, request, jsonify
from backend.services.ai_service import ai_service
from backend.services.weather_service import weather_service
from backend.services.maps_service import maps_service
from backend.config import GEMINI_API_KEY, OPENWEATHER_API_KEY, GOOGLE_MAPS_API_KEY

api_bp = Blueprint('api_services', __name__)

# --- GEMINI 2.5 FLASH AI GENERATION ---
@api_bp.route('/api/ai/generate-plan', methods=['POST'])
def generate_ai_plan():
    data = request.get_json() or {}
    destination = data.get('destination', 'Jaipur').strip()
    days = int(data.get('days', 3))
    budget = float(data.get('budget', 12000))
    interests = data.get('interests', 'General Sightseeing').strip()
    dietary_pref = data.get('dietary_pref', 'Vegetarian').strip()
    adults = int(data.get('adults', 1))
    children = int(data.get('children', 0))
    seniors = int(data.get('seniors', 0))
    hotel_pref = data.get('hotel_pref', 'Standard').strip()
    transport_pref = data.get('transport_pref', 'Any').strip()

    plan = ai_service.generate_travel_plan(
        destination=destination,
        days=days,
        budget=budget,
        interests=interests,
        dietary_pref=dietary_pref,
        adults=adults,
        children=children,
        seniors=seniors,
        hotel_pref=hotel_pref,
        transport_pref=transport_pref
    )

    return jsonify({
        'success': True,
        'model': 'gemini-2.5-flash',
        'plan': plan
    })

# --- OPENWEATHER API ---
@api_bp.route('/api/weather', methods=['GET'])
def get_weather():
    destination = request.args.get('destination') or request.args.get('city') or 'Jaipur'
    result = weather_service.get_weather(destination)
    return jsonify(result)

# --- GOOGLE DIRECTIONS API (TRANSPORT: DISTANCE, TRAVEL TIME, DRIVING/WALKING ROUTES) ---
@api_bp.route('/api/transport/directions', methods=['POST'])
def get_directions():
    data = request.get_json() or {}
    origin = data.get('origin', 'Airport').strip()
    destination = data.get('destination', 'City Center').strip()
    result = maps_service.get_directions(origin, destination)
    return jsonify(result)

# --- GOOGLE PLACES API (FOOD: VEGETARIAN, VEGAN, JAIN) ---
@api_bp.route('/api/food/places', methods=['POST'])
def get_food_places():
    data = request.get_json() or {}
    destination = data.get('destination', 'Jaipur').strip()
    dietary_pref = data.get('dietary_pref', 'Vegetarian').strip()
    result = maps_service.get_dietary_places(destination, dietary_pref)
    return jsonify(result)

# --- GOOGLE PLACES API (INTEREST-BASED: NATURE, ADVENTURE, CULTURE, ETC.) ---
@api_bp.route('/api/places/interests', methods=['POST'])
def get_interest_places():
    data = request.get_json() or {}
    destination = data.get('destination', 'Jaipur').strip()
    interests = data.get('interests', 'Culture & Heritage').strip()
    result = maps_service.get_interest_places(destination, interests)
    return jsonify(result)

# --- GOOGLE PLACES API (GENERAL CITY DATA FOR ITINERARY BUILDER) ---
@api_bp.route('/api/places/city-data', methods=['POST'])
def get_city_data():
    data = request.get_json() or {}
    destination = data.get('destination', 'Jaipur').strip()
    days = int(data.get('days', 3))
    result = maps_service.get_city_data(destination, days=days)
    return jsonify(result)

# --- CONFIG / KEYS STATUS ENDPOINT ---
@api_bp.route('/api/config-status', methods=['GET'])
def config_status():
    return jsonify({
        'status': 'configured',
        'gemini_2_5_flash': bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("YOUR_")),
        'openweather': bool(OPENWEATHER_API_KEY and not OPENWEATHER_API_KEY.startswith("YOUR_")),
        'google_maps': bool(GOOGLE_MAPS_API_KEY and not GOOGLE_MAPS_API_KEY.startswith("YOUR_"))
    })
