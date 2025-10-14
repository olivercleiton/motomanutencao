// stats.js - versão FINAL corrigida
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
            this.showNotification('Erro ao carregar estatísticas: ' + error.message, 'error');
        }
    }

    static initializeChart() {
        const ctx = document.getElementById('costChart')?.getContext('2d');
        if (!ctx) return;

        this.costChart = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: window.APP_CONFIG?.chartColors || ['rgba(0,100,0,0.7)','rgba(255,140,0,0.7)','rgba(50,50,200,0.7)','rgba(200,50,50,0.7)','rgba(150,50,200,0.7)','rgba(50,150,150,0.7)'], borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: ctx => `R$ ${(ctx.parsed ?? 0).toFixed(2)}` } } } }
        });
    }

    static updateStatistics(stats = {}) {
        const totalMileage = document.getElementById('totalMileage');
        if (totalMileage) totalMileage.textContent = this.formatNumber(stats.current_mileage ?? 0);

        const totalServices = document.getElementById('totalServices');
        if (totalServices) totalServices.textContent = this.formatNumber(stats.total_services ?? 0);

        const totalCost = document.getElementById('totalCost');
        if (totalCost) totalCost.textContent = `R$ ${(stats.total_cost ?? 0).toFixed(2)}`;

        const monthlyAverage = document.getElementById('monthlyAverage');
        if (monthlyAverage) monthlyAverage.textContent = `R$ ${(stats.monthly_average ?? 0).toFixed(2)}`;

        const nextMaintenance = document.getElementById('nextMaintenance');
        if (nextMaintenance) nextMaintenance.textContent = (stats.next_maintenance > 0 ? `${this.formatNumber(stats.next_maintenance)} km` : 'Em dia');

        this.updateChart(stats.cost_by_category ?? {});
    }

    static updateChart(costByCategory = {}) {
        if (!this.costChart) this.initializeChart();
        if (!this.costChart) return;

        this.costChart.data.labels = Object.keys(costByCategory);
        this.costChart.data.datasets[0].data = Object.values(costByCategory);
        this.costChart.update();
    }

    static formatNumber(number) {
        if (number === null || number === undefined) return '0';
        return new Intl.NumberFormat('pt-BR').format(number);
    }

    static showNotification(message, type = 'info') {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Global
window.Stats = Stats;
console.log('✅ Stats carregado - VERSÃO FINAL');
