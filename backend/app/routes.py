from flask import send_from_directory
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'frontend')

@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def serve_frontend(path):
    full_path = os.path.join(FRONTEND_DIR, path)
    if path and os.path.exists(full_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

# --- Fim do trecho de frontend ---


# ==============================
#      ROTAS DE VEÍCULOS
# ==============================

@bp.route('/api/vehicles', methods=['GET'])
@jwt_required()
def get_vehicles():
    vehicles = Vehicle.query.all()
    data = [v.to_dict() for v in vehicles]
    return jsonify(data)


@bp.route('/api/vehicles', methods=['POST'])
@jwt_required()
def create_vehicle():
    data = request.get_json()
    errors = validate_vehicle_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    vehicle = Vehicle(**data)
    db.session.add(vehicle)
    db.session.commit()
    return jsonify(vehicle.to_dict()), 201


@bp.route('/api/vehicles/<int:vehicle_id>', methods=['PUT'])
@jwt_required()
def update_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json()
    errors = validate_vehicle_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    for key, value in data.items():
        setattr(vehicle, key, value)
    db.session.commit()
    return jsonify(vehicle.to_dict())


@bp.route('/api/vehicles/<int:vehicle_id>', methods=['DELETE'])
@jwt_required()
def delete_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({'message': 'Vehicle deleted successfully'})
