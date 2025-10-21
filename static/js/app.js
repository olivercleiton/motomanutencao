// Aplicativo principal - VERSÃO CORRIGIDA com persistência completa
// ✅ GARANTE QUE A API ESTÁ DISPONÍVEL GLOBALMENTE
if (!window.API) {
    window.API = new API();
    console.log('🌐 API global inicializada automaticamente');
}

const App = {
    // Estado global da aplicação
    state: {
        vehicles: [],
        services: [],
        currentVehicleId: null,
        maintenanceConfig: {}
    },

    // Inicialização da aplicação - VERSÃO MELHORADA
    async initialize() {
        console.log('🚀 Inicializando MotoManutenção PWA...');
        
        try {
            // ✅ MELHORADO: Verificar autenticação de forma robusta
            console.log('🔐 Verificando autenticação persistida...');
            const isAuthenticated = await this.checkAuthentication();
            console.log('📊 Status de autenticação:', isAuthenticated);
            
            if (isAuthenticated) {
                // ✅ USUÁRIO LOGADO - Mostrar app e carregar dados
                console.log('👤 Usuário autenticado, carregando aplicação...');
                await this.handleAuthenticatedUser();
            } else {
                // ✅ USUÁRIO NÃO LOGADO - Mostrar login
                console.log('🔒 Usuário não autenticado, mostrando tela de login...');
                this.showLoginScreen();
            }
            
            // Configurar eventos
            this.setupEventListeners();
            
            // ✅ Registrar Service Worker de forma não-bloqueante
            setTimeout(() => {
                this.registerServiceWorker();
            }, 1000);
            
            console.log('✅ App inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro crítico na inicialização:', error);
            this.showErrorScreen('Erro ao inicializar aplicação');
        }
    },

    // ✅ NOVO: Verificação robusta de autenticação
    async checkAuthentication() {
        try {
            // Verificar se Auth está disponível
            if (!window.Auth || !window.Auth.checkAuthStatus) {
                console.error('❌ Módulo Auth não carregado');
                return false;
            }
            
            // Verificar autenticação salva
            const hasSavedAuth = window.Auth.checkAuthStatus();
            console.log('💾 Auth check result:', hasSavedAuth);
            
            if (!hasSavedAuth) {
                return false;
            }
            
            // ✅ VALIDAR token com a API (opcional, mas recomendado)
            if (window.API && window.API.validateToken) {
                try {
                    const isValid = await window.API.validateToken();
                    console.log('🔐 Validação do token:', isValid);
                    return isValid;
                } catch (apiError) {
                    console.warn('⚠️ Erro na validação do token, usando cache:', apiError);
                    // Mesmo com erro na validação, usamos o cache por enquanto
                    return true;
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            return false;
        }
    },

    // ✅ NOVO: Lidar com usuário autenticado
    async handleAuthenticatedUser() {
        try {
            // 1. Mostrar conteúdo principal
            this.showAppContent();
            
            // 2. Carregar dados do usuário
            console.log('📦 Carregando dados do usuário...');
            await this.loadUserData();
            
            // 3. Verificar PWA status
            this.checkPWAStatus();
            
            console.log('🎉 Aplicação carregada completamente para usuário autenticado');
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do usuário:', error);
            // Mesmo com erro, mantemos o usuário logado
            this.showAppContent();
        }
    },

    // ✅ MELHORADO: Mostrar conteúdo do app
    showAppContent() {
        console.log('🏠 Mostrando conteúdo principal...');
        
        if (window.UI && window.UI.showAppContent) {
            window.UI.showAppContent();
        } else {
            // Fallback manual
            const loginScreen = document.getElementById('loginScreen');
            const registerScreen = document.getElementById('registerScreen');
            const appContent = document.getElementById('appContent');
            
            if (loginScreen) loginScreen.classList.add('hidden');
            if (registerScreen) registerScreen.classList.add('hidden');
            if (appContent) appContent.classList.remove('hidden');
        }
    },

    // ✅ NOVO: Mostrar tela de login
    showLoginScreen() {
        console.log('🔐 Mostrando tela de login...');
        
        if (window.UI && window.UI.showLoginScreen) {
            window.UI.showLoginScreen();
        } else {
            // Fallback manual
            const loginScreen = document.getElementById('loginScreen');
            const appContent = document.getElementById('appContent');
            
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (appContent) appContent.classList.add('hidden');
        }
    },

    // ✅ NOVO: Mostrar tela de erro
    showErrorScreen(message) {
        console.error('🚨 Mostrando tela de erro:', message);
        
        // Fallback simples - mostrar login
        this.showLoginScreen();
        if (message) {
            alert('Erro: ' + message);
        }
    },

    // ✅ MELHORADO: Carregar dados do usuário
    async loadUserData() {
        try {
            console.log('🚗 Iniciando carregamento de dados...');
            
            // 1. Carregar veículos primeiro
            if (window.Vehicles && window.Vehicles.loadVehicles) {
                console.log('📋 Carregando veículos...');
                await window.Vehicles.loadVehicles();
                console.log('✅ Veículos carregados');
            } else {
                console.warn('⚠️ Módulo Vehicles não disponível');
            }
            
            // 2. Se há veículo selecionado, carregar serviços e estatísticas
            if (window.Vehicles && window.Vehicles.currentVehicle) {
                console.log('🔧 Carregando dados do veículo selecionado...');
                const vehicleId = window.Vehicles.currentVehicle.id;
                
                if (window.Services && window.Services.loadServices) {
                    await window.Services.loadServices(vehicleId);
                }
                
                if (window.Stats && window.Stats.loadStatistics) {
                    await window.Stats.loadStatistics(vehicleId);
                }
            }
            
            console.log('✅ Todos os dados carregados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do usuário:', error);
            throw error; // Propagar o erro
        }
    },

    // Configurar event listeners
    setupEventListeners() {
        console.log('🎯 Configurando event listeners...');
        
        // Listeners para botões de login/registro
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (window.Auth && window.Auth.handleLogin) {
                    window.Auth.handleLogin(e);
                }
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (window.Auth && window.Auth.handleRegister) {
                    window.Auth.handleRegister(e);
                }
            });
        }
        
        // Listener para logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.Auth && window.Auth.handleLogout) {
                    window.Auth.handleLogout();
                }
            });
        }
        
        console.log('✅ Event listeners configurados');
    },

    // Registrar Service Worker para PWA
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            console.log('🚀 Registrando Service Worker...');
            
            const swUrl = './sw.js';
            navigator.serviceWorker.register(swUrl)
                .then(registration => {
                    console.log('✅ Service Worker registrado COM SUCESSO!');
                    console.log('Scope:', registration.scope);
                    console.log('Estado:', registration.active ? 'Ativo' : 'Inativo');
                })
                .catch(error => {
                    console.log('❌ ERRO no registro do Service Worker:', error);
                    console.log('URL tentada:', swUrl);
                });
        } else {
            console.log('❌ Service Worker não suportado');
        }
    },

    // Verificar status PWA
    checkPWAStatus() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
        const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
        
        const isPWA = isStandalone || isFullscreen || isMinimalUI;
        
        console.log('📱 Status PWA:', {
            isPWA: isPWA,
            displayMode: this.getDisplayMode(),
            isInstalled: this.isAppInstalled()
        });
        
        return isPWA;
    },

    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
        return 'browser';
    },

    isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.matchMedia('(display-mode: fullscreen)').matches || 
               window.matchMedia('(display-mode: minimal-ui)').matches;
    },

    // Utilitários
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    },

    showNotification(message, type = 'info') {
        // Melhorar para notificação não intrusiva no futuro
        console.log(`${type.toUpperCase()}: ${message}`);
        if (type === 'error') {
            alert(`Erro: ${message}`);
        }
    }

};

