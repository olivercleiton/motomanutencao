import os
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

# Configurações
app.config['JWT_SECRET_KEY'] = 'sua-chave-secreta-super-segura-aqui'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

# Dados em memória (em produção, use banco de dados)
users_db = {}
vehicles_db = {}
services_db = {}
maintenance_config_db = {}

# ========== SERVIR ARQUIVOS ESTÁTICOS ==========
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# ========== ROTAS DA API ==========

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if email in users_db:
            return jsonify({'error': 'Usuário já existe'}), 400
            
        users_db[email] = {
            'id': len(users_db) + 1,
            'name': data.get('name'),
            'email': email,
            'password': data.get('password')  # Em produção, hash isso!
        }
        
        access_token = create_access_token(identity=email)
        return jsonify({
            'access_token': access_token,
            'user': users_db[email]
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        user = users_db.get(email)
        if not user or user['password'] != password:
            return jsonify({'error': 'Credenciais inválidas'}), 401
            
        access_token = create_access_token(identity=email)
        return jsonify({
            'access_token': access_token,
            'user': user
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Vehicle routes
@app.route('/api/vehicles', methods=['GET'])
@jwt_required()
def get_vehicles():
    try:
        current_user = get_jwt_identity()
        user_vehicles = [v for v in vehicles_db.values() if v['user_email'] == current_user]
        return jsonify(user_vehicles)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/vehicles', methods=['POST'])
@jwt_required()
def create_vehicle():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        vehicle_id = len(vehicles_db) + 1
        vehicle = {
            'id': vehicle_id,
            'user_email': current_user,
            'name': data.get('name'),
            'model': data.get('model'),
            'year': data.get('year'),
            'plate': data.get('plate'),
            'current_mileage': data.get('current_mileage')
        }
        
        vehicles_db[vehicle_id] = vehicle
        
        # Criar configurações padrão
        default_config = {
            "Troca de óleo": 5000,
            "Troca de pneu": 10000,
            "Ajuste de freios": 7000,
            "Troca de correia": 15000,
            "Revisão geral": 10000
        }
        
        maintenance_config_db[vehicle_id] = default_config
        
        return jsonify(vehicle), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/vehicles/<int:vehicle_id>', methods=['PUT'])
@jwt_required()
def update_vehicle(vehicle_id):
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        vehicle = vehicles_db.get(vehicle_id)
        if not vehicle or vehicle['user_email'] != current_user:
            return jsonify({'error': 'Veículo não encontrado'}), 404
            
        vehicle.update(data)
        return jsonify(vehicle)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/vehicles/<int:vehicle_id>', methods=['DELETE'])
@jwt_required()
def delete_vehicle(vehicle_id):
    try:
        current_user = get_jwt_identity()
        vehicle = vehicles_db.get(vehicle_id)
        
        if not vehicle or vehicle['user_email'] != current_user:
            return jsonify({'error': 'Veículo não encontrado'}), 404
            
        del vehicles_db[vehicle_id]
        
        # Deletar serviços e configurações relacionados
        services_to_delete = [sid for sid, service in services_db.items() if service['vehicle_id'] == vehicle_id]
        for sid in services_to_delete:
            del services_db[sid]
            
        if vehicle_id in maintenance_config_db:
            del maintenance_config_db[vehicle_id]
            
        return '', 204
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Service routes
@app.route('/api/vehicles/<int:vehicle_id>/services', methods=['GET'])
@jwt_required()
def get_services(vehicle_id):
    try:
        current_user = get_jwt_identity()
        vehicle = vehicles_db.get(vehicle_id)
        
        if not vehicle or vehicle['user_email'] != current_user:
            return jsonify({'error': 'Veículo não encontrado'}), 404
            
        vehicle_services = [s for s in services_db.values() if s['vehicle_id'] == vehicle_id]
        return jsonify(vehicle_services)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/vehicles/<int:vehicle_id>/services', methods=['POST'])
@jwt_required()
def create_service(vehicle_id):
    try:
        current_user = get_jwt_identity()
        vehicle = vehicles_db.get(vehicle_id)
        
        if not vehicle or vehicle['user_email'] != current_user:
            return jsonify({'error': 'Veículo não encontrado'}), 404
            
        data = request.get_json()
        service_id = len(services_db) + 1
        
        service = {
            'id': service_id,
            'vehicle_id': vehicle_id,
            'service_type': data.get('service_type'),
            'date': data.get('date'),
            'mileage': data.get('mileage'),
            'cost': data.get('cost'),
            'notes': data.get('notes')
        }
        
        services_db[service_id] = service
        
        # Atualizar quilometragem do veículo se for maior
        if service['mileage'] > vehicle['current_mileage']:
            vehicle['current_mileage'] = service['mileage']
            
        return jsonify(service), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    try:
        current_user = get_jwt_identity()
        service = services_db.get(service_id)
        
        if not service:
            return jsonify({'error': 'Serviço não encontrado'}), 404
            
        vehicle = vehicles_db.get(service['vehicle_id'])
        if not vehicle or vehicle['user_email'] != current_user:
            return jsonify({'error': 'Acesso negado'}), 403
            
        del services_db[service_id]
        return '', 204
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Maintenance config routes
@app.route('/api/vehicles/<int:vehicle_id>/maintenance-config', methods=['GET'])
@jwt_required()
def get_maintenance_config(vehicle_id):
    try:
        current_user = get_jwt_identity()
        vehicle = vehicles_db.get(vehicle_id)
        
        if not vehicle or vehicle['user_email'] != current_user:
            return jsonify({'error': 'Veículo não encontrado'}), 404
            
        config = maintenance_config_db.get(vehicle_id, {})
        
        # Converter para array (formato esperado pelo frontend)
        config_array = [{'service_type': k, 'interval_km': v} for k, v in config.items()]
        return jsonify(config_array)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/vehicles/<int:vehicle_id>/maintenance-config', methods=['POST'])
@jwt_required()
def update_maintenance_config(vehicle_id):
    try:
        current_user = get_jwt_identity()
        vehicle = vehicles_db.get(vehicle_id)
        
        if not vehicle or vehicle['user_email'] != current_user:
            return jsonify({'error': 'Veículo não encontrado'}), 404
            
        data = request.get_json()
        configs = data.get('configs', [])
        
        # Converter array para objeto
        config_obj = {}
        for config in configs:
            config_obj[config['service_type']] = config['interval_km']
            
        maintenance_config_db[vehicle_id] = config_obj
        
        return jsonify({'message': 'Configurações atualizadas'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Stats routes
@app.route('/api/vehicles/<int:vehicle_id>/stats', methods=['GET'])
@jwt_required()
def get_vehicle_stats(vehicle_id):
    try:
        current_user = get_jwt_identity()
        vehicle = vehicles_db.get(vehicle_id)
        
        if not vehicle or vehicle['user_email'] != current_user:
            return jsonify({'error': 'Veículo não encontrado'}), 404
            
        vehicle_services = [s for s in services_db.values() if s['vehicle_id'] == vehicle_id]
        
        stats = {
            'total_services': len(vehicle_services),
            'total_cost': sum(s.get('cost', 0) for s in vehicle_services),
            'total_mileage': vehicle['current_mileage']
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check
@app.route('/api/health')
def health_check():
    return jsonify({'status': 'OK', 'message': 'API está funcionando!'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)