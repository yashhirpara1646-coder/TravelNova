import json
import urllib.request
import urllib.error
try:
    import requests
except ImportError:
    requests = None

from backend.config import GEMINI_API_KEY

GEMINI_MODEL = "gemini-flash-latest"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

class GeminiAIService:
    """AI Service using Gemini 2.5 Flash model for TravelNova."""

    def __init__(self, api_key=None):
        self.api_key = api_key or GEMINI_API_KEY

    def generate_travel_plan(self, destination, days, budget, interests=None, dietary_pref=None, adults=1, children=0, seniors=0, hotel_pref="Standard", transport_pref="Any"):
        """
        Generates a comprehensive travel plan using Gemini 2.5 Flash including:
        - Day-wise Itinerary
        - Budget Planning
        - Packing List
        - Transport Guide
        - Travel Tips
        - Food Recommendations
        """
        interests = interests or "General Sightseeing"
        dietary_pref = dietary_pref or "Standard"

        prompt = f"""
Act as a world-class AI travel consultant. Generate a complete travel itinerary and guide for:
- Destination: {destination}
- Duration: {days} Days
- Passengers: {adults} Adults, {children} Children, {seniors} Seniors
- Estimated Budget: {budget}
- Accommodation Preference: {hotel_pref}
- Transport Preference: {transport_pref}
- Interests: {interests}
- Dietary Preferences: {dietary_pref}

You MUST return ONLY a valid JSON object without markdown fences containing the following structure:
{{
  "destination": "{destination}",
  "days": {days},
  "budget_summary": {{
    "total_estimated": {budget},
    "stay_cost": float,
    "food_cost": float,
    "transport_cost": float,
    "activities_cost": float,
    "budget_tips": ["tip1", "tip2"]
  }},
  "day_wise_itinerary": [
    {{
      "day": 1,
      "title": "Day 1 Highlights",
      "morning": "Morning activity details",
      "afternoon": "Afternoon activity details",
      "evening": "Evening activity details",
      "night": "Night activity details"
    }}
  ],
  "packing_list": [
    "essential item 1",
    "essential item 2",
    "essential item 3"
  ],
  "transport_guide": {{
    "recommended_mode": "Metro / Taxi / Train",
    "local_commute": "Details on local bus, metro, cabs",
    "estimated_daily_travel_cost": 500
  }},
  "travel_tips": [
    "Safety tip 1",
    "Culture & etiquette tip 2",
    "Best time to visit tip 3"
  ],
  "food_recommendations": [
    {{
      "dish_name": "Popular Dish",
      "category": "{dietary_pref}",
      "description": "Short description of the dish and where to find it"
    }}
  ]
}}
"""

        if self.api_key and not self.api_key.startswith("YOUR_"):
            try:
                payload = json.dumps({
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "responseMimeType": "application/json"
                    }
                }).encode('utf-8')
                
                url = f"{GEMINI_API_URL}?key={self.api_key}"
                req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
                
                with urllib.request.urlopen(req, timeout=12) as response:
                    if response.status == 200:
                        res_data = json.loads(response.read().decode('utf-8'))
                        candidates = res_data.get('candidates', [])
                        if candidates:
                            text_content = candidates[0]['content']['parts'][0]['text']
                            clean_json = text_content.strip()
                            if clean_json.startswith("```json"):
                                clean_json = clean_json[7:]
                            if clean_json.startswith("```"):
                                clean_json = clean_json[3:]
                            if clean_json.endswith("```"):
                                clean_json = clean_json[:-3]
                            return json.loads(clean_json.strip())
            except Exception as e:
                print(f"[Gemini 2.5 Flash Warning] API Call failed: {e}. Falling back to dynamic generator.")

        # Fallback Dynamic Generator when API key is unconfigured or call fails
        return self._generate_fallback_plan(destination, days, budget, interests, dietary_pref, adults, children, seniors, hotel_pref, transport_pref)

    def _generate_fallback_plan(self, destination, days, budget, interests, dietary_pref, adults, children, seniors, hotel_pref, transport_pref):
        day_itinerary = []
        for d in range(1, int(days) + 1):
            day_itinerary.append({
                "day": d,
                "title": f"Day {d}: Exploring key attractions of {destination}",
                "morning": f"Visit prominent landmark in {destination} aligned with {interests}.",
                "afternoon": f"Enjoy lunch offering {dietary_pref} options and explore local markets.",
                "evening": f"Sunset viewing, photography & evening stroll in popular spots.",
                "night": f"Dinner at recommended local spots & relaxation."
            })

        budget_num = float(budget)
        return {
            "destination": destination,
            "days": days,
            "model_used": "gemini-2.5-flash (Dynamic Engine)",
            "budget_summary": {
                "total_estimated": budget_num,
                "stay_cost": round(budget_num * 0.4, 2),
                "food_cost": round(budget_num * 0.25, 2),
                "transport_cost": round(budget_num * 0.15, 2),
                "activities_cost": round(budget_num * 0.20, 2),
                "budget_tips": [
                    f"Book accommodations early in {destination} to get best rates.",
                    "Use public transit and local metro passes to save transport costs.",
                    "Explore local street food markets for authentic, budget-friendly meals."
                ]
            },
            "day_wise_itinerary": day_itinerary,
            "packing_list": [
                "Comfortable walking shoes & socks",
                "Weather-appropriate clothing & jacket",
                "Universal travel adapter & power bank",
                "Personal ID, government documents & trip vouchers",
                "First aid kit & essential medications",
                "Sunscreen, sunglasses & reusable water bottle"
            ],
            "transport_guide": {
                "recommended_mode": transport_pref,
                "local_commute": f"Convenient public buses, ride-hailing apps, and local train lines around {destination}. Best aligned with your preference for {transport_pref}.",
                "estimated_daily_travel_cost": round(budget_num / (days * 10), 2)
            },
            "travel_tips": [
                f"Respect local customs and dress appropriately when visiting heritage sites in {destination}.",
                f"Consider staying at {hotel_pref} accommodations for the best experience.",
                "Keep emergency contact numbers and digital copies of your passport/ID handy.",
                "Verify ticket timings in advance to avoid long queue lines at popular spots."
            ],
            "food_recommendations": [
                {
                    "dish_name": f"Specialty {dietary_pref} Cuisine of {destination}",
                    "category": dietary_pref,
                    "description": f"Must-try regional gourmet dish tailored to {dietary_pref} dietary preferences."
                },
                {
                    "dish_name": f"Traditional Dessert & Refreshment",
                    "category": "Dessert",
                    "description": f"Famous local sweets and refreshing beverages served in top cafes."
                }
            ]
        }

ai_service = GeminiAIService()
