// Aplicativo principal - inicialização e coordenação
const App = {
    // Estado global da aplicação
    state: {
        vehicles: [],
        services: [],
        currentVehicleId: null,
        maintenanceConfig: {}
    },

    // Inicialização da aplicação - VERSÃO CORRIGIDA
    initialize() {
        console.log('🚀 Inicializando MotoManutenção PWA...');
        
        try {
            // ✅ CORREÇÃO: Verificar autenticação primeiro
            const isAuthenticated = Auth.checkAuthStatus();
            console.log('🔐 Status de autenticação:', isAuthenticated);
            
            if (isAuthenticated) {
                // Usuário já logado - mostrar app imediatamente
                if (window.UI && window.UI.showAppContent) {
                    window.UI.showAppContent();
                } else {
                    // Fallback manual
                    const loginScreen = document.getElementById('loginScreen');
                    const appContent = document.getElementById('appContent');
                    if (loginScreen && appContent) {
                        loginScreen.classList.add('hidden');
                        appContent.classList.remove('hidden');
                    }
                }
                
                // Carregar dados em segundo plano
                setTimeout(() => {
                    if (window.Vehicles && window.Vehicles.loadVehicles) {
                        window.Vehicles.loadVehicles();
                    }
                }, 500);
            } else {
                // Usuário não logado - mostrar login
                if (window.UI && window.UI.showLoginScreen) {
                    window.UI.showLoginScreen();
                } else {
                    // Fallback manual
                    const loginScreen = document.getElementById('loginScreen');
                    const appContent = document.getElementById('appContent');
                    if (loginScreen && appContent) {
                        loginScreen.classList.remove('hidden');
                        appContent.classList.add('hidden');
                    }
                }
            }
            
            // Configurar eventos
            this.setupEventListeners();
            
            // ✅ CORREÇÃO: Registrar Service Worker de forma não-bloqueante
            setTimeout(() => {
                this.registerServiceWorker();
            }, 1000);
            
            console.log('✅ App inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            // Fallback: mostrar login screen
            const loginScreen = document.getElementById('loginScreen');
            const appContent = document.getElementById('appContent');
            if (loginScreen && appContent) {
                loginScreen.classList.remove('hidden');
                appContent.classList.add('hidden');
            }
        }
    },

    // Configurar event listeners
    setupEventListeners() {
        // ... código existente ...
    },

    // Carregar dados do usuário
    async loadUserData() {
        // ... código existente ...
    },

    // === 🆕 ADICIONE ESTES NOVOS MÉTODOS AQUI ===
    
    // Registrar Service Worker para PWA
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            console.log('🚀 Registrando Service Worker na porta 8000...');
            // ✅ PARA PORTA 8000 - caminho relativo
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registrado COM SUCESSO!');
                    console.log('Scope:', registration.scope);
                    console.log('Estado:', registration.active ? 'Ativo' : 'Inativo');
                })
                .catch(error => {
                    console.log('❌ ERRO no registro:', error);
                    
                    // Log detalhado para debug
                    console.log('Verificando se sw.js existe em:', window.location.href + 'sw.js');
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

    // === FIM DOS NOVOS MÉTODOS ===

    // Utilitários (métodos existentes)
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    },

    showNotification(message, type = 'info') {
        alert(`${type.toUpperCase()}: ${message}`);
    }

}; // ← FECHAMENTO CORRETO DO OBJETO App

// Event listeners globais para PWA
window.addEventListener('appinstalled', (evt) => {
    console.log('🎉 MotoManutenção instalado como PWA!');
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📲 PWA pronto para instalação!');
    deferredPrompt = e;
    
    const installButton = document.getElementById('installAppBtn');
    if (installButton) {
        installButton.style.display = 'block';
    }
});

// Inicializar aplicação quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, inicializando app...');
    App.initialize();
});

window.App = App;