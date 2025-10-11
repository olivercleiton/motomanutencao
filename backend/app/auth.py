from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        user = User(
            name=data.get('name'),
            email=data.get('email')
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email
            }
        }), 201
        
    except Exception as e:
        print(f"Erro no registro: {str(e)}")
        return jsonify({'error': 'Erro ao criar usuário'}), 500

@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data.get('email')).first()
        
        if user and user.check_password(data.get('password')):
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'message': 'Login realizado com sucesso',
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email
                }
            })
        
        return jsonify({'error': 'Email ou senha inválidos'}), 401
        
    except Exception as e:
        print(f"Erro no login: {str(e)}")
        return jsonify({'error': 'Erro no login'}), 500

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email
        })
        
    except Exception as e:
        return jsonify({'error': 'Erro ao buscar usuário'}), 500