class Stats {
    static costChart = null;

    static updateStatistics(stats = {}) {
        console.log('🔄 Atualizando estatísticas com dados:', stats);

        // ✅ Garantir valores padrão
        const totalMileage = Number(stats.total_mileage) || 0;
        const totalServices = Number(stats.total_services) || 0;
        const totalCost = Number(stats.total_cost) || 0;
        const monthlyAverage = Number(stats.monthly_average) || 0;
        const nextMaintenance = Number(stats.next_maintenance) || 0;
        const costByCategory = stats.cost_by_category || Stats.fallbackCostByCategory(totalCost);

        // Atualizar DOM
        const el = (id, value) => document.getElementById(id)?.textContent = value;

        el('totalMileage', totalMileage.toLocaleString('pt-BR'));
        el('totalServices', totalServices.toLocaleString('pt-BR'));
        el('totalCost', `R$ ${totalCost.toFixed(2)}`);
        el('monthlyAverage', `R$ ${monthlyAverage.toFixed(2)}`);
        el('nextMaintenance', nextMaintenance > 0 ? `${nextMaintenance.toLocaleString('pt-BR')} km` : 'Em dia');

        // Atualizar gráfico
        Stats.updateChart(costByCategory);
        console.log('✅ Estatísticas atualizadas com segurança');
    }

    static fallbackCostByCategory(totalCost) {
        if (!totalCost || totalCost <= 0) return {};

        const categories = ['Troca de óleo', 'Pneus', 'Freios', 'Correia', 'Revisão'];
        const costPerCat = Math.round(totalCost / categories.length);
        const result = {};
        categories.forEach(c => result[c] = costPerCat);
        return result;
    }

    static initializeChart() {
        const ctx = document.getElementById('costChart')?.getContext('2d');
        if (!ctx) return;

        if (Stats.costChart) Stats.costChart.destroy();

        Stats.costChart = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: ['Sem dados'], datasets: [{ data: [1], backgroundColor: ['rgba(200,200,200,0.5)'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    static updateChart(costByCategory = {}) {
        if (!Stats.costChart) Stats.initializeChart();
        if (!Stats.costChart) return;

        const labels = Object.keys(costByCategory);
        const data = Object.values(costByCategory);

        if (labels.length === 0 || data.every(v => v === 0)) {
            Stats.costChart.data.labels = ['Sem dados'];
            Stats.costChart.data.datasets[0].data = [1];
            Stats.costChart.data.datasets[0].backgroundColor = ['rgba(200,200,200,0.5)'];
        } else {
            Stats.costChart.data.labels = labels;
            Stats.costChart.data.datasets[0].data = data;
            Stats.costChart.data.datasets[0].backgroundColor = [
                'rgba(0,100,0,0.7)',
                'rgba(255,140,0,0.7)',
                'rgba(50,50,200,0.7)',
                'rgba(200,50,50,0.7)',
                'rgba(150,50,200,0.7)',
            ];
        }

        Stats.costChart.update();
    }
}

window.Stats = Stats;
console.log('✅ Stats carregado - VERSÃO MÍNIMA SEGURA');
