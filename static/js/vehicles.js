// Gerenciamento de veículos - VERSÃO COMPLETAMENTE CORRIGIDA
class Vehicles {
    static currentVehicle = null;
    static vehicles = [];

    // Nova função para verificar se o módulo está pronto
    static isReady() {
        return !!(window.Vehicles && window.Vehicles.loadVehicles);
    }

    // ✅ CORREÇÃO: Inicialização segura
    static initialize() {
        if (!Array.isArray(this.vehicles)) {
            this.vehicles = [];
        }
        console.log('🚗 Vehicles inicializado - Array garantido');
    }

    // Carregar veículos - VERSÃO COMPLETAMENTE CORRIGIDA
    static async loadVehicles() {
        try {
            console.log('🚗 Carregando veículos...');
            const response = await window.API.getVehicles();
            
            // ✅ CORREÇÃO MELHORADA: Tratamento robusto da resposta
            if (Array.isArray(response)) {
                this.vehicles = response;
            } else if (response && response.success && Array.isArray(response.vehicles)) {
                this.vehicles = response.vehicles;
            } else if (response && Array.isArray(response.data)) {
                this.vehicles = response.data;
            } else {
                console.warn('⚠️ Formato de resposta inesperado, usando array vazio:', response);
                this.vehicles = [];
            }
            
            console.log('✅ Veículos carregados:', this.vehicles);
            
            // Renderizar imediatamente (não-bloqueante)
            this.renderVehicles();
            
            // ✅ CORREÇÃO: Código corrigido - seleção de veículo com inicialização de configurações
            if (this.vehicles.length > 0) {
                const savedVehicleId = localStorage.getItem('currentVehicle');
                const vehicle = this.vehicles.find(v => v.id == savedVehicleId) || this.vehicles[0];
                
                // ✅ CORREÇÃO: Usar o novo método correto
                await this.selectVehicle(vehicle);
                
                // Carregar dados relacionados após seleção
                await this.initializeMaintenanceConfig(vehicle.id);
            } else {
                this.currentVehicle = null;
                this.renderVehicleInfo();
                // ✅ CORREÇÃO: Renderizar configurações vazias mesmo sem veículos
                this.renderEmptyConfig();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar veículos:', error);
            // Não travar o app com alerta
            console.log('⚠️ Aplicativo continuará sem dados de veículos');
            this.vehicles = []; // ✅ Garantir array vazio
            this.currentVehicle = null;
            this.renderVehicleInfo();
            this.renderVehicles(); // Renderiza mesmo com erro
            this.renderEmptyConfig(); // ✅ Renderizar configurações vazias em caso de erro
        }
    }

    // ✅ CORREÇÃO DEFINITIVA: Método loadVehicleRelatedData CORRIGIDO
    static async loadVehicleRelatedData(vehicleId) {
        try {
            console.log('📦 Carregando dados relacionados ao veículo...');
            
            // ✅ Carregar serviços
            if (window.Services && typeof window.Services.loadServices === 'function') {
                await window.Services.loadServices(vehicleId);
            }
            
            // ✅ NOVA IMPLEMENTAÇÃO: Inicializar configurações
            await this.initializeMaintenanceConfig(vehicleId);
            
            console.log('✅ Dados relacionados carregados com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados relacionados:', error);
        }
    }

    // ✅ NOVO MÉTODO: Substitui o initializeVehicleConfig que não existe
    static async initializeMaintenanceConfig(vehicleId) {
        try {
            console.log('⚙️ Inicializando configurações de manutenção...');
            
            // Tentar carregar configurações salvas
            if (window.API && typeof window.API.getMaintenanceConfig === 'function') {
                const config = await window.API.getMaintenanceConfig(vehicleId);
                if (config && config.success) {
                    console.log('✅ Configurações carregadas da API:', config);
                    this.renderMaintenanceConfig(config.data);
                    return;
                }
            }
            
            // Fallback: usar configurações padrão
            console.log('🔄 Usando configurações padrão');
            this.renderEmptyConfig();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar configurações:', error);
            // Fallback seguro
            this.renderEmptyConfig();
        }
    }

    // ✅ NOVO: Método para renderizar configuração vazia
    static renderEmptyConfig() {
        const configContainer = document.getElementById('maintenanceConfig');
        if (!configContainer) {
            console.log('⚠️ Elemento maintenanceConfig não encontrado');
            return;
        }
        
        console.log('🏗️ Renderizando configurações padrão...');
        
        // Configurações padrão
        const defaultConfig = {
            "Troca de óleo": 5000,
            "Troca de pneu": 10000,
            "Ajuste de freios": 7000,
            "Troca de correia": 15000,
            "Revisão geral": 10000
        };
        
        // ✅ CORREÇÃO: Atualizar configuração global de forma segura
        if (window.APP_CONFIG) {
            window.APP_CONFIG.maintenanceIntervals = defaultConfig;
        } else {
            window.APP_CONFIG = { maintenanceIntervals: defaultConfig };
        }
        
        this.renderMaintenanceConfig();
    }

    // Renderizar configurações na interface - VERSÃO CORRIGIDA
    static renderMaintenanceConfig(configs = null) {
        const configContainer = document.getElementById('maintenanceConfig');
        if (!configContainer) {
            console.log('⚠️ Elemento maintenanceConfig não encontrado');
            return;
        }
        
        // ✅ CORREÇÃO: Usar configs passadas ou as globais
        const config = configs || window.APP_CONFIG?.maintenanceIntervals || {};
        console.log('🎨 Renderizando configurações:', config);
        
        configContainer.innerHTML = '';
        
        // ✅ CORREÇÃO: Iteração segura sobre as chaves do objeto
        Object.keys(config).forEach(type => {
            if (type === "Outro") return;
            
            const configItem = document.createElement('div');
            configItem.className = 'maintenance-config-item';
            configItem.innerHTML = `
                <label class="form-label">${this.escapeHtml(type)} (a cada quantos km?)</label>
                <div class="input-group mb-3">
                    <input type="number" class="form-control maintenance-interval" 
                           data-type="${this.escapeHtml(type)}" value="${parseInt(config[type]) || 0}" min="0">
                    <span class="input-group-text">km</span>
                </div>
            `;
            configContainer.appendChild(configItem);
        });
        
        // Configurar evento de salvamento
        this.setupConfigSaveButton();
    }

    // ✅ NOVO: Utilitário para escapar HTML (prevenção XSS)
    static escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Utilitários
    static formatNumber(number) {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('pt-BR').format(number);
    }

    static showNotification(message, type = 'info') {
        // ✅ CORREÇÃO: Notificação melhorada
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    static hideModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            } else {
                // Fallback se a instância Bootstrap não existir
                modalElement.style.display = 'none';
                modalElement.classList.remove('show');
            }
        }
    }

    // ✅ MÉTODOS QUE FALTAM - ADICIONANDO OS MÉTODOS ORIGINAIS QUE FORAM REMOVIDOS
    static async selectVehicle(vehicle) {
        try {
            this.currentVehicle = vehicle;
            localStorage.setItem('currentVehicle', vehicle.id);
            this.renderVehicleInfo();
            
            // Carregar dados relacionados
            await this.loadVehicleRelatedData(vehicle.id);
            
            console.log('✅ Veículo selecionado:', vehicle);
        } catch (error) {
            console.error('❌ Erro ao selecionar veículo:', error);
        }
    }

    static renderVehicleInfo() {
        const vehicleInfoElement = document.getElementById('currentVehicleInfo');
        if (!vehicleInfoElement) return;

        if (this.currentVehicle) {
            vehicleInfoElement.innerHTML = `
                <h5>${this.escapeHtml(this.currentVehicle.name)}</h5>
                <p class="mb-1">Modelo: ${this.escapeHtml(this.currentVehicle.model || 'N/A')}</p>
                <p class="mb-1">Ano: ${this.escapeHtml(this.currentVehicle.year || 'N/A')}</p>
                <p class="mb-0">Quilometragem: ${this.formatNumber(this.currentVehicle.mileage || 0)} km</p>
            `;
        } else {
            vehicleInfoElement.innerHTML = '<p class="text-muted">Nenhum veículo selecionado</p>';
        }
    }

    static renderVehicles() {
        const vehiclesList = document.getElementById('vehiclesList');
        if (!vehiclesList) return;

        vehiclesList.innerHTML = '';

        this.vehicles.forEach(vehicle => {
            const vehicleElement = document.createElement('div');
            vehicleElement.className = `vehicle-item ${this.currentVehicle?.id === vehicle.id ? 'active' : ''}`;
            vehicleElement.innerHTML = `
                <div class="vehicle-info">
                    <strong>${this.escapeHtml(vehicle.name)}</strong>
                    <span>${this.escapeHtml(vehicle.model || '')} - ${this.escapeHtml(vehicle.year || '')}</span>
                </div>
                <div class="vehicle-mileage">
                    ${this.formatNumber(vehicle.mileage || 0)} km
                </div>
            `;
            vehicleElement.addEventListener('click', () => this.selectVehicle(vehicle));
            vehiclesList.appendChild(vehicleElement);
        });
    }

    static setupConfigSaveButton() {
        const saveButton = document.getElementById('saveMaintenanceConfig');
        if (saveButton) {
            saveButton.onclick = () => this.saveMaintenanceConfig();
        }
    }

    static async saveMaintenanceConfig() {
        try {
            if (!this.currentVehicle) {
                this.showNotification('Nenhum veículo selecionado', 'error');
                return;
            }

            const intervals = {};
            const inputs = document.querySelectorAll('.maintenance-interval');
            
            inputs.forEach(input => {
                const type = input.dataset.type;
                const value = parseInt(input.value) || 0;
                if (type && value > 0) {
                    intervals[type] = value;
                }
            });

            // Salvar via API
            if (window.API && typeof window.API.saveMaintenanceConfig === 'function') {
                const result = await window.API.saveMaintenanceConfig(this.currentVehicle.id, intervals);
                if (result && result.success) {
                    this.showNotification('Configurações salvas com sucesso!', 'success');
                } else {
                    throw new Error('Erro ao salvar configurações');
                }
            } else {
                // Fallback: salvar localmente
                if (window.APP_CONFIG) {
                    window.APP_CONFIG.maintenanceIntervals = intervals;
                }
                this.showNotification('Configurações salvas localmente!', 'success');
            }

            console.log('✅ Configurações salvas:', intervals);
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            this.showNotification('Erro ao salvar configurações', 'error');
        }
    }
}

// ✅ CORREÇÃO: Inicialização corrigida
console.log('🚗 Vehicles carregado - VERSÃO COMPLETAMENTE CORRIGIDA');

// Inicializar e tornar global
Vehicles.initialize();
window.Vehicles = Vehicles;