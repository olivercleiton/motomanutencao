// Gerenciamento de serviços e manutenções - VERSÃO COMPLETA
class Services {
    static services = [];

    // Carregar serviços do veículo
    static async loadServices(vehicleId) {
        try {
            console.log('🔧 Carregando serviços para veículo:', vehicleId);
            this.services = await window.API.getServices(vehicleId);
            console.log('✅ Serviços carregados:', this.services);
            this.updateServicesList();
            this.updateRecentServices();
        } catch (error) {
            console.error('❌ Erro ao carregar serviços:', error);
            this.showNotification('Erro ao carregar serviços: ' + error.message, 'error');
        }
    }

    // Adicionar novo serviço
    static async addService(serviceData) {
        try {
            console.log('🔧 Adicionando serviço:', serviceData);
            const currentVehicle = window.Vehicles?.currentVehicle;
            if (!currentVehicle) {
                throw new Error('Nenhum veículo selecionado');
            }

            const newService = await window.API.createService(currentVehicle.id, serviceData);
            console.log('✅ Serviço criado:', newService);
            
            this.services.push(newService);
            this.updateServicesList();
            this.updateRecentServices();
            
            // Atualizar a quilometragem atual se for maior que a atual
            if (currentVehicle && serviceData.mileage > currentVehicle.current_mileage) {
                await window.Vehicles.updateVehicle(currentVehicle.id, {
                    current_mileage: serviceData.mileage
                });
            }
            
            // Atualizar alertas e estatísticas
            if (window.UI) {
                window.UI.updateMaintenanceAlerts();
            }
            if (window.Stats) {
                await window.Stats.loadStatistics(currentVehicle.id);
            }
            
            this.showNotification('Serviço registrado com sucesso!', 'success');
            return newService;
            
        } catch (error) {
            console.error('❌ Erro ao adicionar serviço:', error);
            this.showNotification('Erro ao adicionar serviço: ' + error.message, 'error');
        }
    }

    // Processar adição de serviço via formulário principal
    static async handleAddService() {
        const type = document.getElementById('serviceType').value;
        const date = document.getElementById('serviceDate').value;
        const mileage = parseInt(document.getElementById('serviceMileage').value);
        const cost = parseFloat(document.getElementById('serviceCost').value) || 0;
        const notes = document.getElementById('serviceNotes').value;
        
        if (!type || !date || !mileage) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        await this.addService({
            service_type: type,
            date: date,
            mileage: mileage,
            cost: cost,
            notes: notes
        });
        
        // Limpar formulário
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceDate').value = this.getTodayDate();
    }

    // Processar adição de serviço via modal mobile
    static async handleAddServiceMobile() {
        const type = document.getElementById('mobileServiceType').value;
        const date = document.getElementById('mobileServiceDate').value;
        const mileage = parseInt(document.getElementById('mobileServiceMileage').value);
        const cost = parseFloat(document.getElementById('mobileServiceCost').value) || 0;
        
        if (!type || !date || !mileage) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        await this.addService({
            service_type: type,
            date: date,
            mileage: mileage,
            cost: cost,
            notes: ''
        });
        
        // Fechar modal
        this.hideModal('addServiceModal');
        
        // Limpar formulário
        document.getElementById('mobileServiceForm').reset();
        document.getElementById('mobileServiceDate').value = this.getTodayDate();
    }

    // Atualizar lista de serviços
    static updateServicesList() {
        const servicesList = document.getElementById('servicesList');
        if (!servicesList) return;
        
        servicesList.innerHTML = '';
        
        const searchTerm = document.getElementById('serviceSearch')?.value.toLowerCase() || '';
        const filteredServices = this.services.filter(s => 
            s.service_type.toLowerCase().includes(searchTerm) || 
            (s.notes && s.notes.toLowerCase().includes(searchTerm))
        );
        
        if (filteredServices.length === 0) {
            servicesList.innerHTML = '<p class="text-center text-muted">Nenhum serviço encontrado.</p>';
            return;
        }
        
        // Ordenar por data (mais recente primeiro)
        filteredServices.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        filteredServices.forEach(service => {
            const serviceElement = document.createElement('div');
            serviceElement.className = 'list-group-item service-item';
            serviceElement.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${service.service_type}</h6>
                    <small>${this.formatDate(service.date)}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="mb-1">${this.formatNumber(service.mileage)} km</p>
                        ${service.notes ? `<small class="text-muted">${service.notes}</small>` : ''}
                    </div>
                    <div>
                        <span class="badge bg-primary rounded-pill">R$ ${service.cost.toFixed(2)}</span>
                    </div>
                </div>
            `;
            servicesList.appendChild(serviceElement);
        });
    }

    // Atualizar serviços recentes
    static updateRecentServices() {
        const recentServices = document.getElementById('recentServices');
        if (!recentServices) return;
        
        recentServices.innerHTML = '';
        
        // Ordenar por data (mais recente primeiro) e pegar os 3 primeiros
        const recent = this.services.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
        
        if (recent.length === 0) {
            recentServices.innerHTML = '<p class="text-center text-muted">Nenhum serviço registrado ainda.</p>';
            return;
        }
        
        recent.forEach(service => {
            const serviceElement = document.createElement('div');
            serviceElement.className = 'mb-2 p-2 border rounded';
            serviceElement.innerHTML = `
                <div class="d-flex justify-content-between">
                    <strong>${service.service_type}</strong>
                    <span class="badge bg-primary">${this.formatNumber(service.mileage)} km</span>
                </div>
                <div class="d-flex justify-content-between text-muted">
                    <small>${this.formatDate(service.date)}</small>
                    <small>R$ ${service.cost.toFixed(2)}</small>
                </div>
            `;
            recentServices.appendChild(serviceElement);
        });
    }

    // Adicionar serviço rapidamente a partir de alerta
    static quickAddService(type) {
        // Preencher o formulário de serviço com o tipo selecionado
        const serviceType = document.getElementById('serviceType');
        const mobileServiceType = document.getElementById('mobileServiceType');
        
        if (serviceType) serviceType.value = type;
        if (mobileServiceType) mobileServiceType.value = type;
        
        // Preencher a quilometragem atual
        const currentVehicle = window.Vehicles?.currentVehicle;
        if (currentVehicle) {
            const serviceMileage = document.getElementById('serviceMileage');
            const mobileServiceMileage = document.getElementById('mobileServiceMileage');
            
            if (serviceMileage) serviceMileage.value = currentVehicle.current_mileage;
            if (mobileServiceMileage) mobileServiceMileage.value = currentVehicle.current_mileage;
        }
        
        // Focar no campo de custo
        const serviceCost = document.getElementById('serviceCost');
        if (serviceCost) serviceCost.focus();
        
        // Alternar para a aba de serviços
        if (window.UI) {
            window.UI.switchTab('services');
        }
    }

    // Utilitários
    static formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    static formatNumber(number) {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('pt-BR').format(number);
    }

    static getTodayDate() {
        return new Date().toISOString().split('T')[0];
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

// Tornar global
window.Services = Services;
console.log('✅ Services carregado - VERSÃO COMPLETA');