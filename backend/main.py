import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Configuração do app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'motomanutencao-secret-key-2024'

# Configuração do banco - FORÇAR pg8000
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    # Se tiver DATABASE_URL, forçar uso do pg8000
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
    
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///motomanutencao.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

# Inicializar extensões
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Rotas básicas
@app.route('/')
def home():
    return {"message": "API Motomanutencao Online! 🚀", "database": "PostgreSQL" if DATABASE_URL else "SQLite"}

@app.route('/health')
def health():
    return {"status": "OK", "message": "Servidor funcionando"}

# Criar tabelas
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print("🚀 Servidor Flask iniciando...")
    print("📊 Banco de dados:", "PostgreSQL" if DATABASE_URL else "SQLite")
    print("🔗 Porta:", port)
    print("🌐 Host: 0.0.0.0")
    print("⏹️  Pressione Ctrl+C para parar o servidor")
    
    app.run(host='0.0.0.0', port=port, debug=False)