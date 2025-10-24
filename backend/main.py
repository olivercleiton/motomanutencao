import os
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ========== ROTAS DO FRONTEND ==========
@app.route('/')
def serve_frontend():
    """Serve o frontend na rota raiz"""
    try:
        return send_file('../static/index.html')
    except Exception as e:
        return jsonify({"error": f"Frontend not found: {str(e)}"}), 404

@app.route('/<path:path>')
def serve_static_files(path):
    """Serve arquivos estáticos (CSS, JS, imagens)"""
    try:
        return send_from_directory('../static', path)
    except Exception as e:
        return jsonify({"error": f"Static file not found: {str(e)}"}), 404

# ========== ROTAS DA API (SEM BANCO) ==========
@app.route('/test')
def test_route():
    return jsonify({"message": "✅ TESTE - App funcionando perfeitamente!"})

@app.route('/api/status')
def api_status():
    return jsonify({"database": "Desativado temporariamente", "message": "API Motomanutencao Online! 🚀"})

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify([{
        "id": 1,
        "username": "usuario_teste",
        "email": "teste@email.com"
    }])

@app.route('/api/users', methods=['POST'])
def create_user():
    return jsonify({"message": "User criado com sucesso! (banco desativado)"}), 201

if __name__ == '__main__':
    # CONFIGURAÇÃO PARA RENDER - porta e host corretos
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
