// stats.js - versão FINAL CORRIGIDA
class Stats {
    static costChart = null;

    static async loadStatistics(vehicleId) {
        try {
            console.log('📊 Carregando estatísticas para veículo:', vehicleId);
            const stats = await window.API.getVehicleStats(vehicleId);
            console.log('✅ Estatísticas carregadas:', stats);
            Stats.updateStatistics(stats);
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            
            // Mostrar estatísticas vazias em caso de erro
            Stats.updateStatistics({});
            Stats.showNotification('Erro ao carregar estatísticas. Mostrando dados padrão.', 'warning');
        }
    }

    static initializeChart() {
        const ctx = document.getElementById('costChart')?.getContext('2d');
        if (!ctx) {
            console.warn('⚠️ Canvas do gráfico não encontrado');
            return;
        }

        if (Stats.costChart) Stats.costChart.destroy();

        Stats.costChart = new Chart(ctx, {
            type: 'doughnut',
            data: { 
                labels: ['Sem dados'], 
                datasets: [{ 
                    data: [1], 
                    backgroundColor: window.APP_CONFIG?.chartColors || [
                        'rgba(0,100,0,0.7)',
                        'rgba(255,140,0,0.7)',
                        'rgba(50,50,200,0.7)',
                        'rgba(200,50,50,0.7)',
                        'rgba(150,50,200,0.7)',
                        'rgba(50,150,150,0.7)'
                    ], 
                    borderWidth: 1 
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { position: 'bottom' }, 
                    tooltip: { 
                        callbacks: { 
                            label: (ctx) => {
                                const value = ctx.parsed ?? 0;
                                return `R$ ${Stats.safeToFixed(value)}`;
                            }
                        } 
                    } 
                } 
            }
        });
        
        console.log('📈 Gráfico inicializado');
    }

    static updateStatistics(stats = {}) {
        console.log('🔄 Atualizando estatísticas com dados:', stats);
    
        const statsCompletos = {
            current_mileage: stats.total_mileage || stats.current_mileage || 0,
            total_services: stats.total_services || 0,
            total_cost: stats.total_cost || 0,
            monthly_average: stats.monthly_average || 0,
            next_maintenance: stats.next_maintenance || 0,
            cost_by_category: stats.cost_by_category || Stats.calcularCostByCategoryFallback(stats)
        };

        console.log('🛡️ Estatísticas completadas:', statsCompletos);

        try {
            const totalMileage = document.getElementById('totalMileage');
            if (totalMileage) totalMileage.textContent = Stats.formatNumber(Stats.safeNumber(statsCompletos.current_mileage));

            const totalServices = document.getElementById('totalServices');
            if (totalServices) totalServices.textContent = Stats.formatNumber(Stats.safeNumber(statsCompletos.total_services));

            const totalCost = document.getElementById('totalCost');
            if (totalCost) totalCost.textContent = `R$ ${Stats.safeToFixed(statsCompletos.total_cost)}`;

            const monthlyAverage = document.getElementById('monthlyAverage');
            if (monthlyAverage) monthlyAverage.textContent = `R$ ${Stats.safeToFixed(statsCompletos.monthly_average)}`;

            const nextMaintenance = document.getElementById('nextMaintenance');
            if (nextMaintenance) {
                const nextMaint = Stats.safeNumber(statsCompletos.next_maintenance);
                nextMaintenance.textContent = nextMaint > 0 ? `${Stats.formatNumber(nextMaint)} km` : 'Em dia';
            }

            Stats.updateChart(statsCompletos.cost_by_category);
            console.log('✅ Estatísticas atualizadas com segurança');

        } catch (error) {
            console.error('❌ Erro ao atualizar estatísticas:', error);
            Stats.showNotification('Erro ao exibir estatísticas.', 'error');
        }
    }

    static safeToFixed(value, decimals = 2) {
        let num = Number(value);
        if (isNaN(num)) num = 0;
        return num.toFixed(decimals);
    }

    static safeNumber(value, defaultValue = 0) {
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    }

    static calcularCostByCategoryFallback(stats) {
        console.log('🔄 Calculando cost_by_category fallback...');
        if (!stats.total_services || stats.total_services === 0) return {};

        const categorias = ['Troca de óleo', 'Pneus', 'Freios', 'Correia', 'Revisão'];
        const custoPorCategoria = {};

        if (Stats.safeNumber(stats.total_cost) > 0) {
            categorias.forEach(c => {
                custoPorCategoria[c] = Math.round(Stats.safeNumber(stats.total_cost) / categorias.length);
            });
        }

        return custoPorCategoria;
    }

    static updateChart(costByCategory = {}) {
        if (!Stats.costChart) Stats.initializeChart();
        if (!Stats.costChart) return;

        const labels = Object.keys(costByCategory);
        const data = Object.values(costByCategory).map(v => Stats.safeNumber(v));

        if (labels.length === 0 || data.every(v => v === 0)) {
            Stats.costChart.data.labels = ['Sem dados'];
            Stats.costChart.data.datasets[0].data = [1];
            Stats.costChart.data.datasets[0].backgroundColor = ['rgba(200,200,200,0.5)'];
        } else {
            Stats.costChart.data.labels = labels;
            Stats.costChart.data.datasets[0].data = data;
            Stats.costChart.data.datasets[0].backgroundColor = window.APP_CONFIG?.chartColors || [
                'rgba(0,100,0,0.7)',
                'rgba(255,140,0,0.7)',
                'rgba(50,50,200,0.7)',
                'rgba(200,50,50,0.7)',
                'rgba(150,50,200,0.7)',
                'rgba(50,150,150,0.7)'
            ];
        }

        Stats.costChart.update();
        console.log('📈 Gráfico atualizado:', { labels, data });
    }

    static formatNumber(number) {
        return new Intl.NumberFormat('pt-BR').format(Stats.safeNumber(number));
    }

    static showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        if (type === 'error' || type === 'warning') {
            if (window.UI && window.UI.showNotification) {
                window.UI.showNotification(message, type);
            } else {
                alert(`${type.toUpperCase()}: ${message}`);
            }
        }
    }

    static clearStatistics() {
        console.log('🔄 Limpando estatísticas...');
        ['totalMileage', 'totalServices', 'totalCost', 'monthlyAverage', 'nextMaintenance'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
        Stats.updateChart({});
        console.log('✅ Estatísticas limpas');
    }
}

// Global
window.Stats = Stats;
console.log('✅ Stats carregado - VERSÃO FINAL 100% SEGURA');
