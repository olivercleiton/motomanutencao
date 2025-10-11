// Gerenciamento de estatísticas e gráficos - VERSÃO CORRIGIDA
class Stats {
    static costChart = null;

    // Carregar estatísticas do veículo
    static async loadStatistics(vehicleId) {
        try {
            console.log('📊 Carregando estatísticas para veículo:', vehicleId);
            const stats = await window.API.getVehicleStats(vehicleId);
            console.log('✅ Estatísticas carregadas:', stats);
            this.updateStatistics(stats);
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            this.showNotification('Erro ao carregar estatísticas: ' + error.message, 'error');
        }
    }

    // Inicializar gráfico
    static initializeChart() {
        const ctx = document.getElementById('costChart')?.getContext('2d');
        if (!ctx) return;
        
        this.costChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: window.APP_CONFIG?.chartColors || [
                        'rgba(0, 100, 0, 0.7)',
                        'rgba(255, 140, 0, 0.7)',
                        'rgba(50, 50, 200, 0.7)',
                        'rgba(200, 50, 50, 0.7)',
                        'rgba(150, 50, 200, 0.7)',
                        'rgba(50, 150, 150, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `R$ ${context.parsed.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Atualizar estatísticas
    static updateStatistics(stats) {
        // Quilometragem total
        const totalMileage = document.getElementById('totalMileage');
        if (totalMileage) totalMileage.textContent = this.formatNumber(stats.current_mileage);
        
        // Total de serviços
        const totalServices = document.getElementById('totalServices');
        if (totalServices) totalServices.textContent = this.formatNumber(stats.total_services);
        
        // Custo total
        const totalCost = document.getElementById('totalCost');
        if (totalCost) totalCost.textContent = `R$ ${stats.total_cost.toFixed(2)}`;
        
        // Média mensal
        const monthlyAverage = document.getElementById('monthlyAverage');
        if (monthlyAverage) monthlyAverage.textContent = `R$ ${stats.monthly_average.toFixed(2)}`;
        
        // Próxima revisão
        const nextMaintenance = document.getElementById('nextMaintenance');
        if (nextMaintenance) {
            nextMaintenance.textContent = stats.next_maintenance > 0 ? 
                `${this.formatNumber(stats.next_maintenance)} km` : 'Em dia';
        }
        
        // Atualizar gráfico
        this.updateChart(stats.cost_by_category);
    }

    // Atualizar gráfico
    static updateChart(costByCategory) {
        if (!this.costChart) {
            this.initializeChart();
        }
        if (!this.costChart) return;
        
        // Atualizar dados do gráfico
        this.costChart.data.labels = Object.keys(costByCategory);
        this.costChart.data.datasets[0].data = Object.values(costByCategory);
        this.costChart.update();
    }

    // Salvar configurações de manutenção - CORRIGIDO
    static async saveMaintenanceConfig() {
        try {
            const currentVehicle = window.Vehicles?.currentVehicle;
            if (!currentVehicle) {
                this.showNotification('Nenhum veículo selecionado.', 'error');
                return;
            }

            const maintenanceConfig = {};
            Object.keys(window.APP_CONFIG?.maintenanceIntervals || {}).forEach(type => {
                if (type === "Outro") return;
                
                const input = document.getElementById(`config-${type}`);
                if (input) {
                    maintenanceConfig[type] = parseInt(input.value) || 0;
                }
            });
            
            await window.API.updateMaintenanceConfig(currentVehicle.id, maintenanceConfig);
            
            this.showNotification('Configurações salvas com sucesso!', 'success');
            
            // Atualizar alertas
            if (window.UI) {
                window.UI.updateMaintenanceAlerts();
            }
            
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            this.showNotification('Erro ao salvar configurações: ' + error.message, 'error');
        }
    }

    // Carregar configurações de manutenção - NOVA FUNÇÃO
    static async loadMaintenanceConfig(vehicleId) {
        try {
            console.log('⚙️ Carregando configurações para veículo:', vehicleId);
            const config = await window.API.getMaintenanceConfig(vehicleId);
            console.log('✅ Configurações carregadas:', config);
            
            // Atualizar APP_CONFIG com as configurações do servidor
            if (window.APP_CONFIG) {
                window.APP_CONFIG.maintenanceIntervals = {
                    ...window.APP_CONFIG.maintenanceIntervals,
                    ...config
                };
            }
            
            // Atualizar interface
            this.updateMaintenanceConfig();
            
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            // Usar configurações padrão se não conseguir carregar
            this.updateMaintenanceConfig();
        }
    }

    // Atualizar configurações de manutenção na interface - CORRIGIDO
    static updateMaintenanceConfig() {
        const maintenanceConfigElement = document.getElementById('maintenanceConfig');
        if (!maintenanceConfigElement) return;
        
        maintenanceConfigElement.innerHTML = '';
        
        const maintenanceConfig = window.APP_CONFIG?.maintenanceIntervals || {};
        
        Object.keys(maintenanceConfig).forEach(type => {
            if (type === "Outro") return;
            
            const interval = maintenanceConfig[type];
            
            const configElement = document.createElement('div');
            configElement.className = 'maintenance-config-item';
            configElement.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <label class="form-label">${type}</label>
                    </div>
                    <div class="col-md-6">
                        <div class="input-group">
                            <input type="number" class="form-control" id="config-${type}" value="${interval}" min="0" step="100">
                            <span class="input-group-text">km</span>
                        </div>
                    </div>
                </div>
            `;
            maintenanceConfigElement.appendChild(configElement);
        });
    }

    // Utilitários
    static formatNumber(number) {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('pt-BR').format(number);
    }

    static showNotification(message, type = 'info') {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Tornar global
window.Stats = Stats;
console.log('✅ Stats carregado - VERSÃO CORRIGIDA');