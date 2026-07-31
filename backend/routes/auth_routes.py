from flask import Blueprint, request, jsonify
from backend.json_db import db
from backend.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/register', methods=['POST'])
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

    existing_user = db.find_user_by_email(email)
    if existing_user:
        return jsonify({'success': False, 'message': 'Email address already registered. Please login instead.'}), 409

    new_user = db.add_user(name=name, email=email, password=password)

    return jsonify({
        'success': True,
        'message': 'User registered successfully in TravelNova JSON database!',
        'user': {'id': new_user['id'], 'name': new_user['name'], 'email': new_user['email']}
    }), 201


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not validate_email(email):
        return jsonify({'success': False, 'message': 'Please enter a valid email address.'}), 400

    if not password:
        return jsonify({'success': False, 'message': 'Please enter your password.'}), 400

    user = db.find_user_by_email(email)
    if not user or user.get('password') != password:
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    return jsonify({
        'success': True,
        'message': f'Welcome back, {user["name"]}!',
        'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}
    })
