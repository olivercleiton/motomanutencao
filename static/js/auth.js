// auth.js - VERSÃO COMPATÍVEL COM MOCK
class Auth {
    static currentUser = null;
    static isAuthenticated = false;

    static init() {
        console.log('🔐 Auth: Inicializando com modo mock...');
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

    // ✅ LOGIN USANDO MOCK
    static async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        console.log('🔐 Auth: Tentando login MOCK com:', email);

        if (!email || !password) {
            alert('⚠️ Por favor, preencha email e senha');
            return;
        }

        try {
            // ✅ USA A API MOCK - SEM REQUISIÇÕES REAIS
            const data = await API.login(email, password);
            console.log('✅ Auth: Login mock realizado:', data.user);

            // Salvar usuário no localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            this.currentUser = data.user;
            this.isAuthenticated = true;
            
            this.showAppAndLoadData();
            alert('🎉 Login realizado com sucesso! (Modo Demo)');

        } catch (error) {
            console.error('❌ Auth: Erro no login mock:', error);
            alert('Erro no login: ' + error.message);
        }
    }

    // ✅ REGISTRO USANDO MOCK
    static async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();

        console.log('👤 Auth: Tentando registro MOCK com:', email);

        if (!name || !email || !password) {
            alert('⚠️ Por favor, preencha todos os campos');
            return;
        }

        try {
            // ✅ USA A API MOCK - SEM REQUISIÇÕES REAIS
            const data = await API.register(name, email, password);
            console.log('✅ Auth: Registro mock realizado:', data.user);

            localStorage.setItem('user', JSON.stringify(data.user));
            this.currentUser = data.user;
            this.isAuthenticated = true;
            
            this.showAppAndLoadData();
            alert('🎉 Conta criada com sucesso! (Modo Demo)');

        } catch (error) {
            console.error('❌ Auth: Erro no registro mock:', error);
            alert('Erro no registro: ' + error.message);
        }
    }

    static showAppAndLoadData() {
        console.log('🎉 Auth: Mostrando aplicação...');
        
        document.getElementById('loginScreen')?.classList.add('hidden');
        document.getElementById('registerScreen')?.classList.add('hidden');
        document.getElementById('appContent')?.classList.remove('hidden');
        
        // Carregar veículos
        setTimeout(() => {
            if (window.Vehicles && window.Vehicles.loadVehicles) {
                window.Vehicles.loadVehicles();
            }
        }, 500);
    }

    static handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            this.clearAuth();
            alert('👋 Logout realizado!');
        }
    }

    static clearAuth() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        this.currentUser = null;
        this.isAuthenticated = false;
        
        document.getElementById('appContent')?.classList.add('hidden');
        document.getElementById('loginScreen')?.classList.remove('hidden');
    }

    static isLoggedIn() {
        return this.isAuthenticated;
    }
}

window.Auth = Auth;

document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});

console.log('✅ Auth carregado - COMPATÍVEL COM MOCK');
