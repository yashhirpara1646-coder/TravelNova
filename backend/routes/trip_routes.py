import os
from flask import Blueprint, request, jsonify
from backend.mongo_db import db

trip_bp = Blueprint('trip', __name__)

@trip_bp.route('/api/save-trip', methods=['POST'])
def save_trip():
    data = request.get_json() or {}
    user_email = data.get('user_email', 'guest@travelnova.com').strip()
    destination = data.get('destination', '').strip()
    days = int(data.get('days', 3))
    budget = float(data.get('budget', 10000))
    interests = data.get('interests', 'General Sightseeing').strip() or 'General Sightseeing'

    if not destination:
        return jsonify({'success': False, 'message': 'Destination required.'}), 400

    new_trip = db.add_trip(
        user_email=user_email,
        destination=destination,
        days=days,
        budget=budget,
        interests=interests
    )

    return jsonify({
        'success': True,
        'message': 'Trip saved to JSON database!',
        'trip_id': new_trip['id']
    })


@trip_bp.route('/api/book-trip', methods=['POST'])
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

    new_booking = db.add_booking(
        booking_ref=booking_ref,
        user_name=user_name,
        user_email=user_email,
        user_phone=user_phone,
        destination=destination,
        days=days,
        total_amount=total_amount,
        payment_method=payment_method
    )

    return jsonify({
        'success': True,
        'message': f'🎉 Booking Confirmed! Ref: {booking_ref}',
        'booking': new_booking
    }), 201
