// Gerenciamento de veículos - VERSÃO CORRIGIDA (NÃO-BLOQUEANTE)
class Vehicles {
    static currentVehicle = null;
    static vehicles = [];

    // Nova função para verificar se o módulo está pronto
    static isReady() {
        return !!(window.Vehicles && window.Vehicles.loadVehicles);
    }

    // Carregar veículos - VERSÃO CORRIGIDA (não-bloqueante)
    static async loadVehicles() {
        try {
            console.log('🚗 Carregando veículos...');
            this.vehicles = await window.API.getVehicles();
            console.log('✅ Veículos carregados:', this.vehicles);
            
            // ✅ CORREÇÃO: Renderizar imediatamente (não-bloqueante)
            this.renderVehicles();
            
            if (this.vehicles.length > 0) {
                const savedVehicleId = localStorage.getItem('currentVehicle');
                const vehicle = this.vehicles.find(v => v.id == savedVehicleId) || this.vehicles[0];
                
                // ✅ CORREÇÃO: Não usar await aqui
                this.selectVehicle(vehicle);
            } else {
                this.currentVehicle = null;
                this.renderVehicleInfo();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar veículos:', error);
            // ✅ CORREÇÃO: Não travar o app com alerta
            console.log('⚠️ Aplicativo continuará sem dados de veículos');
            this.currentVehicle = null;
            this.renderVehicleInfo();
            this.renderVehicles(); // Renderiza mesmo com erro
        }
    }

    // Adicionar novo veículo
    static async addVehicle(vehicleData) {
        try {
            console.log('🚗 Adicionando veículo:', vehicleData);
            const vehicle = await window.API.createVehicle(vehicleData);
            console.log('✅ Veículo criado:', vehicle);
            
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
        const name = document.getElementById('vehicleName').value;
        const model = document.getElementById('vehicleModel').value;
        const year = parseInt(document.getElementById('vehicleYear').value);
        const plate = document.getElementById('vehiclePlate').value;
        const mileage = parseInt(document.getElementById('vehicleMileage').value);
        
        console.log('📝 Dados do formulário:', { name, model, year, plate, mileage });
        
        if (!name || !model || !year || !mileage) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        if (year < 1900 || year > new Date().getFullYear() + 1) {
            this.showNotification('Ano do veículo inválido.', 'error');
            return;
        }
        
        await this.addVehicle({
            name,
            model,
            year,
            plate,
            current_mileage: mileage
        });
        
        // Limpar formulário
        document.getElementById('vehicleForm').reset();
    }

    // Atualizar veículo
    static async updateVehicle(vehicleId, vehicleData) {
        try {
            console.log('🔄 Atualizando veículo:', vehicleId, vehicleData);
            const vehicle = await window.API.updateVehicle(vehicleId, vehicleData);
            const index = this.vehicles.findIndex(v => v.id === vehicleId);
            if (index !== -1) {
                this.vehicles[index] = vehicle;
            }
            
            if (this.currentVehicle && this.currentVehicle.id === vehicleId) {
                this.currentVehicle = vehicle;
                this.renderVehicleInfo();
            }
            
            this.showNotification('Informações salvas com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao atualizar veículo:', error);
            this.showNotification('Erro ao atualizar veículo: ' + error.message, 'error');
        }
    }

    // Excluir veículo
    static async deleteVehicle(vehicleId) {
        try {
            console.log('🗑️ Excluindo veículo:', vehicleId);
            await window.API.deleteVehicle(vehicleId);
            this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
            this.renderVehicles();
            
            if (this.vehicles.length > 0) {
                await this.selectVehicle(this.vehicles[0]);
            } else {
                this.currentVehicle = null;
                this.renderVehicleInfo();
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
        
        // Se for ID, encontrar o veículo
        if (typeof vehicle === 'string' || typeof vehicle === 'number') {
            vehicle = this.vehicles.find(v => v.id == vehicle);
            if (!vehicle) {
                console.error('❌ Veículo não encontrado:', vehicle);
                return;
            }
        }
        
        this.currentVehicle = vehicle;
        localStorage.setItem('currentVehicle', vehicle.id);
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

    // Carregar dados relacionados ao veículo
    static async loadVehicleRelatedData(vehicleId) {
        try {
            // Carregar serviços
            if (window.Services) {
                await window.Services.loadServices(vehicleId);
            }
            
            // Carregar estatísticas
            if (window.Stats) {
                await window.Stats.loadStatistics(vehicleId);
            }
            
            // Carregar e inicializar configurações
            await this.initializeVehicleConfig(vehicleId);
            
            // Atualizar alertas
            if (window.UI) {
                await window.UI.updateMaintenanceAlerts();
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do veículo:', error);
        }
    }

    // Inicializar configurações do veículo - VERSÃO SIMPLIFICADA
    static async initializeVehicleConfig(vehicleId) {
        try {
            console.log('🔧 Inicializando configurações para veículo:', vehicleId);
            
            // Verificar se já existem configurações
            let config = await window.API.getMaintenanceConfig(vehicleId);
            console.log('📋 Configurações existentes:', config);
            
            // Se não existir, criar padrão
            if (!config || Object.keys(config).length === 0) {
                console.log('🏗️ Criando configurações padrão...');
                const defaultConfig = {
                    "Troca de óleo": 5000,
                    "Troca de pneu": 10000,
                    "Ajuste de freios": 7000,
                    "Troca de correia": 15000,
                    "Revisão geral": 10000
                };
                
                await window.API.updateMaintenanceConfig(vehicleId, defaultConfig);
                config = defaultConfig;
                console.log('✅ Configurações criadas:', config);
            }
            
            // Atualizar configuração global
            if (window.APP_CONFIG) {
                window.APP_CONFIG.maintenanceIntervals = config;
            }
            
            // Renderizar na interface
            this.renderMaintenanceConfig();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar configurações:', error);
        }
    }

    // Renderizar configurações na interface - VERSÃO SIMPLIFICADA
    static renderMaintenanceConfig() {
        const configContainer = document.getElementById('maintenanceConfig');
        if (!configContainer) {
            console.log('⚠️ Elemento maintenanceConfig não encontrado');
            return;
        }
        
        const config = window.APP_CONFIG?.maintenanceIntervals || {};
        console.log('🎨 Renderizando configurações:', config);
        
        configContainer.innerHTML = '';
        
        Object.keys(config).forEach(type => {
            if (type === "Outro") return;
            
            const configItem = document.createElement('div');
            configItem.className = 'maintenance-config-item';
            configItem.innerHTML = `
                <label class="form-label">${type} (a cada quantos km?)</label>
                <div class="input-group mb-3">
                    <input type="number" class="form-control maintenance-interval" 
                           data-type="${type}" value="${config[type]}" min="0">
                    <span class="input-group-text">km</span>
                </div>
            `;
            configContainer.appendChild(configItem);
        });
        
        // Configurar evento de salvamento
        this.setupConfigSaveButton();
    }

    // Configurar botão de salvar configurações
    static setupConfigSaveButton() {
        const saveButton = document.getElementById('saveMaintenanceConfig');
        if (saveButton) {
            // Remover listeners antigos
            const newSaveButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
            
            // Adicionar novo listener
            newSaveButton.addEventListener('click', () => {
                this.saveMaintenanceConfig();
            });
        }
    }

    // Salvar configurações de manutenção - VERSÃO SIMPLIFICADA
    static async saveMaintenanceConfig() {
        if (!this.currentVehicle) {
            this.showNotification('Nenhum veículo selecionado.', 'error');
            return;
        }
        
        try {
            const inputs = document.querySelectorAll('.maintenance-interval');
            const newConfig = {};
            
            inputs.forEach(input => {
                const type = input.dataset.type;
                const value = parseInt(input.value) || 0;
                newConfig[type] = value;
            });
            
            console.log('💾 Salvando configurações:', newConfig);
            
            await window.API.updateMaintenanceConfig(this.currentVehicle.id, newConfig);
            
            // Atualizar configuração global
            if (window.APP_CONFIG) {
                window.APP_CONFIG.maintenanceIntervals = newConfig;
            }
            
            this.showNotification('Configurações salvas com sucesso!', 'success');
            
            // Atualizar alertas
            if (window.UI) {
                await window.UI.updateMaintenanceAlerts();
            }
            
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            this.showNotification('Erro ao salvar configurações: ' + error.message, 'error');
        }
    }

    // Renderizar lista de veículos
    static renderVehicles() {
        const vehiclesList = document.getElementById('vehiclesList');
        if (!vehiclesList) return;
        
        vehiclesList.innerHTML = '';
        
        this.vehicles.forEach(vehicle => {
            const isActive = this.currentVehicle && vehicle.id === this.currentVehicle.id;
            const vehicleElement = document.createElement('div');
            vehicleElement.className = `col-md-4 mb-3 vehicle-selector ${isActive ? 'active' : ''}`;
            
            vehicleElement.innerHTML = `
                <div class="card h-100 position-relative" onclick="Vehicles.selectVehicle(${vehicle.id})">
                    ${this.vehicles.length > 1 ? `
                    <div class="delete-vehicle-btn" onclick="event.stopPropagation(); Vehicles.showDeleteModal(${vehicle.id})">
                        <i class="fas fa-times"></i>
                    </div>` : ''}
                    <div class="card-body text-center">
                        <i class="fas fa-motorcycle fa-2x mb-2 text-primary"></i>
                        <h5 class="card-title">${vehicle.name}</h5>
                        <p class="card-text">${vehicle.model} - ${vehicle.year}</p>
                        <p class="card-text"><small class="text-muted">${this.formatNumber(vehicle.current_mileage)} km</small></p>
                    </div>
                </div>
            `;
            vehiclesList.appendChild(vehicleElement);
        });
        
        this.updateVehicleManagementList();
    }

    // Renderizar informações do veículo
    static renderVehicleInfo() {
        if (!this.currentVehicle) {
            const currentVehicleTitle = document.getElementById('currentVehicleTitle');
            if (currentVehicleTitle) {
                currentVehicleTitle.textContent = 'Nenhum veículo selecionado';
            }
            return;
        }
        
        const currentVehicleTitle = document.getElementById('currentVehicleTitle');
        const bikeModel = document.getElementById('bikeModel');
        const bikeYear = document.getElementById('bikeYear');
        const bikePlate = document.getElementById('bikePlate');
        const currentMileage = document.getElementById('currentMileage');
        
        if (currentVehicleTitle) currentVehicleTitle.textContent = this.currentVehicle.name;
        if (bikeModel) bikeModel.value = this.currentVehicle.model;
        if (bikeYear) bikeYear.value = this.currentVehicle.year;
        if (bikePlate) bikePlate.value = this.currentVehicle.plate || '';
        if (currentMileage) currentMileage.value = this.currentVehicle.current_mileage;
    }

    // Salvar informações do veículo
    static async saveBikeInfo() {
        if (!this.currentVehicle) {
            this.showNotification('Nenhum veículo selecionado.', 'error');
            return;
        }
        
        const vehicleData = {
            name: this.currentVehicle.name,
            model: document.getElementById('bikeModel').value,
            year: parseInt(document.getElementById('bikeYear').value),
            plate: document.getElementById('bikePlate').value,
            current_mileage: parseInt(document.getElementById('currentMileage').value)
        };
        
        await this.updateVehicle(this.currentVehicle.id, vehicleData);
    }

    // Mostrar modal de exclusão
    static showDeleteModal(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;
        
        const vehicleToDeleteName = document.getElementById('vehicleToDeleteName');
        if (vehicleToDeleteName) {
            vehicleToDeleteName.textContent = `${vehicle.name} (${vehicle.model} - ${vehicle.year})`;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('deleteVehicleModal'));
        modal.show();
        
        // Configurar botão de confirmação
        const confirmDeleteVehicleBtn = document.getElementById('confirmDeleteVehicleBtn');
        if (confirmDeleteVehicleBtn) {
            confirmDeleteVehicleBtn.onclick = () => {
                this.deleteVehicle(vehicleId);
                modal.hide();
            };
        }
    }

    // Atualizar lista de gerenciamento de veículos
    static updateVehicleManagementList() {
        const vehicleManagementList = document.getElementById('vehicleManagementList');
        if (!vehicleManagementList) return;
        
        vehicleManagementList.innerHTML = '';
        
        this.vehicles.forEach(vehicle => {
            const vehicleElement = document.createElement('div');
            vehicleElement.className = 'list-group-item d-flex justify-content-between align-items-center';
            vehicleElement.innerHTML = `
                <div>
                    <h6 class="mb-1">${vehicle.name}</h6>
                    <p class="mb-1">${vehicle.model} - ${vehicle.year}</p>
                    <small>${this.formatNumber(vehicle.current_mileage)} km</small>
                </div>
                <button class="btn btn-outline-danger btn-sm" onclick="Vehicles.showDeleteModal(${vehicle.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            vehicleManagementList.appendChild(vehicleElement);
        });
    }

    // Resetar histórico do veículo
    static async resetVehicleHistory() {
        if (!this.currentVehicle) {
            this.showNotification('Nenhum veículo selecionado.', 'error');
            return;
        }
        
        try {
            const services = await window.API.getServices(this.currentVehicle.id);
            console.log('🗑️ Excluindo serviços:', services);
            
            for (const service of services) {
                await window.API.deleteService(service.id);
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

    // Utilitários
    static formatNumber(number) {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('pt-BR').format(number);
    }

    static showNotification(message, type = 'info') {
        alert(`${type.toUpperCase()}: ${message}`);
    }

    static hideModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    }
}

// Inicialização simplificada
console.log('🚗 Vehicles carregado - VERSÃO CORRIGIDA (NÃO-BLOQUEANTE)');

// Tornar global
window.Vehicles = Vehicles;