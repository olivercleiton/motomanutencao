// stats.js - VERSÃO COMPLETAMENTE CORRIGIDA
class Stats {
    static async loadStatistics(vehicleId) {
    try {
        console.log('📊 Estatísticas desabilitadas temporariamente');
        // ⚠️ COMENTE ESTA LINHA:
        // this.updateStatistics(stats);
        return;
    } catch (error) {
        console.error('❌ Erro em loadStatistics:', error);
    }
}
            
            console.log('✅ Estatísticas carregadas:', stats);
            this.updateStatistics(stats);
            
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            // ✅ Valores padrão explícitos e seguros
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
        // ✅ CORREÇÃO: Conversão segura para números
        const safeStats = {
            total_services: this.safeParseInt(stats.total_services),
            total_spent: this.safeParseFloat(stats.total_spent),
            last_service_mileage: this.safeParseInt(stats.last_service_mileage),
            next_service_estimate: this.safeParseInt(stats.next_service_estimate),
            services_by_type: stats.services_by_type || {}
        };

        console.log('📊 Estatísticas seguras:', safeStats);

        const totalServicesElement = document.getElementById('totalServices');
        const totalSpentElement = document.getElementById('totalSpent');
        const lastServiceElement = document.getElementById('lastService');
        const nextServiceElement = document.getElementById('nextService');

        // ✅ CORREÇÃO: Atualização segura dos elementos
        if (totalServicesElement) {
            totalServicesElement.textContent = safeStats.total_services.toString();
        }
        
        if (totalSpentElement) {
            // ✅ CORREÇÃO DEFINITIVA: toFixed() completamente seguro
            const totalSpent = Number(safeStats.total_spent) || 0;
            totalSpentElement.textContent = `R$ ${totalSpent.toFixed(2)}`;
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
        const ctx = document.getElementById('servicesChart');
        if (!ctx) {
            console.log('⏭️ Gráfico não encontrado, pulando...');
            return;
        }

        try {
            const labels = Object.keys(servicesByType);
            const data = Object.values(servicesByType).map(val => this.safeParseInt(val));
            
            // Se não há dados válidos, não renderiza o gráfico
            if (data.length === 0 || data.every(val => val === 0)) {
                console.log('⏭️ Sem dados para o gráfico');
                return;
            }

            // Destruir gráfico existente se houver
            if (window.servicesChartInstance) {
                window.servicesChartInstance.destroy();
            }

            // Criar novo gráfico
            window.servicesChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    return `${label}: ${value} serviço${value !== 1 ? 's' : ''}`;
                                }
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('❌ Erro ao criar gráfico:', error);
        }
    }

    // ✅ Método seguro para parse de inteiros
    static safeParseInt(value) {
        if (value === null || value === undefined || value === '') {
            return 0;
        }
        const parsed = parseInt(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    // ✅ Método seguro para parse de floats
    static safeParseFloat(value) {
        if (value === null || value === undefined || value === '') {
            return 0;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }

    static formatNumber(number) {
        const safeNumber = this.safeParseInt(number);
        return new Intl.NumberFormat('pt-BR').format(safeNumber);
    }

    // ✅ Método para limpar gráfico
    static clearChart() {
        if (window.servicesChartInstance) {
            window.servicesChartInstance.destroy();
            window.servicesChartInstance = null;
        }
    }
}

console.log('✅ Stats carregado - VERSÃO COMPLETAMENTE CORRIGIDA');
window.Stats = Stats;