import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)

def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Servidor rodando em http://localhost:{PORT}")
        print("📱 Acesse o MotoManutenção no navegador")
        print("⏹️  Pressione Ctrl+C para parar o servidor")
        
        # Abrir o navegador automaticamente
        webbrowser.open(f'http://localhost:{PORT}')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n⏹️  Servidor parado")

if __name__ == "__main__":
    start_server()