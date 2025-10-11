// Utilitários gerais
const Utils = {
    // Formatar data para exibição
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    },

    // Formatar valor monetário
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Formatar número com separadores de milhar
    formatNumber(number) {
        return new Intl.NumberFormat('pt-BR').format(number);
    },

    // Gerar ID único
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    },

    // Validar e-mail
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Mostrar/ocultar elemento
    toggleElement(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle('hidden', !show);
        }
    },

    // Mostrar loading
    showLoading(buttonId, show) {
        const button = document.getElementById(buttonId);
        if (button) {
            const text = button.querySelector('span:first-child');
            const spinner = button.querySelector('.spinner-border');
            
            if (text) text.classList.toggle('hidden', show);
            if (spinner) spinner.classList.toggle('hidden', !show);
        }
    },

    // Obter data atual no formato YYYY-MM-DD
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }
};

// Configurações globais
const APP_CONFIG = {
    maintenanceIntervals: {
        "Troca de óleo": 5000,
        "Troca de pneu": 10000,
        "Ajuste de freios": 7000,
        "Troca de correia": 15000,
        "Revisão geral": 10000,
        "Outro": 0
    },
    chartColors: [
        'rgba(0, 100, 0, 0.7)',
        'rgba(255, 140, 0, 0.7)',
        'rgba(50, 50, 200, 0.7)',
        'rgba(200, 50, 50, 0.7)',
        'rgba(150, 50, 200, 0.7)',
        'rgba(50, 150, 150, 0.7)'
    ]
};

window.Utils = Utils;
window.APP_CONFIG = APP_CONFIG;