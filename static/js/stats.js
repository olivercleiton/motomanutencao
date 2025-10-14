// stats.js - versão CORRIGIDA com tratamento de dados undefined
class Stats {
    static costChart = null;

    static async loadStatistics(vehicleId) {
        try {
            console.log('📊 Carregando estatísticas para veículo:', vehicleId);
            const stats = await window.API.getVehicleStats(vehicleId);
            console.log('✅ Estatísticas carregadas:', stats);
            this.updateStatistics(stats);
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            
            // ✅ NOVO: Mostrar estatísticas vazias em caso de erro
            this.updateStatistics({});
            this.showNotification('Erro ao carregar estatísticas. Mostrando dados padrão.', 'warning');
        }
    }

    static initializeChart() {
        const ctx = document.getElementById('costChart')?.getContext('2d');
        if (!ctx) {
            console.warn('⚠️ Canvas do gráfico não encontrado');
            return;
        }

        this.costChart = new Chart(ctx, {
            type: 'doughnut',
            data: { 
                labels: [], 
                datasets: [{ 
                    data: [], 
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
                            label: ctx => `R$ ${((ctx.parsed ?? 0) || 0).toFixed(2)}` 
                        } 
                    } 
                } 
            }
        });
        
        console.log('📈 Gráfico inicializado');
    }

    static updateStatistics(stats = {}) {
        console.log('🔄 Atualizando estatísticas com dados:', stats);
        
        // ✅ CORRIGIDO: Função segura para formatar números
        const safeNumber = (value, defaultValue = 0) => {
            if (value === undefined || value === null || isNaN(value)) {
                return defaultValue;
            }
            return Number(value);
        };

        const safeToFixed = (value, decimals = 2, defaultValue = '0') => {
            const num = safeNumber(value, 0);
            return num.toFixed(decimals);
        };

        // ✅ CORRIGIDO: Atualizar elementos com valores seguros
        const totalMileage = document.getElementById('totalMileage');
        if (totalMileage) {
            totalMileage.textContent = this.formatNumber(safeNumber(stats.current_mileage));
        }

        const totalServices = document.getElementById('totalServices');
        if (totalServices) {
            totalServices.textContent = this.formatNumber(safeNumber(stats.total_services));
        }

        const totalCost = document.getElementById('totalCost');
        if (totalCost) {
            totalCost.textContent = `R$ ${safeToFixed(stats.total_cost)}`;
        }

        const monthlyAverage = document.getElementById('monthlyAverage');
        if (monthlyAverage) {
            monthlyAverage.textContent = `R$ ${safeToFixed(stats.monthly_average)}`;
        }

        const nextMaintenance = document.getElementById('nextMaintenance');
        if (nextMaintenance) {
            const nextMaint = safeNumber(stats.next_maintenance);
            nextMaintenance.textContent = nextMaint > 0 ? 
                `${this.formatNumber(nextMaint)} km` : 'Em dia';
        }

        // ✅ CORRIGIDO: Gráfico com dados seguros
        this.updateChart(stats.cost_by_category || {});
        
        console.log('✅ Estatísticas atualizadas com segurança');
    }

    static updateChart(costByCategory = {}) {
        if (!this.costChart) {
            this.initializeChart();
        }
        if (!this.costChart) {
            console.error('❌ Não foi possível inicializar o gráfico');
            return;
        }

        // ✅ CORRIGIDO: Garantir que temos arrays válidos
        const labels = Object.keys(costByCategory);
        const data = Object.values(costByCategory).map(value => safeNumber(value, 0));

        // ✅ CORRIGIDO: Se não houver dados, mostrar mensagem
        if (labels.length === 0 || data.every(val => val === 0)) {
            labels.push('Sem dados');
            data.push(1);
            console.log('📊 Gráfico: Mostrando dados padrão (sem dados reais)');
        }

        this.costChart.data.labels = labels;
        this.costChart.data.datasets[0].data = data;
        this.costChart.update();
        
        console.log('📈 Gráfico atualizado:', { labels, data });
    }

    // ✅ CORRIGIDO: Função auxiliar para números seguros
    static formatNumber(number) {
        const num = Number(number);
        if (isNaN(num) || !isFinite(num)) {
            return '0';
        }
        return new Intl.NumberFormat('pt-BR').format(num);
    }

    static showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        // Melhorar para notificação não intrusiva no futuro
        if (type === 'error' || type === 'warning') {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// ✅ Função auxiliar global para números seguros
function safeNumber(value, defaultValue = 0) {
    if (value === undefined || value === null || isNaN(value)) {
        return defaultValue;
    }
    return Number(value);
}

// Global
window.Stats = Stats;
console.log('✅ Stats carregado - VERSÃO CORRIGIDA COM SEGURANÇA');