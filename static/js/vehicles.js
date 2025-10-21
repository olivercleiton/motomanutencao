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

    // Adicionar novo veículo - VERSÃO CORRIGIDA
    static async addVehicle(vehicleData) {
        try {
            console.log('🚗 Adicionando veículo:', vehicleData);
            const response = await window.API.createVehicle(vehicleData);
            
            // ✅ CORREÇÃO: Extrair veículo da resposta de forma robusta
            let vehicle;
            if (response && typeof response === 'object') {
                vehicle = response.vehicle || response.data || response;
            } else {
                vehicle = response;
            }
            
            console.log('✅ Veículo criado:', vehicle);
            
            // ✅ CORREÇÃO: Garantir que vehicles seja array
            if (!Array.isArray(this.vehicles)) {
                this.vehicles = [];
            }
            
            // ✅ CORREÇÃO: Garantir que o veículo tenha um ID
            if (!vehicle.id) {
                vehicle.id = Date.now(); // ID temporário
            }
            
            this.vehicles.push(vehicle);
            this.renderVehicles();
            await this.selectVehicle(vehicle);
            
            this.hideModal('addVehicleModal');
            this.showNotification('Veículo adicionado com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao adicionar veículo:', error);
            this.showNotification('Erro ao adicionar veículo: ' + error.message, 'error');
        }
    }

    // Processar adição de veículo via formulário
    static async handleAddVehicle() {
        const name = document.getElementById('vehicleName')?.value;
        const model = document.getElementById('vehicleModel')?.value;
        const year = parseInt(document.getElementById('vehicleYear')?.value);
        const plate = document.getElementById('vehiclePlate')?.value;
        const mileage = parseInt(document.getElementById('vehicleMileage')?.value);
        
        console.log('📝 Dados do formulário:', { name, model, year, plate, mileage });
        
        // ✅ CORREÇÃO: Validação robusta
        if (!name || !model || !year || !mileage) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        if (year < 1900 || year > new Date().getFullYear() + 1) {
            this.showNotification('Ano do veículo inválido.', 'error');
            return;
        }
        
        if (mileage < 0) {
            this.showNotification('Quilometragem não pode ser negativa.', 'error');
            return;
        }
        
        await this.addVehicle({
            name: name.trim(),
            model: model.trim(),
            year,
            plate: plate?.trim() || '',
            current_mileage: mileage
        });
        
        // Limpar formulário
        const vehicleForm = document.getElementById('vehicleForm');
        if (vehicleForm) {
            vehicleForm.reset();
        }
    }

    // Atualizar veículo - VERSÃO CORRIGIDA
    static async updateVehicle(vehicleId, vehicleData) {
        try {
            console.log('🔄 Atualizando veículo:', vehicleId, vehicleData);
            const response = await window.API.updateVehicle(vehicleId, vehicleData);
            
            // ✅ CORREÇÃO: Extrair veículo da resposta de forma robusta
            let vehicle;
            if (response && typeof response === 'object') {
                vehicle = response.vehicle || response.data || response;
            } else {
                vehicle = response;
            }
            
            const index = this.vehicles.findIndex(v => v.id === vehicleId);
            
            if (index !== -1) {
                this.vehicles[index] = { ...this.vehicles[index], ...vehicle };
            }
            
            if (this.currentVehicle && this.currentVehicle.id === vehicleId) {
                this.currentVehicle = { ...this.currentVehicle, ...vehicle };
                this.renderVehicleInfo();
            }
            
            this.renderVehicles();
            this.showNotification('Informações salvas com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao atualizar veículo:', error);
            this.showNotification('Erro ao atualizar veículo: ' + error.message, 'error');
        }
    }

    // Excluir veículo - VERSÃO CORRIGIDA
    static async deleteVehicle(vehicleId) {
        try {
            console.log('🗑️ Excluindo veículo:', vehicleId);
            await window.API.deleteVehicle(vehicleId);
            
            // ✅ CORREÇÃO: Remover veículo da lista
            this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
            this.renderVehicles();
            
            if (this.vehicles.length > 0) {
                await this.selectVehicle(this.vehicles[0]);
            } else {
                this.currentVehicle = null;
                this.renderVehicleInfo();
                localStorage.removeItem('currentVehicle');
            }
            
            this.hideModal('deleteVehicleModal');
            this.showNotification('Veículo excluído com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao excluir veículo:', error);
            this.showNotification('Erro ao excluir veículo: ' + error.message, 'error');
        }
    }

    // Selecionar veículo - VERSÃO CORRIGIDA (não-bloqueante)
    static async selectVehicle(vehicle) {
        console.log('🎯 Selecionando veículo:', vehicle);
        
        // ✅ CORREÇÃO: Se for ID, encontrar o veículo de forma segura
        if (typeof vehicle === 'string' || typeof vehicle === 'number') {
            vehicle = this.vehicles.find(v => v.id == vehicle);
            if (!vehicle) {
                console.error('❌ Veículo não encontrado:', vehicle);
                this.showNotification('Veículo não encontrado', 'error');
                return;
            }
        }
        
        // ✅ CORREÇÃO: Validar se o veículo é válido
        if (!vehicle || !vehicle.id) {
            console.error('❌ Veículo inválido:', vehicle);
            return;
        }
        
        this.currentVehicle = vehicle;
        localStorage.setItem('currentVehicle', vehicle.id.toString());
        this.renderVehicles();
        this.renderVehicleInfo();
        
        // ✅ CORREÇÃO: Carregar dados relacionados de forma não-bloqueante
        setTimeout(async () => {
            try {
                await this.loadVehicleRelatedData(vehicle.id);
            } catch (error) {
                console.error('❌ Erro ao carregar dados relacionados:', error);
            }
        }, 50);
    }

    // Carregar dados relacionados ao veículo - VERSÃO CORRIGIDA
    static async loadVehicleRelatedData(vehicleId) {
        try {
            console.log('📦 Carregando dados relacionados para veículo:', vehicleId);
            
            // ✅ CORREÇÃO: Carregar serviços de forma segura
            if (window.Services && typeof window.Services.loadServices === 'function') {
                await window.Services.loadServices(vehicleId);
            } else {
                console.warn('⚠️ Módulo Services não disponível');
            }
            
            // ✅ CORREÇÃO: Carregar estatísticas de forma segura
            if (window.Stats && typeof window.Stats.loadStatistics === 'function') {
                await window.Stats.loadStatistics(vehicleId);
            } else {
                console.warn('⚠️ Módulo Stats não disponível');
            }
            
            // ✅ CORREÇÃO: Carregar e inicializar configurações
            await this.initializeVehicleConfig(vehicleId);
            
            // ✅ CORREÇÃO: Atualizar alertas de forma segura
            if (window.UI && typeof window.UI.updateMaintenanceAlerts === 'function') {
                await window.UI.updateMaintenanceAlerts();
            }
            
            console.log('✅ Todos os dados relacionados carregados para veículo:', vehicleId);
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do veículo:', error);
        }
    }

    // ✅ CORREÇÃO COMPLETA: Método initializeVehicleConfig corrigido
    static async initializeVehicleConfig(vehicleId) {
        try {
            console.log('🔧 Inicializando configurações para veículo:', vehicleId);
            
            const configs = await window.API.getMaintenanceConfig(vehicleId);
            
            // ✅ CORREÇÃO: Garantir que configs seja um array
            const safeConfigs = Array.isArray(configs) ? configs : [];
            
            console.log('✅ Configurações seguras:', safeConfigs);
            
            if (safeConfigs.length > 0) {
                this.renderMaintenanceConfig(safeConfigs);
            } else {
                this.renderEmptyConfig();
            }
            
        } catch (error) {
            console.error('❌ Erro ao inicializar configurações:', error);
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

    // Configurar botão de salvar configurações - VERSÃO CORRIGIDA
    static setupConfigSaveButton() {
        const saveButton = document.getElementById('saveMaintenanceConfig');
        if (saveButton) {
            // ✅ CORREÇÃO: Remover listeners antigos de forma segura
            saveButton.replaceWith(saveButton.cloneNode(true));
            const newSaveButton = document.getElementById('saveMaintenanceConfig');
            
            // ✅ CORREÇÃO: Adicionar novo listener
            newSaveButton.addEventListener('click', () => {
                this.saveMaintenanceConfig();
            });
        }
    }

    // Salvar configurações de manutenção - VERSÃO CORRIGIDA
    static async saveMaintenanceConfig() {
        if (!this.currentVehicle) {
            this.showNotification('Nenhum veículo selecionado.', 'error');
            return;
        }
        
        try {
            const inputs = document.querySelectorAll('.maintenance-interval');
            const newConfig = {};
            
            // ✅ CORREÇÃO: Coleta segura dos valores
            inputs.forEach(input => {
                const type = input.dataset.type;
                const value = parseInt(input.value) || 0;
                if (type && value >= 0) {
                    newConfig[type] = value;
                }
            });
            
            console.log('💾 Salvando configurações:', newConfig);
            
            if (window.API && typeof window.API.updateMaintenanceConfig === 'function') {
                await window.API.updateMaintenanceConfig(this.currentVehicle.id, newConfig);
            }
            
            // ✅ CORREÇÃO: Atualizar configuração global de forma segura
            if (window.APP_CONFIG) {
                window.APP_CONFIG.maintenanceIntervals = newConfig;
            } else {
                window.APP_CONFIG = { maintenanceIntervals: newConfig };
            }
            
            this.showNotification('Configurações salvas com sucesso!', 'success');
            
            // ✅ CORREÇÃO: Atualizar alertas de forma segura
            if (window.UI && typeof window.UI.updateMaintenanceAlerts === 'function') {
                await window.UI.updateMaintenanceAlerts();
            }
            
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            this.showNotification('Erro ao salvar configurações: ' + error.message, 'error');
        }
    }

    // Renderizar lista de veículos - VERSÃO CORRIGIDA
    static renderVehicles() {
        const vehiclesList = document.getElementById('vehiclesList');
        if (!vehiclesList) {
            console.log('⚠️ Elemento vehiclesList não encontrado');
            return;
        }
        
        vehiclesList.innerHTML = '';
        
        // ✅ CORREÇÃO: Garantir que vehicles seja array
        if (!Array.isArray(this.vehicles)) {
            this.vehicles = [];
        }
        
        if (this.vehicles.length === 0) {
            vehiclesList.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-motorcycle fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Nenhum veículo cadastrado</p>
                    <button class="btn btn-primary" onclick="document.getElementById('addVehicleModal').style.display='block'">
                        <i class="fas fa-plus me-2"></i>Adicionar Primeiro Veículo
                    </button>
                </div>
            `;
            return;
        }
        
        this.vehicles.forEach(vehicle => {
            const isActive = this.currentVehicle && vehicle.id === this.currentVehicle.id;
            const vehicleElement = document.createElement('div');
            vehicleElement.className = `col-md-4 mb-3 vehicle-selector ${isActive ? 'active' : ''}`;
            
            // ✅ CORREÇÃO: Sanitização de dados
            const vehicleName = this.escapeHtml(vehicle.name || 'Sem nome');
            const vehicleModel = this.escapeHtml(vehicle.model || 'Sem modelo');
            const vehicleYear = vehicle.year || 'N/A';
            const mileage = this.formatNumber(vehicle.current_mileage || vehicle.mileage || 0);
            
            vehicleElement.innerHTML = `
                <div class="card h-100 position-relative" onclick="Vehicles.selectVehicle(${vehicle.id})">
                    ${this.vehicles.length > 1 ? `
                    <div class="delete-vehicle-btn" onclick="event.stopPropagation(); Vehicles.showDeleteModal(${vehicle.id})">
                        <i class="fas fa-times"></i>
                    </div>` : ''}
                    <div class="card-body text-center">
                        <i class="fas fa-motorcycle fa-2x mb-2 text-primary"></i>
                        <h5 class="card-title">${vehicleName}</h5>
                        <p class="card-text">${vehicleModel} - ${vehicleYear}</p>
                        <p class="card-text"><small class="text-muted">${mileage} km</small></p>
                    </div>
                </div>
            `;
            vehiclesList.appendChild(vehicleElement);
        });
        
        this.updateVehicleManagementList();
    }

    // ✅ CORREÇÃO: Renderizar informações do veículo - VERSÃO CORRIGIDA
    static renderVehicleInfo() {
        const currentVehicleTitle = document.getElementById('currentVehicleTitle');
        const bikeModel = document.getElementById('bikeModel');
        const bikeYear = document.getElementById('bikeYear');
        const bikePlate = document.getElementById('bikePlate');
        const currentMileage = document.getElementById('currentMileage');
        
        if (!this.currentVehicle) {
            if (currentVehicleTitle) {
                currentVehicleTitle.textContent = 'Nenhum veículo selecionado';
            }
            if (bikeModel) bikeModel.value = '';
            if (bikeYear) bikeYear.value = '';
            if (bikePlate) bikePlate.value = '';
            if (currentMileage) currentMileage.value = '0';
            return;
        }
        
        // ✅ CORREÇÃO: Preencher dados de forma segura
        if (currentVehicleTitle) {
            currentVehicleTitle.textContent = this.escapeHtml(this.currentVehicle.name || 'Veículo sem nome');
        }
        if (bikeModel) bikeModel.value = this.escapeHtml(this.currentVehicle.model || '');
        if (bikeYear) bikeYear.value = this.currentVehicle.year || '';
        if (bikePlate) bikePlate.value = this.escapeHtml(this.currentVehicle.plate || '');
        if (currentMileage) {
            const mileage = this.currentVehicle.current_mileage || this.currentVehicle.mileage || 0;
            currentMileage.value = parseInt(mileage) || 0;
        }
    }

    // Salvar informações do veículo - VERSÃO CORRIGIDA
    static async saveBikeInfo() {
        if (!this.currentVehicle) {
            this.showNotification('Nenhum veículo selecionado.', 'error');
            return;
        }
        
        try {
            const bikeModel = document.getElementById('bikeModel');
            const bikeYear = document.getElementById('bikeYear');
            const bikePlate = document.getElementById('bikePlate');
            const currentMileage = document.getElementById('currentMileage');
            
            // ✅ CORREÇÃO: Validação dos elementos
            if (!bikeModel || !bikeYear || !currentMileage) {
                this.showNotification('Elementos do formulário não encontrados.', 'error');
                return;
            }
            
            const vehicleData = {
                name: this.currentVehicle.name, // Mantém o nome original
                model: bikeModel.value.trim(),
                year: parseInt(bikeYear.value) || 0,
                plate: bikePlate?.value.trim() || '',
                current_mileage: parseInt(currentMileage.value) || 0
            };
            
            // ✅ CORREÇÃO: Validação dos dados
            if (!vehicleData.model || vehicleData.year < 1900 || vehicleData.current_mileage < 0) {
                this.showNotification('Dados inválidos. Verifique os campos.', 'error');
                return;
            }
            
            await this.updateVehicle(this.currentVehicle.id, vehicleData);
        } catch (error) {
            console.error('❌ Erro ao salvar informações:', error);
            this.showNotification('Erro ao salvar informações: ' + error.message, 'error');
        }
    }

    // Mostrar modal de exclusão - VERSÃO CORRIGIDA
    static showDeleteModal(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) {
            this.showNotification('Veículo não encontrado.', 'error');
            return;
        }
        
        const vehicleToDeleteName = document.getElementById('vehicleToDeleteName');
        if (vehicleToDeleteName) {
            vehicleToDeleteName.textContent = `${this.escapeHtml(vehicle.name)} (${this.escapeHtml(vehicle.model)} - ${vehicle.year})`;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('deleteVehicleModal'));
        modal.show();
        
        // ✅ CORREÇÃO: Configurar botão de confirmação de forma segura
        const confirmDeleteVehicleBtn = document.getElementById('confirmDeleteVehicleBtn');
        if (confirmDeleteVehicleBtn) {
            confirmDeleteVehicleBtn.onclick = () => {
                this.deleteVehicle(vehicleId);
                modal.hide();
            };
        }
    }

    // Atualizar lista de gerenciamento de veículos - VERSÃO CORRIGIDA
    static updateVehicleManagementList() {
        const vehicleManagementList = document.getElementById('vehicleManagementList');
        if (!vehicleManagementList) return;
        
        vehicleManagementList.innerHTML = '';
        
        if (this.vehicles.length === 0) {
            vehicleManagementList.innerHTML = `
                <div class="text-center py-3">
                    <p class="text-muted">Nenhum veículo cadastrado</p>
                </div>
            `;
            return;
        }
        
        this.vehicles.forEach(vehicle => {
            const vehicleElement = document.createElement('div');
            vehicleElement.className = 'list-group-item d-flex justify-content-between align-items-center';
            vehicleElement.innerHTML = `
                <div>
                    <h6 class="mb-1">${this.escapeHtml(vehicle.name)}</h6>
                    <p class="mb-1">${this.escapeHtml(vehicle.model)} - ${vehicle.year}</p>
                    <small>${this.formatNumber(vehicle.current_mileage)} km</small>
                </div>
                <button class="btn btn-outline-danger btn-sm" onclick="Vehicles.showDeleteModal(${vehicle.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            vehicleManagementList.appendChild(vehicleElement);
        });
    }

    // Resetar histórico do veículo - VERSÃO CORRIGIDA
    static async resetVehicleHistory() {
        if (!this.currentVehicle) {
            this.showNotification('Nenhum veículo selecionado.', 'error');
            return;
        }
        
        if (!confirm('Tem certeza que deseja resetar todo o histórico deste veículo? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            const response = await window.API.getServices(this.currentVehicle.id);
            
            // ✅ CORREÇÃO: Extrair serviços da resposta de forma robusta
            let services = [];
            if (Array.isArray(response)) {
                services = response;
            } else if (response && Array.isArray(response.services)) {
                services = response.services;
            } else if (response && response.success && Array.isArray(response.services)) {
                services = response.services;
            }
            
            console.log('🗑️ Excluindo serviços:', services);
            
            // ✅ CORREÇÃO: Excluir serviços de forma segura
            for (const service of services) {
                if (service && service.id) {
                    try {
                        await window.API.deleteService(service.id);
                    } catch (error) {
                        console.error(`❌ Erro ao excluir serviço ${service.id}:`, error);
                    }
                }
            }
            
            // Recarregar dados
            await this.loadVehicleRelatedData(this.currentVehicle.id);
            
            this.hideModal('resetConfirmModal');
            this.showNotification('Histórico resetado com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao resetar histórico:', error);
            this.showNotification('Erro ao resetar histórico: ' + error.message, 'error');
        }
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
}

// ✅ CORREÇÃO: Inicialização corrigida
console.log('🚗 Vehicles carregado - VERSÃO COMPLETAMENTE CORRIGIDA');

// Inicializar e tornar global
Vehicles.initialize();
window.Vehicles = Vehicles;