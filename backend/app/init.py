from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Configurações
    app.config['SECRET_KEY'] = 'motomanutencao-secret-key-2024'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///motomanutencao.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-2024'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Para desenvolvimento
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Register blueprints
    from app.auth import bp as auth_bp
    from app.routes import bp as main_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    
    return app