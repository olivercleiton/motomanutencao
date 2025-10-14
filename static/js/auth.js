// auth.js - versão FINAL com persistência
class Auth {
    static currentUser = null;

    // Verificar se usuário está autenticado
    static checkAuthStatus() {
        const token = localStorage.getItem('jwt_token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            if (window.API) window.API.token = token;
            return true;
        }
        return false;
    }

    // Processar login
    static async handleLogin(event = null) {
        if (event) event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        console.log('🔧 Tentando login com:', email);

        try {
            if (!window.API?.login) throw new Error('API não carregada corretamente');

            const result = await window.API.login(email, password);
            console.log('✅ Resposta do servidor:', result);

            // ✅ Persistência
            localStorage.setItem('jwt_token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            this.currentUser = result.user;

            alert('Login realizado com sucesso!');

            // Mostrar app
            if (window.UI?.showAppContent) window.UI.showAppContent();
            else {
                document.getElementById('loginScreen')?.classList.add('hidden');
                document.getElementById('appContent')?.classList.remove('hidden');
            }

            // Carregar veículos depois
            setTimeout(async () => {
                try { await window.Vehicles?.loadVehicles(); }
                catch (e) { console.error('Erro ao carregar veículos:', e); }
            }, 100);

        } catch (error) {
            console.error('❌ Erro no login:', error);
            alert('Erro no login: ' + error.message);
        }
    }

    // Processar cadastro
    static async handleRegister(event = null) {
        if (event) event.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) { alert('As senhas não coincidem!'); return; }
        if (password.length < 6) { alert('A senha deve ter pelo menos 6 caracteres!'); return; }

        try {
            if (!window.API?.register) throw new Error('API não carregada corretamente');

            const result = await window.API.register(name, email, password);
            console.log('✅ Cadastro bem-sucedido:', result);

            // ✅ Persistência
            localStorage.setItem('jwt_token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            this.currentUser = result.user;

            alert('Cadastro realizado com sucesso!');

            // Mostrar app
            if (window.UI?.showAppContent) window.UI.showAppContent();
            else {
                document.getElementById('loginScreen')?.classList.add('hidden');
                document.getElementById('registerScreen')?.classList.add('hidden');
                document.getElementById('appContent')?.classList.remove('hidden');
            }

            // Carregar veículos depois
            setTimeout(async () => {
                try { await window.Vehicles?.loadVehicles(); }
                catch (e) { console.error('Erro ao carregar veículos:', e); }
            }, 100);

        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            alert('Erro no cadastro: ' + error.message);
        }
    }

    // Logout
    static handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user');
            this.currentUser = null;
            window.API?.logout();
            window.UI?.showLoginScreen();
            alert('Logout realizado!');
        }
    }

    // Obter dados do usuário atual
    static getUserData() {
        if (!this.currentUser) return null;
        return {
            vehicles: [],
            services: [],
            maintenanceConfig: window.APP_CONFIG?.maintenanceIntervals || {}
        };
    }

    static saveUserData(data) { console.log('💾 Salvando dados (simulado):', data); }
    static initializeUserData() { console.log('🔧 Inicializando dados do usuário'); }
}

// Debug
window.debugAuth = () => {
    console.log('🔍 DEBUG AUTH:');
    console.log('- Token:', localStorage.getItem('jwt_token'));
    console.log('- User:', localStorage.getItem('user'));
    console.log('- CurrentUser:', Auth.currentUser);
};

// Global
window.Auth = Auth;
console.log('✅ Auth carregado - VERSÃO FINAL');
