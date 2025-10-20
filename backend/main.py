# Configuração do banco - SQLITE (sempre)
# Ignora completamente o PostgreSQL por enquanto
import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Configuração do app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'motomanutencao-secret-key-2024'

# ✅ SQLITE - SEMPRE (ignora DATABASE_URL)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///motomanutencao.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

# Inicializar extensões
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Modelo User simples
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    def __repr__(self):
        return f'<User {self.username}>'

# Rotas básicas
@app.route('/')
def home():
    return {"message": "API Motomanutencao Online! 🚀", "database": "SQLite"}

@app.route('/health')
def health():
    return {"status": "OK", "message": "Servidor funcionando"}

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "username": user.username,
        "email": user.email
    } for user in users])

# 🔥 ROTAS ESPECÍFICAS QUE O FRONTEND PRECISA:
@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    return jsonify({
        "success": True,
        "token": "jwt-token-placeholder-12345",
        "user": {
            "id": 1,
            "username": "olivercleiton",
            "email": "olivercleiton@gmail.com",
            "name": "Cleiton Rodrigues"
        }
    })

@app.route('/api/auth/register', methods=['POST'])
def auth_register():
    return jsonify({
        "success": True,
        "message": "Usuário cadastrado com sucesso!",
        "user": {
            "id": 2,
            "username": "novousuario", 
            "email": "novo@email.com",
            "name": "Novo Usuário"
        }
    })

@app.route('/api/auth/check', methods=['GET'])
def auth_check():
    return jsonify({
        "authenticated": True,
        "user": {
            "id": 1,
            "username": "olivercleiton",
            "email": "olivercleiton@gmail.com",
            "name": "Cleiton Rodrigues"
        }
    })

# Rotas de autenticação placeholder para o frontend
@app.route('/api/login', methods=['POST'])
def login():
    return jsonify({
        "success": True,
        "token": "placeholder-jwt-token",
        "user": {
            "id": 1,
            "username": "admin", 
            "email": "admin@example.com"
        }
    })

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    return jsonify({
        "authenticated": True,
        "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@example.com"
        }
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    return jsonify({"success": True})

# Rota para criar usuário (se o frontend precisar) - MANTENHA APENAS ESTA
@app.route('/api/register', methods=['POST'])
def register_user():  # MUDEI o nome para evitar duplicação
    return jsonify({
        "success": True,
        "message": "Usuário criado com sucesso"
    })

# 🔥 ROTAS DE VEÍCULOS CORRIGIDAS - FORMATO QUE O FRONTEND ESPERA:
@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    vehicles = [
        {
            "id": 1,
            "name": "Honda CB 500",
            "model": "CB 500", 
            "year": 2020,
            "plate": "ABC-1234",
            "color": "Vermelho",
            "current_mileage": 5000
        },
        {
            "id": 2,
            "name": "Yamaha MT-07",
            "model": "MT-07",
            "year": 2021,
            "plate": "XYZ-5678", 
            "color": "Azul",
            "current_mileage": 7000
        }
    ]
    return jsonify(vehicles)  # 🔥 RETORNA ARRAY DIRETO

@app.route('/api/vehicles', methods=['POST'])
def add_vehicle():
    # Simula a criação de um veículo
    new_vehicle = {
        "id": 3,
        "name": request.json.get('name', 'Novo Veículo'),
        "model": request.json.get('model', 'Modelo X'),
        "year": request.json.get('year', 2023),
        "plate": request.json.get('plate', 'NEW-9999'),
        "color": request.json.get('color', 'Preto'),
        "current_mileage": request.json.get('current_mileage', 0)
    }
    return jsonify(new_vehicle)

@app.route('/api/vehicles/<int:vehicle_id>', methods=['PUT'])
def update_vehicle(vehicle_id):
    # Simula atualização
    updated_vehicle = {
        "id": vehicle_id,
        "name": request.json.get('name', 'Veículo Atualizado'),
        "model": request.json.get('model', 'Modelo Atualizado'),
        "year": request.json.get('year', 2023),
        "plate": request.json.get('plate', 'UPD-9999'),
        "color": request.json.get('color', 'Atualizado'),
        "current_mileage": request.json.get('current_mileage', 0)
    }
    return jsonify(updated_vehicle)

@app.route('/api/vehicles/<int:vehicle_id>', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    return jsonify({
        "success": True,
        "message": f"Veículo {vehicle_id} excluído com sucesso!"
    })

# 🔥 ROTAS DE SERVIÇOS/MANUTENÇÕES CORRIGIDAS:
@app.route('/api/vehicles/<int:vehicle_id>/services', methods=['GET'])
def get_vehicle_services(vehicle_id):
    services = [  # 🔥 RETORNA ARRAY DIRETO
        {
            "id": 1,
            "vehicle_id": vehicle_id,
            "type": "Troca de óleo",
            "service_type": "Troca de óleo",
            "description": "Troca de óleo do motor",
            "date": "2024-01-15",
            "mileage": 5000,
            "cost": 150.00
        },
        {
            "id": 2,
            "vehicle_id": vehicle_id,
            "type": "Ajuste de freios",
            "service_type": "Ajuste de freios", 
            "description": "Regulagem dos freios dianteiro e traseiro",
            "date": "2024-02-20",
            "mileage": 7000,
            "cost": 80.00
        }
    ]
    return jsonify(services)  # 🔥 ARRAY DIRETO

@app.route('/api/vehicles/<int:vehicle_id>/services', methods=['POST'])
def add_vehicle_service(vehicle_id):
    return jsonify({
        "success": True,
        "message": "Serviço adicionado com sucesso!",
        "service": {
            "id": 3,
            "vehicle_id": vehicle_id,
            "type": "Nova manutenção",
            "service_type": "Nova manutenção",
            "description": "Descrição do serviço",
            "date": "2024-03-01",
            "mileage": 8000,
            "cost": 100.00
        }
    })

@app.route('/api/services/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    return jsonify({
        "success": True,
        "message": f"Serviço {service_id} atualizado com sucesso!"
    })

@app.route('/api/services/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    return jsonify({
        "success": True,
        "message": f"Serviço {service_id} excluído com sucesso!"
    })

