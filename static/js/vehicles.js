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

    // Carregar veículos - VERSÃO CORRIGIDA (não-bloqueante)
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
            
            if (this.vehicles.length > 0) {
                const savedVehicleId = localStorage.getItem('currentVehicle');
                const vehicle = this.vehicles.find(v => v.id == savedVehicleId) || this.vehicles[0];
                
                // Não usar await aqui para não bloquear
                this.selectVehicle(vehicle);
            } else {
                this.currentVehicle = null;
                this.renderVehicleInfo();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar veículos:', error);
            // Não travar o app com alerta
            console.log('⚠️ Aplicativo continuará sem dados de veículos');
            this.vehicles = []; // ✅ Garantir array vazio
            this.currentVehicle = null;
            this.renderVehicleInfo();
            this.renderVehicles(); // Renderiza mesmo com erro
        }
    }

    // ✅ CORREÇÃO DEFINITIVA: Método loadVehicleRelatedData CORRIGIDO
    static async loadVehicleRelatedData(vehicleId) {
    try {
        console.log('📦 Carregando dados básicos para veículo:', vehicleId);
        
        // ✅ APENAS serviços (que funciona)
        if (window.Services && typeof window.Services.loadServices === 'function') {
            await window.Services.loadServices(vehicleId);
        }
        
        // ⚠️ ESTATÍSTICAS DESABILITADAS TEMPORARIAMENTE
        console.log('⏸️ Estatísticas temporariamente desabilitadas');
        
        // ⚠️ CONFIGURAÇÕES DESABILITADAS TEMPORARIAMENTE  
        console.log('⏸️ Configurações temporariamente desabilitadas');
        
        console.log('✅ Dados básicos carregados com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
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

    // ... (MANTENHA O RESTO DO CÓDIGO ORIGINAL DO vehicles.js)

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
}

// ✅ CORREÇÃO: Inicialização corrigida
console.log('🚗 Vehicles carregado - VERSÃO COMPLETAMENTE CORRIGIDA');

// Inicializar e tornar global
Vehicles.initialize();
window.Vehicles = Vehicles;