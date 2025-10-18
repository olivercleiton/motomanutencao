import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Configuração do app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'motomanutencao-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///motomanutencao.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

# Inicializar extensões
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# COMENTE ou REMOVA estas linhas problemáticas:
# from app.auth import bp as auth_bp
# from app.routes import bp as main_bp
# app.register_blueprint(auth_bp)
# app.register_blueprint(main_bp)

# COMENTE esta também:
# from app import models

# Adicione uma rota básica para teste
@app.route('/')
def home():
    return {"message": "API Motomanutencao Online! 🚀"}

@app.route('/health')
def health():
    return {"status": "OK", "message": "Servidor funcionando"}

# Criar tabelas
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    print("🚀 Servidor Flask iniciando...")
    print("📊 Banco de dados:", "PostgreSQL" if os.environ.get('DATABASE_URL') else "SQLite")
    print("🔗 API disponível em: http://localhost:5000")
    print("⏹️  Pressione Ctrl+C para parar o servidor")
    app.run(debug=True, port=5000)