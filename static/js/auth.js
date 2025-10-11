// Gerenciamento de autenticação - versão CORRIGIDA
class Auth {
    static currentUser = null;

    // Verificar se usuário está autenticado
    static checkAuthStatus() {
        const token = localStorage.getItem('jwt_token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            if (window.API) {
                window.API.token = token;
            }
            return true;
        }
        return false;
    }

    // Processar login - VERSÃO CORRIGIDA E SIMPLIFICADA
    static async handleLogin(event = null) {
        if (event) {
            event.preventDefault();
        }
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('🔧 Tentando login com:', email);

        try {
            if (!window.API || !window.API.login) {
                throw new Error('API não está carregada corretamente');
            }

            console.log('🔧 Enviando requisição para:', window.API.BASE_URL + '/auth/login');
            
            const result = await window.API.login(email, password);
            console.log('✅ Resposta do servidor:', result);
            
            alert('Login realizado com sucesso!');
            
            // ✅ CORREÇÃO: Mostrar app PRIMEIRO (sincrono)
            if (window.UI && typeof window.UI.showAppContent === 'function') {
                window.UI.showAppContent();
            } else {
                // Fallback direto
                const loginScreen = document.getElementById('loginScreen');
                const appContent = document.getElementById('appContent');
                if (loginScreen && appContent) {
                    loginScreen.classList.add('hidden');
                    appContent.classList.remove('hidden');
                }
            }
            
            // ✅ CORREÇÃO: Carregar veículos DEPOIS de mostrar a tela
            setTimeout(async () => {
                try {
                    if (window.Vehicles && window.Vehicles.loadVehicles) {
                        await window.Vehicles.loadVehicles();
                        console.log('✅ Veículos carregados após login');
                    } else {
                        console.error('Vehicles não disponível');
                    }
                } catch (vehicleError) {
                    console.error('Erro ao carregar veículos:', vehicleError);
                    // Não impede o uso do app
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Erro no login:', error);
            alert('Erro no login: ' + error.message);
        }
    }

    // Processar cadastro - CORRIGIDO
    static async handleRegister(event = null) {
        if (event) {
            event.preventDefault();
        }
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        console.log('🔧 Tentando cadastro:', name, email);

        // Validações básicas
        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres!');
            return;
        }

        try {
            if (!window.API || !window.API.register) {
                throw new Error('API não está carregada corretamente. Verifique o console.');
            }

            console.log('🔧 Enviando requisição para:', window.API.BASE_URL + '/auth/register');
            
            const result = await window.API.register(name, email, password);
            console.log('✅ Cadastro bem-sucedido:', result);
            
            alert('Cadastro realizado com sucesso!');
            
            // ✅ CORREÇÃO: Mostrar aplicativo primeiro
            if (window.UI) {
                window.UI.showAppContent();
            } else {
                const loginScreen = document.getElementById('loginScreen');
                const registerScreen = document.getElementById('registerScreen');
                const appContent = document.getElementById('appContent');
                if (loginScreen && registerScreen && appContent) {
                    loginScreen.classList.add('hidden');
                    registerScreen.classList.add('hidden');
                    appContent.classList.remove('hidden');
                }
            }
            
            // ✅ CORREÇÃO: Carregar veículos depois
            setTimeout(async () => {
                try {
                    if (window.Vehicles && window.Vehicles.loadVehicles) {
                        await window.Vehicles.loadVehicles();
                    } else {
                        console.error('Vehicles não disponível');
                    }
                } catch (vehicleError) {
                    console.error('Erro ao carregar veículos:', vehicleError);
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            alert('Erro no cadastro: ' + error.message);
        }
    }

    // Processar logout
    static handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            if (window.API) {
                window.API.logout();
            }
            if (window.UI) {
                window.UI.showLoginScreen();
            }
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

    // Salvar dados do usuário (para compatibilidade)
    static saveUserData(data) {
        console.log('💾 Salvando dados (simulado para API):', data);
    }

    // Inicializar dados do usuário (para compatibilidade)
    static initializeUserData() {
        console.log('🔧 Inicializando dados do usuário');
    }
}

// Verificação de módulos
console.log('🔍 Verificando módulos carregados:');
console.log('- Auth:', !!window.Auth);
console.log('- UI:', !!window.UI);
console.log('- Vehicles:', !!window.Vehicles);
console.log('- API:', !!window.API);
console.log('- App:', !!window.App);

// Função global para debug
window.debugAuth = () => {
    console.log('🔍 DEBUG AUTH:');
    console.log('- Token:', localStorage.getItem('jwt_token'));
    console.log('- User:', localStorage.getItem('user'));
    console.log('- CurrentUser:', Auth.currentUser);
};

// Tornar global
window.Auth = Auth;
console.log('✅ Auth carregado - VERSÃO CORRIGIDA');