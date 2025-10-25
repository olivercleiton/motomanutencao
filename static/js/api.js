// api.js - VERSÃO 100% MOCK - SEM REQUISIÇÕES REAIS
class API {
    static token = localStorage.getItem('jwt_token') || null;
    static baseURL = 'https://motomanutencao.onrender.com';

    constructor() {
        console.log('🌐 API: Inicializada em MODO MOCK COMPLETO');
        this.init();
    }

    init() {
        console.log('🔑 API: Token recuperado do localStorage:', this.token ? '✅ Presente' : '❌ Ausente');
        
        // Não tenta validar token com backend
        if (this.token) {
            console.log('✅ API: Token mockado presente');
        } else {
            console.log('🌐 API: Sem token - operando em modo mock');
        }
    }

    // ✅ MOCK COMPLETO - Nunca faz requisições reais
    static async request(endpoint, options = {}) {
        console.log(`🔄 API MOCK: Simulando ${options.method || 'GET'} para ${endpoint}`);
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Retornar respostas mockadas baseadas no endpoint
        switch(endpoint) {
            case '/auth/login':
                return {
                    success: true,
                    token: 'mock_jwt_token_' + Date.now(),
                    user: {
                        id: 1,
                        name: 'Usuário Demo',
                        email: options.body?.email || 'demo@email.com'
                    }
                };
                
            case '/auth/register':
                return {
                    success: true,
                    token: 'mock_jwt_token_' + Date.now(),
                    user: {
                        id: Date.now(),
                        name: options.body?.name || 'Novo Usuário',
                        email: options.body?.email || 'novo@email.com'
                    }
                };
                
            case '/auth/validate':
                return {
                    success: true,
                    user: {
                        id: 1,
                        name: 'Usuário Demo',
                        email: 'demo@email.com'
                    }
                };
                
            case '/vehicles':
                if (options.method === 'GET') {
                    const saved = localStorage.getItem('user_vehicles');
                    return {
                        success: true,
                        data: saved ? JSON.parse(saved) : []
                    };
                } else if (options.method === 'POST') {
                    return { success: true, data: options.body };
                }
                break;
                
            default:
                return { success: true, data: [] };
        }
        
        return { success: true, data: {} };
    }

    // ✅ Mock para login
    static async login(email, password) {
        console.log('🔐 API MOCK: Simulando login para:', email);
        
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }
        
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        
        if (result.success) {
            this.token = result.token;
            localStorage.setItem('jwt_token', this.token);
            console.log('✅ API MOCK: Login realizado com sucesso');
        }
        
        return result;
    }

    // ✅ Mock para registro
    static async register(name, email, password) {
        console.log('👤 API MOCK: Simulando registro para:', email);
        
        if (!name || !email || !password) {
            throw new Error('Todos os campos são obrigatórios');
        }
        
        const result = await this.request('/auth/register', {
            method: 'POST',
            body: { name, email, password }
        });
        
        if (result.success) {
            this.token = result.token;
            localStorage.setItem('jwt_token', this.token);
            console.log('✅ API MOCK: Registro realizado com sucesso');
        }
        
        return result;
    }

    // ✅ Mock para validar token
    static async validateToken() {
        console.log('🔍 API MOCK: Validando token mockado');
        
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            throw new Error('Token não encontrado');
        }
        
        const result = await this.request('/auth/validate');
        return result;
    }

    // ✅ Mock para veículos
    static async getVehicles() {
        console.log('🚗 API MOCK: Obtendo veículos');
        return await this.request('/vehicles', { method: 'GET' });
    }

    static async addVehicle(vehicleData) {
        console.log('🚗 API MOCK: Adicionando veículo', vehicleData);
        return await this.request('/vehicles', {
            method: 'POST',
            body: vehicleData
        });
    }

    static async updateVehicle(id, vehicleData) {
        console.log('✏️ API MOCK: Atualizando veículo', id);
        return { success: true, data: vehicleData };
    }

    static async deleteVehicle(id) {
        console.log('🗑️ API MOCK: Excluindo veículo', id);
        return { success: true };
    }
}

// 🌐 Global
window.API = API;

// ✅ Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 API: Inicializando modo mock...');
    window.api = new API();
});

console.log('✅ API carregada - MODO MOCK 100% FUNCIONAL');
