import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Configuração do app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'motomanutencao-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///motomanutencao.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

# Inicializar extensões
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Importar e registrar blueprints
from app.auth import bp as auth_bp
from app.routes import bp as main_bp
app.register_blueprint(auth_bp)
app.register_blueprint(main_bp)

# Importar modelos
from app import models

@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("🚀 Servidor Flask iniciando...")
    print("📊 Banco de dados: SQLite")
    print("🔗 API disponível em: http://localhost:5000")
    print("⏹️  Pressione Ctrl+C para parar o servidor")
    app.run(debug=True, port=5000)