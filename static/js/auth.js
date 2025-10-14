// auth.js - versão CORRIGIDA com persistência completa
class Auth {
    static currentUser = null;
    static isAuthenticated = false;

    // ✅ NOVO: Inicialização automática
    static init() {
        console.log('🔐 Auth: Inicializando e verificando autenticação salva...');
        return this.checkAuthStatus();
    }

    // ✅ MELHORADO: Verificar autenticação com mais detalhes
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
                
                // ✅ GARANTIR que a API tem o token
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

    // ✅ MELHORADO: Processar login com persistência robusta
    static async handleLogin(event = null) {
        if (event) event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('🔐 Auth: Tentando login com:', email);

        try {
            if (!window.API?.login) {
                throw new Error('API não carregada corretamente');
            }

            const result = await window.API.login(email, password);
            console.log('✅ Auth: Login bem-sucedido:', result);

            // ✅ PERSISTÊNCIA ROBUSTA
            this.setAuthData(result.token, result.user);
            
            console.log('💾 Auth: Dados salvos no localStorage');
            console.log('👤 Usuário:', this.currentUser.email);
            console.log('🔑 Token:', this.token ? '✅ Definido' : '❌ Falhou');

            // ✅ MOSTRAR APP E CARREGAR DADOS
            this.showAppAndLoadData();
            
            return true;

        } catch (error) {
            console.error('❌ Auth: Erro no login:', error);
            alert('Erro no login: ' + error.message);
            return false;
        }
    }

    // ✅ NOVO: Função para definir dados de autenticação
    static setAuthData(token, user) {
        // Salvar no localStorage
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Atualizar estado interno
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Configurar API
        if (window.API) {
            window.API.token = token;
            console.log('🔑 Auth: Token configurado na API');
        }
        
        // Atualizar estado global para outros módulos
        window.authState = {
            isAuthenticated: true,
            user: user,
            token: token
        };
    }

    // ✅ NOVO: Mostrar app e carregar dados
    static async showAppAndLoadData() {
        // Mostrar app content
        if (window.UI?.showAppContent) {
            window.UI.showAppContent();
        } else {
            document.getElementById('loginScreen')?.classList.add('hidden');
            document.getElementById('registerScreen')?.classList.add('hidden');
            document.getElementById('appContent')?.classList.remove('hidden');
        }

        // ✅ CARREGAR DADOS DO USUÁRIO
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

    // ✅ MELHORADO: Processar cadastro
    static async handleRegister(event = null) {
        if (event) event.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return false;
        }
        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres!');
            return false;
        }

        try {
            if (!window.API?.register) {
                throw new Error('API não carregada corretamente');
            }

            const result = await window.API.register(name, email, password);
            console.log('✅ Auth: Cadastro bem-sucedido:', result);

            // ✅ PERSISTÊNCIA ROBUSTA
            this.setAuthData(result.token, result.user);
            
            console.log('💾 Auth: Dados de cadastro salvos no localStorage');

            // ✅ MOSTRAR APP E CARREGAR DADOS
            this.showAppAndLoadData();
            
            alert('Cadastro realizado com sucesso!');
            return true;

        } catch (error) {
            console.error('❌ Auth: Erro no cadastro:', error);
            alert('Erro no cadastro: ' + error.message);
            return false;
        }
    }

    // ✅ MELHORADO: Logout completo
    static handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            this.clearAuth();
            alert('Logout realizado!');
        }
    }

    // ✅ NOVO: Limpar autenticação completamente
    static clearAuth() {
        console.log('🚪 Auth: Realizando logout completo...');
        
        // Limpar localStorage
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        
        // Limpar estado interno
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Limpar API
        if (window.API) {
            window.API.token = null;
        }
        
        // Limpar estado global
        window.authState = { isAuthenticated: false, user: null, token: null };
        
        // Mostrar tela de login
        if (window.UI?.showLoginScreen) {
            window.UI.showLoginScreen();
        } else {
            document.getElementById('appContent')?.classList.add('hidden');
            document.getElementById('loginScreen')?.classList.remove('hidden');
        }
        
        console.log('✅ Auth: Logout completo - todos os dados limpos');
    }

    // ✅ MANTIDO: Obter dados do usuário atual
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

    // ✅ NOVO: Verificar se está autenticado
    static isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    // ✅ NOVO: Obter token atual
    static getToken() {
        return localStorage.getItem('jwt_token');
    }
}

// Debug
window.debugAuth = () => {
    console.log('🔍 DEBUG AUTH COMPLETO:');
    console.log('- Token:', localStorage.getItem('jwt_token'));
    console.log('- User:', localStorage.getItem('user'));
    console.log('- CurrentUser:', Auth.currentUser);
    console.log('- isAuthenticated:', Auth.isAuthenticated);
    console.log('- API Token:', window.API?.token);
    console.log('- authState:', window.authState);
};

// Global
window.Auth = Auth;

// ✅ INICIALIZAÇÃO AUTOMÁTICA quando o script carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth: Iniciando verificação de autenticação...');
    Auth.init();
});

console.log('✅ Auth carregado - VERSÃO CORRIGIDA COM PERSISTÊNCIA');