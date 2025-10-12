// Gerenciamento da interface do usuário
const UI = {
    // Mostrar tela de login - VERSÃO CORRIGIDA
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        const appContent = document.getElementById('appContent');
        
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (registerScreen) registerScreen.classList.add('hidden');
        if (appContent) appContent.classList.add('hidden');
    },

    // Mostrar tela de cadastro - VERSÃO CORRIGIDA
    showRegisterScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        const appContent = document.getElementById('appContent');
        
        if (loginScreen) loginScreen.classList.add('hidden');
        if (registerScreen) registerScreen.classList.remove('hidden');
        if (appContent) appContent.classList.add('hidden');
    },

    // Mostrar conteúdo do aplicativo - VERSÃO CORRIGIDA
    showAppContent() {
        const loginScreen = document.getElementById('loginScreen');
        const registerScreen = document.getElementById('registerScreen');
        const appContent = document.getElementById('appContent');
        
        if (loginScreen) loginScreen.classList.add('hidden');
        if (registerScreen) registerScreen.classList.add('hidden');
        if (appContent) appContent.classList.remove('hidden');
        
        console.log('✅ App content mostrado - transição concluída');
    },

    // Alternar entre abas
    switchTab(tabName) {
        const tab = document.querySelector(`[data-bs-target="#${tabName}"]`);
        if (tab) {
            const tabInstance = new bootstrap.Tab(tab);
            tabInstance.show();
        }
    },

    // Atualizar alertas de manutenção - CORRIGIDO
    async updateMaintenanceAlerts() {
        const maintenanceAlerts = document.getElementById('maintenanceAlerts');
        if (!maintenanceAlerts) return;
        
        maintenanceAlerts.innerHTML = '';
        
        const currentVehicle = window.Vehicles?.currentVehicle;
        if (!currentVehicle) return;
        
        try {
            // Carregar serviços do veículo
            const services = await window.API.getServices(currentVehicle.id);
            const currentMileage = currentVehicle.current_mileage;
            
            // Carregar configurações
            const maintenanceConfig = window.APP_CONFIG?.maintenanceIntervals || {};
            
            const alerts = [];
            
            Object.keys(maintenanceConfig).forEach(type => {
                if (type === "Outro") return;
                
                const interval = maintenanceConfig[type];
                if (interval <= 0) return;
                
                // Encontrar o último serviço deste tipo
                const lastService = services
                    .filter(s => s.service_type === type)
                    .sort((a, b) => b.mileage - a.mileage)[0];
                
                const lastMileage = lastService ? lastService.mileage : 0;
                const nextMileage = lastMileage + interval;
                const remaining = nextMileage - currentMileage;
                
                if (remaining <= 0) {
                    // Manutenção vencida
                    alerts.push({
                        type,
                        status: 'due',
                        message: `${type} está vencido!`,
                        remaining: 0
                    });
                } else if (remaining <= interval * 0.2) {
                    // Manutenção próxima (20% do intervalo)
                    alerts.push({
                        type,
                        status: 'soon',
                        message: `${type} em breve (${this.formatNumber(remaining)} km restantes)`,
                        remaining
                    });
                }
            });
            
            if (alerts.length === 0) {
                maintenanceAlerts.innerHTML = '<p class="text-center text-success"><i class="fas fa-check-circle me-2"></i>Todas as manutenções em dia!</p>';
                return;
            }
            
            // Ordenar alertas por prioridade
            alerts.sort((a, b) => {
                if (a.status === 'due' && b.status !== 'due') return -1;
                if (a.status !== 'due' && b.status === 'due') return 1;
                return a.remaining - b.remaining;
            });
            
            alerts.forEach(alert => {
                const alertElement = document.createElement('div');
                alertElement.className = `alert ${alert.status === 'due' ? 'alert-danger' : 'alert-warning'} d-flex justify-content-between align-items-center`;
                alertElement.innerHTML = `
                    <div>
                        <i class="fas ${alert.status === 'due' ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2"></i>
                        ${alert.message}
                    </div>
                    <button class="btn btn-sm ${alert.status === 'due' ? 'btn-outline-danger' : 'btn-outline-warning'}" onclick="Services.quickAddService('${alert.type}')">
                        Registrar
                    </button>
                `;
                maintenanceAlerts.appendChild(alertElement);
            });
            
        } catch (error) {
            console.error('❌ Erro ao carregar alertas:', error);
            maintenanceAlerts.innerHTML = '<p class="text-center text-muted">Erro ao carregar alertas</p>';
        }
    },

    // Método utilitário para formatar números
    formatNumber(number) {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('pt-BR').format(number);
    },

    // Alternar visibilidade da senha - NOVO MÉTODO ADICIONADO
    togglePassword(inputId, button) {
        const passwordInput = document.getElementById(inputId);
        const icon = button.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            button.setAttribute('aria-label', 'Ocultar senha');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            button.setAttribute('aria-label', 'Mostrar senha');
        }
        
        // Foca no campo de senha após alternar
        passwordInput.focus();
    },

    // Alternar modo de alto contraste
    toggleContrast() {
        document.body.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
    },

    // Instalar aplicativo
    installApp() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuário aceitou a instalação');
                    this.dismissInstallBanner();
                }
                window.deferredPrompt = null;
            });
        }
    },

    // Dispensar banner de instalação
    dismissInstallBanner() {
        const installBanner = document.getElementById('installBanner');
        if (installBanner) {
            installBanner.style.display = 'none';
        }
    },

    // Configurar event listeners da interface
    setupUIEventListeners() {
        // Alternar entre login e cadastro
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterScreen();
        });
        
        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginScreen();
        });

        // Navegação inferior
        document.querySelectorAll('.bottom-nav button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (tab) this.switchTab(tab);
            });
        });

        // Botões de controle
        document.getElementById('contrastToggle')?.addEventListener('click', () => {
            this.toggleContrast();
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            Auth.handleLogout();
        });

        // Instalação do app
        document.getElementById('installAppBtn')?.addEventListener('click', () => {
            this.installApp();
        });

        document.getElementById('dismissInstallBtn')?.addEventListener('click', () => {
            this.dismissInstallBanner();
        });

        // Detectar se o app pode ser instalado
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            const installBanner = document.getElementById('installBanner');
            if (installBanner) {
                installBanner.style.display = 'block';
            }
        });

        // Carregar preferência de contraste
        if (localStorage.getItem('highContrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
    }
};

window.UI = UI;