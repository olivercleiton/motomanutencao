// stats.js - VERSÃO COMPLETAMENTE CORRIGIDA
class Stats {
    static async loadStatistics(vehicleId) {
        try {
            console.log('📊 Carregando estatísticas para veículo:', vehicleId);
            const response = await window.API.getVehicleStats(vehicleId);
            
            // ✅ CORREÇÃO: Tratamento robusto da resposta
            let stats = {};
            
            if (response && typeof response === 'object') {
                if (response.stats) {
                    stats = response.stats;
                } else if (response.total_services !== undefined) {
                    stats = response; // Já é o objeto de stats
                }
            }
            
            console.log('✅ Estatísticas carregadas:', stats);
            this.updateStatistics(stats);
            
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            this.updateStatistics({
                total_services: 0,
                total_spent: 0,
                last_service_mileage: 0,
                next_service_estimate: 0,
                services_by_type: {}
            });
        }
    }

    static updateStatistics(stats = {}) {
        // ✅ CORREÇÃO: Valores padrão robustos
        const safeStats = {
            total_services: parseInt(stats.total_services) || 0,
            total_spent: parseFloat(stats.total_spent) || 0,
            last_service_mileage: parseInt(stats.last_service_mileage) || 0,
            next_service_estimate: parseInt(stats.next_service_estimate) || 0,
            services_by_type: stats.services_by_type || {}
        };

        const totalServicesElement = document.getElementById('totalServices');
        const totalSpentElement = document.getElementById('totalSpent');
        const lastServiceElement = document.getElementById('lastService');
        const nextServiceElement = document.getElementById('nextService');

        if (totalServicesElement) {
            totalServicesElement.textContent = safeStats.total_services;
        }
        
        if (totalSpentElement) {
            // ✅ CORREÇÃO: toFixed() seguro
            totalSpentElement.textContent = `R$ ${safeStats.total_spent.toFixed(2)}`;
        }
        
        if (lastServiceElement) {
            lastServiceElement.textContent = `${this.formatNumber(safeStats.last_service_mileage)} km`;
        }
        
        if (nextServiceElement) {
            nextServiceElement.textContent = `${this.formatNumber(safeStats.next_service_estimate)} km`;
        }

        this.updateServicesChart(safeStats.services_by_type);
    }

    static updateServicesChart(servicesByType = {}) {
        // Implementação do gráfico (manter existente)
        const ctx = document.getElementById('servicesChart');
        if (!ctx) return;

        const labels = Object.keys(servicesByType);
        const data = Object.values(servicesByType);
        
        // ... código do gráfico existente
    }

    static formatNumber(number) {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('pt-BR').format(number);
    }
}

console.log('✅ Stats carregado - VERSÃO CORRIGIDA');
window.Stats = Stats;
