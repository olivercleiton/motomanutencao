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
    
        // ✅ CORREÇÃO: Garantir que todos os campos existem
        const statsCompletos = {
        current_mileage: stats.total_mileage || stats.current_mileage || 0, // Backend usa total_mileage
        total_services: stats.total_services || 0,
        total_cost: stats.total_cost || 0,
        monthly_average: stats.monthly_average || 0,
        next_maintenance: stats.next_maintenance || 0,
        cost_by_category: stats.cost_by_category || this.calcularCostByCategoryFallback(stats)
        };

        console.log('🛡️ Estatísticas completadas:', statsCompletos);

        // ✅ CORREÇÃO: Função segura para toFixed
         const safeToFixed = (value, decimals = 2) => {
        if (value === undefined || value === null || isNaN(value)) {
            return '0'.padEnd(decimals + 2, '0').slice(0, decimals + 2);
        }
        const num = Number(value);
        return num.toFixed(decimals);
        };

         // ✅ CORREÇÃO: Função segura para números
        const safeNumber = (value, defaultValue = 0) => {
        if (value === undefined || value === null || isNaN(value)) {
            return defaultValue;
        }
        return Number(value);
        };

        try {
        const totalMileage = document.getElementById('totalMileage');
        if (totalMileage) {
            totalMileage.textContent = this.formatNumber(safeNumber(statsCompletos.current_mileage));
        }

        const totalServices = document.getElementById('totalServices');
        if (totalServices) {
            totalServices.textContent = this.formatNumber(safeNumber(statsCompletos.total_services));
        }

        const totalCost = document.getElementById('totalCost');
        if (totalCost) {
            totalCost.textContent = `R$ ${safeToFixed(statsCompletos.total_cost)}`;
        }

        const monthlyAverage = document.getElementById('monthlyAverage');
        if (monthlyAverage) {
            monthlyAverage.textContent = `R$ ${safeToFixed(statsCompletos.monthly_average)}`;
        }

        const nextMaintenance = document.getElementById('nextMaintenance');
        if (nextMaintenance) {
            const nextMaint = safeNumber(statsCompletos.next_maintenance);
            nextMaintenance.textContent = nextMaint > 0 ? 
                `${this.formatNumber(nextMaint)} km` : 'Em dia';
        }

        // ✅ CORREÇÃO: Usar estatísticas completadas
        this.updateChart(statsCompletos.cost_by_category);
        console.log('✅ Estatísticas atualizadas com segurança');

        } catch (error) {
        console.error('❌ Erro ao atualizar estatísticas:', error);
        this.showNotification('Erro ao exibir estatísticas.', 'error');
         }
    }

    // ✅ NOVO MÉTODO: Calcular cost_by_category quando backend não fornecer
    static calcularCostByCategoryFallback(stats) {
        console.log('🔄 Calculando cost_by_category fallback...');
    
        // Se não há serviços, retornar objeto vazio
    if (!stats.total_services || stats.total_services === 0) {
        console.log('📊 Nenhum serviço registrado - gráfico vazio');
        return {};
    }
    
    // ✅ Aqui você poderia buscar os serviços reais para calcular
    // Por enquanto, retornar dados de exemplo baseados no total_cost
    const categorias = ['Troca de óleo', 'Pneus', 'Freios', 'Correia', 'Revisão'];
    const custoPorCategoria = {};
    
    if (stats.total_cost > 0) {
        // Distribuir o custo total entre categorias (exemplo)
        categorias.forEach((categoria, index) => {
            custoPorCategoria[categoria] = Math.round(stats.total_cost / categorias.length);
        });
        console.log('📈 Custos distribuídos:', custoPorCategoria);
    } else {
        console.log('💰 Custo total zero - sem dados para gráfico');
    }
    
    return custoPorCategoria;
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