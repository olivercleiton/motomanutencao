// auth.js - versão CORRIGIDA com tratamento de JSON
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
                
                console.log('✅ Auth: Usuário recuperado:', this.currentUser.email);
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

    // ✅ **LOGIN CORRIGIDO - com tratamento de JSON**
    static async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        console.log('🔐 Auth: Tentando login com:', email);

        try {
            // ✅ **CHAMADA CORRIGIDA - usando fetch diretamente**
            const response = await fetch('https://motomanutencao.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            console.log('📡 Auth: Status da resposta:', response.status);

            // ✅ **TRATAMENTO SEGURO DO JSON**
            const responseText = await response.text();
            console.log('📄 Auth: Resposta bruta:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ Auth: Erro ao parsear JSON:', parseError);
                throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}`);
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || `Erro HTTP: ${response.status}`);
            }

            console.log('✅ Auth: Login bem-sucedido:', data.user);

            // ✅ **SALVAR DADOS CORRETAMENTE**
            this.setAuthData(data.token, data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // ✅ **REDIRECIONAR PARA DASHBOARD**
            if (window.UI && window.UI.showDashboard) {
                window.UI.showDashboard();
            } else {
                this.showAppAndLoadData();
            }

        } catch (error) {
            console.error('❌ Auth: Erro no login:', error);
            alert('Erro no login: ' + error.message);
        }
    }

    // ✅ **REGISTRO CORRIGIDO**
    static async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();

        console.log('👤 Auth: Tentando registro com:', email);

        try {
            // ✅ **CHAMADA CORRIGIDA - usando fetch diretamente**
            const response = await fetch('https://motomanutencao.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            console.log('📡 Auth: Status da resposta:', response.status);

            // ✅ **TRATAMENTO SEGURO DO JSON**
            const responseText = await response.text();
            console.log('📄 Auth: Resposta bruta:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ Auth: Erro ao parsear JSON:', parseError);
                throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}`);
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || `Erro HTTP: ${response.status}`);
            }

            console.log('✅ Auth: Registro bem-sucedido:', data.user);

            // ✅ **SALVAR DADOS CORRETAMENTE**
            this.setAuthData(data.token, data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // ✅ **REDIRECIONAR PARA DASHBOARD**
            if (window.UI && window.UI.showDashboard) {
                window.UI.showDashboard();
            } else {
                this.showAppAndLoadData();
            }

        } catch (error) {
            console.error('❌ Auth: Erro no registro:', error);
            alert('Erro no registro: ' + error.message);
        }
    }

    // ✅ **MÉTODO SET AUTH DATA CORRIGIDO**
    static setAuthData(token, user) {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // ✅ **Configurar token para futuras requisições API**
        if (window.API) {
            window.API.token = token;
            console.log('🔑 Auth: Token configurado na API');
        }
        
        window.authState = { isAuthenticated: true, user, token };
        console.log('✅ Auth: Dados de autenticação salvos');
    }

    // ✅ **MOSTRAR APP E CARREGAR DADOS**
    static async showAppAndLoadData() {
        // Esconder telas de login/registro
        document.getElementById('loginScreen')?.classList.add('hidden');
        document.getElementById('registerScreen')?.classList.add('hidden');
        document.getElementById('appContent')?.classList.remove('hidden');

        // Carregar dados do usuário
        setTimeout(async () => {
            try {
                console.log('🚗 Auth: Carregando veículos do usuário...');
                if (window.Vehicles && window.Vehicles.loadVehicles) {
                    await window.Vehicles.loadVehicles();
                    console.log('✅ Auth: Veículos carregados com sucesso');
                }
            } catch (e) {
                console.error('❌ Auth: Erro ao carregar veículos:', e);
            }
        }, 500);
    }

    // ✅ **LOGOUT** (mantido igual)
    static handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            this.clearAuth();
            alert('Logout realizado!');
        }
    }

    // ✅ **LIMPAR AUTENTICAÇÃO** (mantido igual)
    static clearAuth() {
        console.log('🚪 Auth: Realizando logout completo...');
        
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        
        this.currentUser = null;
        this.isAuthenticated = false;
        
        if (window.API) window.API.token = null;
        
        window.authState = { isAuthenticated: false, user: null, token: null };
        
        // Mostrar tela de login
        document.getElementById('appContent')?.classList.add('hidden');
        document.getElementById('loginScreen')?.classList.remove('hidden');
        
        console.log('✅ Auth: Logout completo - todos os dados limpos');
    }

    // ✅ **UTILIDADES** (mantidas iguais)
    static getUserData() {
        if (!this.currentUser) return null;
        return {
            vehicles: [],
            services: [],
            maintenanceConfig: window.APP_CONFIG?.maintenanceIntervals || {}
        };
    }

    static isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    static getToken() {
        return localStorage.getItem('jwt_token');
    }
}

// 🌐 **Tornar global**
window.Auth = Auth;

// ✅ **Inicialização automática**
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth: Iniciando verificação de autenticação...');
    Auth.init();
});

console.log('✅ Auth carregado - VERSÃO CORRIGIDA COM TRATAMENTO JSON');
