class API {
    // ✅ URL relativa para produção
    static get BASE_URL() {
        // Se estiver em desenvolvimento (localhost)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }
        // Se estiver em produção, usa URL relativa
        return '/api';
    }
    
    static token = localStorage.getItem('jwt_token');

    static async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Se for 204 No Content, retornar null
            if (response.status === 204) {
                return null;
            }
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            
            // Se estiver offline, adicionar à fila de sincronização
            if (!navigator.onLine && options.method && options.method !== 'GET') {
                OfflineSync.addPendingRequest({
                    endpoint,
                    options: config
                });
                throw new Error('Operação salva para sincronização quando online');
            }
            
            throw error;
        }
    }

    // Auth methods
    static async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        this.token = data.access_token;
        localStorage.setItem('jwt_token', this.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
    }

    static async register(name, email, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        this.token = data.access_token;
        localStorage.setItem('jwt_token', this.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
    }

    static logout() {
        this.token = null;
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        localStorage.removeItem('currentVehicle');
    }

    // Vehicle methods
    static async getVehicles() {
        return await this.request('/vehicles');
    }

    static async createVehicle(vehicleData) {
        return await this.request('/vehicles', {
            method: 'POST',
            body: JSON.stringify(vehicleData)
        });
    }

    static async updateVehicle(vehicleId, vehicleData) {
        return await this.request(`/vehicles/${vehicleId}`, {
            method: 'PUT',
            body: JSON.stringify(vehicleData)
        });
    }

    static async deleteVehicle(vehicleId) {
        return await this.request(`/vehicles/${vehicleId}`, {
            method: 'DELETE'
        });
    }

    // Service methods
    static async getServices(vehicleId) {
        return await this.request(`/vehicles/${vehicleId}/services`);
    }

    static async createService(vehicleId, serviceData) {
        return await this.request(`/vehicles/${vehicleId}/services`, {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });
    }

    static async deleteService(serviceId) {
        return await this.request(`/services/${serviceId}`, {
            method: 'DELETE'
        });
    }

    // Maintenance config methods
    static async getMaintenanceConfig(vehicleId) {
        const configs = await this.request(`/vehicles/${vehicleId}/maintenance-config`);
        // Converter array para objeto
        const configObj = {};
        configs.forEach(config => {
            configObj[config.service_type] = config.interval_km;
        });
        return configObj;
    }

    static async updateMaintenanceConfig(vehicleId, configs) {
        // Converter objeto para array
        const configArray = Object.keys(configs).map(service_type => ({
            service_type,
            interval_km: configs[service_type]
        }));
        
        return await this.request(`/vehicles/${vehicleId}/maintenance-config`, {
            method: 'POST',
            body: JSON.stringify({ configs: configArray })
        });
    }

    // Stats methods
    static async getVehicleStats(vehicleId) {
        return await this.request(`/vehicles/${vehicleId}/stats`);
    }
}

// Sincronização offline (mantenha igual)
class OfflineSync {
    static pendingRequests = JSON.parse(localStorage.getItem('pending_requests') || '[]');

    static addPendingRequest(request) {
        this.pendingRequests.push({
            ...request,
            timestamp: new Date().toISOString()
        });
        this.savePendingRequests();
    }

    static savePendingRequests() {
        localStorage.setItem('pending_requests', JSON.stringify(this.pendingRequests));
    }

    static async syncPendingRequests() {
        if (!navigator.onLine || this.pendingRequests.length === 0) return;

        console.log('Sincronizando requisições pendentes...');
        
        for (const request of [...this.pendingRequests]) {
            try {
                await API.request(request.endpoint, request.options);
                this.pendingRequests = this.pendingRequests.filter(r => r !== request);
                console.log('Requisição sincronizada:', request);
            } catch (error) {
                console.error('Falha ao sincronizar requisição:', request, error);
            }
        }

        this.savePendingRequests();
    }

    static isOnline() {
        return navigator.onLine;
    }
}

// Event listeners para sincronização offline
window.addEventListener('online', () => {
    OfflineSync.syncPendingRequests();
});

window.addEventListener('offline', () => {
    // UI.showNotification('Você está offline. As alterações serão sincronizadas quando a conexão voltar.', 'warning');
});

// Tornar global
window.API = API;
window.OfflineSync = OfflineSync;