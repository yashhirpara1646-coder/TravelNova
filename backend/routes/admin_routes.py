from flask import Blueprint, request, jsonify
from backend.mongo_db import db
from backend.config import ADMIN_PASSWORD
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def require_admin_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_key = request.headers.get('Admin-Key')
        if not admin_key or admin_key != ADMIN_PASSWORD:
            return jsonify({'success': False, 'message': 'Unauthorized. Invalid Admin Password.'}), 401
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/api/admin/all-data')
@require_admin_auth
def admin_all_data():
    all_data = db.get_all_data()
    return jsonify(all_data)


@admin_bp.route('/api/admin/reset-table', methods=['POST'])
@require_admin_auth
def reset_table():
    data = request.get_json() or {}
    table = data.get('table', '').strip()

    success, msg = db.reset_table(table)
    if not success:
        return jsonify({'success': False, 'message': msg}), 400

    return jsonify({'success': True, 'message': msg})


@admin_bp.route('/api/admin/delete-record', methods=['POST'])
@require_admin_auth
def delete_record():
    data = request.get_json() or {}
    table = data.get('table', '').strip()
    record_id = data.get('id') or data.get('record_id') or data.get('ref') or data.get('email')

    if not table or record_id is None:
        return jsonify({'success': False, 'message': 'Table and Record ID are required.'}), 400

    success, msg = db.delete_record(table, record_id)
    if not success:
        return jsonify({'success': False, 'message': msg}), 400

    return jsonify({'success': True, 'message': msg})