// ✅ MELHORADO: Event listeners globais para PWA
window.addEventListener('appinstalled', (evt) => {
    console.log('🎉 MotoManutenção instalado como PWA!');
    App.showNotification('Aplicativo instalado com sucesso!', 'success');
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📲 PWA pronto para instalação!');
    deferredPrompt = e;
    
    // Mostrar botão de instalação
    const installButton = document.getElementById('installAppBtn');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`Instalação: ${outcome}`);
                deferredPrompt = null;
                installButton.style.display = 'none';
            }
        });
    }
});

// ✅ INICIALIZAÇÃO ROBUSTA
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, inicializando app...');
    
    // Pequeno delay para garantir que todos os módulos carregaram
    setTimeout(() => {
        App.initialize();
    }, 100);
});

// Debug global
window.debugApp = () => {
    console.log('🔍 DEBUG APP COMPLETO:');
    console.log('- App State:', App.state);
    console.log('- Auth Status:', window.Auth?.isAuthenticated);
    console.log('- Current User:', window.Auth?.currentUser);
    console.log('- API Token:', window.API?.token);
    console.log('- Vehicles:', window.Vehicles?.vehicles);
};

window.App = App;
console.log('✅ App carregado - VERSÃO CORRIGIDA COM PERSISTÊNCIA');