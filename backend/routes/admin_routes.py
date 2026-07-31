from flask import Blueprint, request, jsonify
from backend.json_db import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin/all-data')
def admin_all_data():
    all_data = db.get_all_data()
    return jsonify(all_data)


@admin_bp.route('/api/admin/reset-table', methods=['POST'])
def reset_table():
    data = request.get_json() or {}
    table = data.get('table', '').strip()

    success, msg = db.reset_table(table)
    if not success:
        return jsonify({'success': False, 'message': msg}), 400

    return jsonify({'success': True, 'message': msg})


@admin_bp.route('/api/admin/delete-record', methods=['POST'])
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
