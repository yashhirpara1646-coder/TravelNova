# TravelNova - Full-Stack Smart Travel Planning System

TravelNova is a full-stack web application with a dedicated **Frontend** and a **Python (Flask) REST API Backend**.

## 📁 Project Structure

```
TravelNova/
├── frontend/             # Dedicated Frontend Application
│   ├── index.html        # Main Single Page Application UI
│   └── app.html          # Alternative UI entry point
│
├── backend/              # Dedicated Python Flask REST API Backend
│   ├── app.py            # Main Flask Server & REST API endpoints
│   ├── requirements.txt  # Python package dependencies
│   └── README.md         # Backend documentation & instructions
│
├── index.html            # Root deployment file for GitHub Pages / Netlify
└── README.md             # Project documentation
```

## 🚀 How to Run

### 1. Run Python Backend API
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend will start on `http://127.0.0.1:5000`.

### 2. Run Frontend
Open `frontend/index.html` (or `index.html` in root) directly in any web browser!

## 🌐 Backend REST API Endpoints

- `GET /api/health` - Server health status
- `GET /api/cities` - Get list of popular cities
- `GET /api/fetch-city-data?city=CityName` - Real-time geocoding & location data
- `POST /api/calculate-budget` - Itemized expense breakdown API

## 📄 License
MIT License
