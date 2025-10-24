// auth.js - VERSÃO 100% FUNCIONAL SEM BACKEND
class Auth {
    static currentUser = null;
    static isAuthenticated = false;

    static init() {
        console.log('🔐 Auth: Inicializando...');
        return this.checkAuthStatus();
    }

    static checkAuthStatus() {
        const token = localStorage.getItem('jwt_token');
        const user = localStorage.getItem('user');
        
        console.log('💾 Auth: Verificando localStorage...');
        console.log('🔑 Token:', token ? '✅ Presente' : '❌ Ausente');
        console.log('👤 User:', user ? '✅ Presente' : '❌ Ausente');
        
        if (token && user) {
            try {
                this.currentUser = JSON.parse(user);
                this.isAuthenticated = true;
                console.log('✅ Auth: Usuário recuperado:', this.currentUser.email);
                
                // Auto-redirecionar se já estiver logado
                this.showAppAndLoadData();
                return true;
            } catch (error) {
                console.error('❌ Auth: Erro ao recuperar usuário:', error);
                this.clearAuth();
            }
        }
        
        console.log('🔐 Auth: Nenhuma autenticação válida encontrada');
        this.isAuthenticated = false;
        return false;
    }

    // ✅ **LOGIN MOCK - FUNCIONA SEM BACKEND**
    static async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        console.log('🔐 Auth: Tentando login com:', email);

        if (!email || !password) {
            alert('⚠️ Por favor, preencha email e senha');
            return;
        }

        // ✅ **SIMULAÇÃO DE LOGIN - SEM BACKEND**
        console.log('🔄 Auth: Usando autenticação mock...');
        
        // Simular delay de rede
        document.querySelector('button[type="submit"]').disabled = true;
        document.querySelector('button[type="submit"]').textContent = 'Entrando...';
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Criar usuário mock
        const mockUser = {
            id: 1,
            name: email.split('@')[0],
            email: email,
            vehicles: []
        };
        
        const mockToken = 'mock_jwt_token_' + Date.now();
        
        // Salvar dados
        this.setAuthData(mockToken, mockUser);
        this.showAppAndLoadData();
        
        console.log('✅ Auth: Login mockado realizado com sucesso!');
        alert('🎉 Login realizado com sucesso! (Modo Demo)');
    }

    // ✅ **REGISTRO MOCK - FUNCIONA SEM BACKEND**
    static async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();

        console.log('👤 Auth: Tentando registro com:', email);

        if (!name || !email || !password) {
            alert('⚠️ Por favor, preencha todos os campos');
            return;
        }

        if (password.length < 6) {
            alert('⚠️ A senha deve ter pelo menos 6 caracteres');
            return;
        }

        // ✅ **SIMULAÇÃO DE REGISTRO - SEM BACKEND**
        console.log('🔄 Auth: Usando registro mock...');
        
        document.querySelector('button[type="submit"]').disabled = true;
        document.querySelector('button[type="submit"]').textContent = 'Registrando...';
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockUser = {
            id: Date.now(),
            name: name,
            email: email,
            vehicles: []
        };
        
        const mockToken = 'mock_jwt_token_' + Date.now();
        
        this.setAuthData(mockToken, mockUser);
        this.showAppAndLoadData();
        
        console.log('✅ Auth: Registro mockado realizado com sucesso!');
        alert('🎉 Conta criada com sucesso! (Modo Demo)');
    }

    static setAuthData(token, user) {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.currentUser = user;
        this.isAuthenticated = true;
        
        console.log('✅ Auth: Dados salvos - Usuário:', user.email);
    }

    static showAppAndLoadData() {
        console.log('🎉 Auth: Mostrando aplicação...');
        
        // Esconder telas de auth
        document.getElementById('loginScreen')?.classList.add('hidden');
        document.getElementById('registerScreen')?.classList.add('hidden');
        
        // Mostrar app
        document.getElementById('appContent')?.classList.remove('hidden');
        
        // Resetar formulários
        document.getElementById('loginForm')?.reset();
        document.getElementById('registerForm')?.reset();
        
        // Resetar botões
        document.querySelectorAll('button[type="submit"]').forEach(btn => {
            btn.disabled = false;
            btn.textContent = btn.closest('#loginForm') ? 'Entrar' : 'Registrar';
        });
        
        // Carregar dados
        setTimeout(() => {
            if (window.Vehicles && window.Vehicles.loadVehicles) {
                window.Vehicles.loadVehicles();
            }
        }, 1000);
    }

    static handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            this.clearAuth();
            alert('👋 Logout realizado!');
        }
    }

    static clearAuth() {
        console.log('🚪 Auth: Realizando logout...');
        
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Mostrar tela de login
        document.getElementById('appContent')?.classList.add('hidden');
        document.getElementById('loginScreen')?.classList.remove('hidden');
        
        console.log('✅ Auth: Logout completo');
    }

    static isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    static getToken() {
        return localStorage.getItem('jwt_token');
    }

    static getUser() {
        return this.currentUser;
    }
}

// 🌐 Global
window.Auth = Auth;

// ✅ Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth: Iniciando verificação...');
    Auth.init();
});

console.log('✅ Auth carregado - VERSÃO MOCK 100% FUNCIONAL');
