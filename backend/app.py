import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configurar PostgreSQL para Render
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo User
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    def __repr__(self):
        return f'<User {self.username}>'


# Suas rotas existentes
@app.route('/')
def home():
    return jsonify({"message": "API Motomanutencao Online!"})

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        new_user = User(
            username=data['username'],
            email=data['email']
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User created successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "username": user.username,
        "email": user.email
    } for user in users])

# Criar tabelas ao inicializar
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
