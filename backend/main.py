import os
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='../static')
CORS(app)

# ========== ROTAS DO FRONTEND ==========
@app.route('/')
def serve_frontend():
    """Serve o frontend na rota raiz"""
    try:
        return send_file('../static/index.html')
    except Exception as e:
        return jsonify({"error": f"Frontend not found: {str(e)}"}), 404

# Rota específica para arquivos JS
@app.route('/static/js/<path:filename>')
def serve_js(filename):
    """Serve arquivos JavaScript"""
    try:
        return send_from_directory('../static/js', filename)
    except Exception as e:
        return jsonify({"error": f"JS file not found: {str(e)}"}), 404

# Rota específica para arquivos CSS
@app.route('/static/css/<path:filename>')
def serve_css(filename):
    """Serve arquivos CSS"""
    try:
        return send_from_directory('../static/css', filename)
    except Exception as e:
        return jsonify({"error": f"CSS file not found: {str(e)}"}), 404

# Rota genérica para outros arquivos estáticos
@app.route('/<path:path>')
def serve_static_files(path):
    """Serve outros arquivos estáticos"""
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
