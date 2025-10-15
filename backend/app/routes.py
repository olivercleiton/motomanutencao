from flask import send_from_directory, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from app import db
from app.models import Vehicle
from app.utils import validate_vehicle_data

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
    try:
        user_id = get_jwt_identity()
        vehicles = Vehicle.query.filter_by(user_id=user_id).all()
        data = [v.to_dict() for v in vehicles]
        return jsonify(data)
    except Exception as e:
        print(f"Erro ao buscar veículos: {str(e)}")
        return jsonify({'error': 'Erro ao buscar veículos'}), 500


@bp.route('/api/vehicles', methods=['POST'])
@jwt_required()
def create_vehicle():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados JSON não fornecidos'}), 400
            
        errors = validate_vehicle_data(data)
        if errors:
            return jsonify({'errors': errors}), 400
        
        # Adiciona o user_id ao veículo
        data['user_id'] = user_id
        vehicle = Vehicle(**data)
        
        db.session.add(vehicle)
        db.session.commit()
        
        return jsonify(vehicle.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao criar veículo: {str(e)}")
        return jsonify({'error': 'Erro ao criar veículo'}), 500


@bp.route('/api/vehicles/<int:vehicle_id>', methods=['PUT'])
@jwt_required()
def update_vehicle(vehicle_id):
    try:
        user_id = get_jwt_identity()
        vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first_or_404()
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados JSON não fornecidos'}), 400
            
        errors = validate_vehicle_data(data)
        if errors:
            return jsonify({'errors': errors}), 400
            
        # Remove user_id se estiver presente (não pode alterar o proprietário)
        data.pop('user_id', None)
        
        for key, value in data.items():
            setattr(vehicle, key, value)
            
        db.session.commit()
        return jsonify(vehicle.to_dict())
        
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao atualizar veículo: {str(e)}")
        return jsonify({'error': 'Erro ao atualizar veículo'}), 500


@bp.route('/api/vehicles/<int:vehicle_id>', methods=['DELETE'])
@jwt_required()
def delete_vehicle(vehicle_id):
    try:
        user_id = get_jwt_identity()
        vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first_or_404()
        
        db.session.delete(vehicle)
        db.session.commit()
        
        return jsonify({'message': 'Veículo deletado com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao deletar veículo: {str(e)}")
        return jsonify({'error': 'Erro ao deletar veículo'}), 500