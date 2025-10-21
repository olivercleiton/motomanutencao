// stats.js - VERSÃO COMPLETAMENTE DESABILITADA
class Stats {
    static async loadStatistics(vehicleId) {
        try {
            console.log('📊 Estatísticas desabilitadas temporariamente');
            // ⚠️ NÃO faz nada - completamente desabilitado
            return;
        } catch (error) {
            console.error('❌ Erro em loadStatistics:', error);
        }
    }

    static updateStatistics(stats = {}) {
        // ⚠️ NÃO faz nada - completamente desabilitado
        console.log('📊 Estatísticas desabilitadas');
        return;
    }

    static updateServicesChart(servicesByType = {}) {
        // ⚠️ NÃO faz nada - completamente desabilitado
        return;
    }

    // Métodos auxiliares (mantidos mas não usados)
    static safeParseInt(value) {
        return 0;
    }

    static safeParseFloat(value) {
        return 0;
    }

    static formatNumber(number) {
        return '0';
    }

    static clearChart() {
        // Não faz nada
    }
}

console.log('✅ Stats carregado - ESTATÍSTICAS DESABILITADAS');
window.Stats = Stats;