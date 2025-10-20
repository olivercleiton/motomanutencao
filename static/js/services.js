// services.js - VERSÃO COMPLETAMENTE CORRIGIDA
class Services {
    static services = [];

    static initialize() {
        if (!Array.isArray(this.services)) {
            this.services = [];
        }
    }

    static async loadServices(vehicleId) {
        try {
            console.log('🔧 Carregando serviços para veículo:', vehicleId);
            const response = await window.API.getServices(vehicleId);
            
            // ✅ CORREÇÃO: Tratamento robusto da resposta
            if (Array.isArray(response)) {
                this.services = response;
            } else if (response && Array.isArray(response.services)) {
                this.services = response.services;
            } else if (response && response.success && Array.isArray(response.services)) {
                this.services = response.services;
            } else {
                console.warn('⚠️ Formato de resposta inesperado para serviços:', response);
                this.services = [];
            }
            
            console.log('✅ Serviços carregados:', this.services);
            this.updateServicesList();
            
        } catch (error) {
            console.error('❌ Erro ao carregar serviços:', error);
            this.services = [];
            this.updateServicesList();
        }
    }

    static updateServicesList() {
        const servicesList = document.getElementById('servicesList');
        if (!servicesList) return;

        // ✅ CORREÇÃO: Garantir que é array
        if (!Array.isArray(this.services)) {
            this.services = [];
        }

        servicesList.innerHTML = '';

        if (this.services.length === 0) {
            servicesList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-tools fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Nenhum serviço registrado ainda.</p>
                </div>
            `;
            return;
        }

        // ✅ CORREÇÃO: Filter seguro
        const validServices = this.services.filter(service => 
            service && typeof service === 'object'
        );
        
        const sortedServices = validServices.sort((a, b) => 
            new Date(b.date || 0) - new Date(a.date || 0)
        );

        sortedServices.forEach(service => {
            const serviceElement = document.createElement('div');
            serviceElement.className = 'col-md-6 mb-3';
            serviceElement.innerHTML = `
                <div class="card service-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${service.type || service.service_type || 'Serviço'}</h6>
                            <span class="badge bg-primary">${service.date || 'N/D'}</span>
                        </div>
                        <p class="card-text small text-muted">${service.description || 'Sem descrição'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-primary">${this.formatNumber(service.mileage || 0)} km</span>
                            <span class="fw-bold">R$ ${this.formatNumber(service.cost || 0)}</span>
                        </div>
                    </div>
                </div>
            `;
            servicesList.appendChild(serviceElement);
        });
    }

    static formatNumber(number) {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('pt-BR').format(number);
    }
}

console.log('✅ Services carregado - VERSÃO COMPLETA');
Services.initialize();
window.Services = Services;