# Configuração do banco - SQLITE (sempre)
# Ignora completamente o PostgreSQL por enquanto
import os
from flask import Flask, jsonify
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

# Criar tabelas
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