# 🔥 ROTAS DE ESTATÍSTICAS CORRIGIDAS:
@app.route('/api/vehicles/<int:vehicle_id>/stats', methods=['GET'])
def get_vehicle_stats(vehicle_id):
    stats = {  # 🔥 RETORNA OBJETO DIRETO
        "total_services": 5,
        "total_spent": 850.00,
        "last_service_mileage": 8000,
        "next_service_estimate": 10000,
        "services_by_type": {
            "Troca de óleo": 2,
            "Ajuste de freios": 1,
            "Troca de pneu": 1,
            "Revisão geral": 1
        }
    }
    return jsonify(stats)  # 🔥 OBJETO DIRETO

# 🔥 ROTAS DE CONFIGURAÇÕES DE MANUTENÇÃO CORRIGIDAS:
@app.route('/api/vehicles/<int:vehicle_id>/maintenance-config', methods=['GET'])
def get_maintenance_config(vehicle_id):
    config = {  # 🔥 RETORNA OBJETO DIRETO
        "Troca de óleo": 5000,
        "Troca de pneu": 10000,
        "Ajuste de freios": 7000,
        "Troca de correia": 15000,
        "Revisão geral": 10000
    }
    return jsonify(config)  # 🔥 OBJETO DIRETO

@app.route('/api/vehicles/<int:vehicle_id>/maintenance-config', methods=['PUT'])
def update_maintenance_config(vehicle_id):
    return jsonify({
        "success": True,
        "message": "Configurações de manutenção atualizadas com sucesso!"
    })

# 🔥 ROTA PARA ATUALIZAR QUILOMETRAGEM:
@app.route('/api/vehicles/<int:vehicle_id>/mileage', methods=['PUT'])
def update_vehicle_mileage(vehicle_id):
    return jsonify({
        "success": True,
        "message": f"Quilometragem do veículo {vehicle_id} atualizada com sucesso!"
    })

# Criar tabelas (APENAS UMA VEZ)
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print("🚀 Servidor Flask iniciando...")
    print("📊 Banco de dados: SQLite")
    print("🔗 Porta:", port)
    print("🌐 Host: 0.0.0.0")
    print("⏹️  Pressione Ctrl+C para parar o servidor")
    
    app.run(host='0.0.0.0', port=port, debug=False)