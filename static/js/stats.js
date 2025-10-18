// stats.js - VERSÃO FINAL SEGURA E COMENTADA
class Stats {
    // 🟢 Referência global para o gráfico de custos
    static costChart = null;

    // 📊 Carrega estatísticas de um veículo específico
    static async loadStatistics(vehicleId) {
        try {
            console.log('📊 Carregando estatísticas para veículo:', vehicleId);

            // 🔹 Chamada segura à API
            const stats = await window.API.getVehicleStats(vehicleId);

            // ⚠️ Verifica se a resposta é válida
            if (!stats || typeof stats !== 'object') {
                console.warn('⚠ Dados inválidos recebidos do backend, usando padrão.');
                this.updateStatistics({});
            } else {
                this.updateStatistics(stats);
            }

        } catch (error) {
            // ❌ Caso a requisição falhe, mostra dados padrão
            console.error('❌ Erro ao carregar estatísticas:', error);
            this.updateStatistics({});
            this.showNotification('Erro ao carregar estatísticas. Mostrando dados padrão.', 'warning');
        }
    }

    // 🎨 Inicializa o gráfico de custos
    static initializeChart() {
        const ctx = document.getElementById('costChart')?.getContext('2d');
        if (!ctx) {
            console.warn('⚠️ Canvas do gráfico não encontrado');
            return;
        }

        // 🔄 Destrói gráfico antigo, se existir
        if (this.costChart) this.costChart.destroy();

        // 🟢 Cria novo gráfico
        this.costChart = new Chart(ctx, {
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
                                // 🔒 Use safeToFixed para evitar erro de undefined
                                return `R$ ${this.safeToFixed(value)}`;
                            }
                        } 
                    } 
                } 
            }
        });
        console.log('📈 Gráfico inicializado');
    }

    // 🔄 Atualiza a página com os dados recebidos
    static updateStatistics(stats = {}) {
        console.log('🔄 Atualizando estatísticas com dados:', stats);

        // ✅ Garante que todos os campos numéricos têm valores válidos
        const statsCompletos = {
            current_mileage: Number(stats.total_mileage || stats.current_mileage) || 0,
            total_services: Number(stats.total_services) || 0,
            total_cost: Number(stats.total_cost) || 0,
            monthly_average: Number(stats.monthly_average) || 0,
            next_maintenance: Number(stats.next_maintenance) || 0,
            cost_by_category: stats.cost_by_category || this.calcularCostByCategoryFallback(stats)
        };

        console.log('🛡️ Estatísticas completadas:', statsCompletos);

        try {
            // ⚡ Atualiza DOM com valores seguros
            const totalMileage = document.getElementById('totalMileage');
            if (totalMileage) totalMileage.textContent = this.formatNumber(statsCompletos.current_mileage);

            const totalServices = document.getElementById('totalServices');
            if (totalServices) totalServices.textContent = this.formatNumber(statsCompletos.total_services);

            const totalCost = document.getElementById('totalCost');
            if (totalCost) totalCost.textContent = `R$ ${this.safeToFixed(statsCompletos.total_cost)}`;

            const monthlyAverage = document.getElementById('monthlyAverage');
            if (monthlyAverage) monthlyAverage.textContent = `R$ ${this.safeToFixed(statsCompletos.monthly_average)}`;

            const nextMaintenance = document.getElementById('nextMaintenance');
            if (nextMaintenance) {
                const nextMaint = statsCompletos.next_maintenance;
                nextMaintenance.textContent = nextMaint > 0 ? `${this.formatNumber(nextMaint)} km` : 'Em dia';
            }

            // 🟢 Atualiza gráfico com segurança
            this.updateChart(statsCompletos.cost_by_category);
            console.log('✅ Estatísticas atualizadas com segurança');

        } catch (error) {
            // ❌ Captura qualquer erro de renderização
            console.error('❌ Erro ao atualizar estatísticas:', error);
            this.showNotification('Erro ao exibir estatísticas.', 'error');
        }
    }

    // 🔒 Método seguro para toFixed
    static safeToFixed(value, decimals = 2) {
        if (value === undefined || value === null || isNaN(value)) return (0).toFixed(decimals);
        return Number(value).toFixed(decimals);
    }

    // 🔒 Método seguro para conversão de número
    static safeNumber(value, defaultValue = 0) {
        if (value === undefined || value === null || isNaN(value)) return defaultValue;
        return Number(value);
    }

    // 🌐 Formata número para pt-BR
    static formatNumber(number) {
        return new Intl.NumberFormat('pt-BR').format(this.safeNumber(number));
    }

    // 🔄 Calcula cost_by_category se backend não fornecer
    static calcularCostByCategoryFallback(stats) {
        console.log('🔄 Calculando cost_by_category fallback...');
        if (!stats.total_services || stats.total_services === 0) return {};

        const categorias = ['Troca de óleo', 'Pneus', 'Freios', 'Correia', 'Revisão'];
        const custoPorCategoria = {};
        categorias.forEach(c => { custoPorCategoria[c] = Math.round(stats.total_cost / categorias.length); });
        return custoPorCategoria;
    }

    // 📊 Atualiza o gráfico com dados seguros
    static updateChart(costByCategory = {}) {
        if (!this.costChart) this.initializeChart();
        if (!this.costChart) return console.error('❌ Não foi possível inicializar o gráfico');

        const labels = Object.keys(costByCategory);
        const data = Object.values(costByCategory).map(v => this.safeNumber(v, 0));

        // Se não houver dados, mostra gráfico padrão
        if (labels.length === 0 || data.every(v => v === 0)) {
            this.costChart.data.labels = ['Sem dados'];
            this.costChart.data.datasets[0].data = [1];
            this.costChart.data.datasets[0].backgroundColor = ['rgba(200,200,200,0.5)'];
        } else {
            this.costChart.data.labels = labels;
            this.costChart.data.datasets[0].data = data;
            this.costChart.data.datasets[0].backgroundColor = window.APP_CONFIG?.chartColors || [
                'rgba(0,100,0,0.7)',
                'rgba(255,140,0,0.7)',
                'rgba(50,50,200,0.7)',
                'rgba(200,50,50,0.7)',
                'rgba(150,50,200,0.7)',
                'rgba(50,150,150,0.7)'
            ];
        }

        this.costChart.update();
        console.log('📈 Gráfico atualizado:', { labels, data });
    }

    // 🔔 Mostra notificações de erro ou alerta
    static showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        if (type === 'error' || type === 'warning') {
            if (window.UI && window.UI.showNotification) window.UI.showNotification(message, type);
            else alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    // 🧹 Limpa todas as estatísticas do DOM e gráfico
    static clearStatistics() {
        console.log('🔄 Limpando estatísticas...');
        ['totalMileage','totalServices','totalCost','monthlyAverage','nextMaintenance'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
        this.updateChart({});
        console.log('✅ Estatísticas limpas');
    }
}

// 🌐 Disponibiliza globalmente
window.Stats = Stats;
console.log('✅ Stats carregado - VERSÃO FINAL SEGURA');
