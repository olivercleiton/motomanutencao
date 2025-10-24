// auth.js - versão CORRIGIDA com persistência completa
class Auth {
    static currentUser = null;
    static isAuthenticated = false;

    // ✅ Inicialização automática
    static init() {
        console.log('🔐 Auth: Inicializando e verificando autenticação salva...');
        return this.checkAuthStatus();
    }

    // ✅ Verificar autenticação
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
                
                // ✅ Garantir que a API tenha o token
                if (window.API) {
                    window.API.token = token;
                    console.log('🔑 Auth: Token definido na API');
                }
                
                console.log('✅ Auth: Usuário recuperado:', this.currentUser.email);
                return true;
            } catch (error) {
                console.error('❌ Auth: Erro ao recuperar usuário:', error);
                this.clearAuth(); // Limpar dados corrompidos
            }
        }
        
        console.log('🔐 Auth: Nenhuma autenticação válida encontrada');
        this.isAuthenticated = false;
        return false;
    }

    // ✅ Login
    static async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        console.log('🔐 Auth: Tentando login com:', email);

        try {
            const data = await API.login(email, password); // ✅ Chamando método estático corretamente
            console.log('✅ Auth: Login bem-sucedido:', data.user);

            localStorage.setItem('user', JSON.stringify(data.user));
            UI.showDashboard();

        } catch (error) {
            console.error('❌ Auth: Erro no login:', error);
            alert('Erro no login: ' + error.message);
        }
    }

    // ✅ Registro
    static async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();

        console.log('👤 Auth: Tentando registro com:', email);

        try {
            const data = await API.register(name, email, password); // ✅ Chamando método estático corretamente
            console.log('✅ Auth: Registro bem-sucedido:', data.user);
            UI.showDashboard();

        } catch (error) {
            console.error('❌ Auth: Erro no registro:', error);
            alert('Erro no registro: ' + error.message);
        }
    }

    // ✅ Definir dados de autenticação
    static setAuthData(token, user) {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.currentUser = user;
        this.isAuthenticated = true;
        
        if (window.API) {
            window.API.token = token;
            console.log('🔑 Auth: Token configurado na API');
        }
        
        window.authState = { isAuthenticated: true, user, token };
    }

    // ✅ Mostrar app e carregar dados
    static async showAppAndLoadData() {
        if (window.UI?.showAppContent) {
            window.UI.showAppContent();
        } else {
            document.getElementById('loginScreen')?.classList.add('hidden');
            document.getElementById('registerScreen')?.classList.add('hidden');
            document.getElementById('appContent')?.classList.remove('hidden');
        }

        setTimeout(async () => {
            try {
                console.log('🚗 Auth: Carregando veículos do usuário...');
                await window.Vehicles?.loadVehicles();
                console.log('✅ Auth: Veículos carregados com sucesso');
            } catch (e) {
                console.error('❌ Auth: Erro ao carregar veículos:', e);
            }
        }, 500);
    }

    // ✅ Logout
    static handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            this.clearAuth();
            alert('Logout realizado!');
        }
    }

    // ✅ Limpar autenticação
    static clearAuth() {
        console.log('🚪 Auth: Realizando logout completo...');
        
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        
        this.currentUser = null;
        this.isAuthenticated = false;
        
        if (window.API) window.API.token = null;
        
        window.authState = { isAuthenticated: false, user: null, token: null };
        
        if (window.UI?.showLoginScreen) {
            window.UI.showLoginScreen();
        } else {
            document.getElementById('appContent')?.classList.add('hidden');
            document.getElementById('loginScreen')?.classList.remove('hidden');
        }
        
        console.log('✅ Auth: Logout completo - todos os dados limpos');
    }

    // ✅ Utilidades
    static getUserData() {
        if (!this.currentUser) return null;
        return {
            vehicles: [],
            services: [],
            maintenanceConfig: window.APP_CONFIG?.maintenanceIntervals || {}
        };
    }

    static saveUserData(data) {
        console.log('💾 Auth: Salvando dados do usuário:', data);
    }

    static initializeUserData() {
        console.log('🔧 Auth: Inicializando dados do usuário');
    }

    static isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    static getToken() {
        return localStorage.getItem('jwt_token');
    }
}

// 🔍 Debug global
window.debugAuth = () => {
    console.log('🔍 DEBUG AUTH COMPLETO:');
    console.log('- Token:', localStorage.getItem('jwt_token'));
    console.log('- User:', localStorage.getItem('user'));
    console.log('- CurrentUser:', Auth.currentUser);
    console.log('- isAuthenticated:', Auth.isAuthenticated);
    console.log('- API Token:', window.API?.token);
    console.log('- authState:', window.authState);
};

// 🌐 Tornar global
window.Auth = Auth;

// ✅ Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth: Iniciando verificação de autenticação...');
    Auth.init();
});

console.log('✅ Auth carregado - VERSÃO CORRIGIDA COM PERSISTÊNCIA');
