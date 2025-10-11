import os
import sys

# Adiciona o diretório atual ao path do Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db

app = create_app()

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