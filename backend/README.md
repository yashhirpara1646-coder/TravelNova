# TravelNova - Python Backend Server

This is the official Python Flask REST API backend for the TravelNova Travel Planner.

## 🌟 Endpoints

- `GET /` - Root API status
- `GET /api/health` - Server health check
- `GET /api/cities` - Get list of popular cities
- `GET /api/fetch-city-data?city=CityName` - Geocode & fetch real-time places, hotels & food
- `POST /api/calculate-budget` - Itemized expense & budget breakdown

## 🚀 How to Run Python Backend

1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask API server:
   ```bash
   python app.py
   ```

4. The server will start at `http://127.0.0.1:5000`
