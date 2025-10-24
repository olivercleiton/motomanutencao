// vehicles.js - VERSÃO COM MOCK COMPLETO
class Vehicles {
    static vehicles = [];
    static currentId = 1;

    // ✅ Inicialização
    static init() {
        console.log('🚗 Vehicles: Inicializando...');
        this.loadVehicles();
    }

    // ✅ Carregar veículos (MOCK)
    static async loadVehicles() {
        console.log('🚗 Vehicles: Carregando veículos...');
        
        try {
            // ✅ **MOCK - Carrega do localStorage ou usa array vazio**
            const saved = localStorage.getItem('user_vehicles');
            if (saved) {
                this.vehicles = JSON.parse(saved);
                console.log('✅ Vehicles: Veículos carregados do localStorage:', this.vehicles.length);
            } else {
                this.vehicles = [];
                console.log('✅ Vehicles: Nenhum veículo salvo, iniciando array vazio');
            }
            
            this.currentId = Math.max(...this.vehicles.map(v => v.id), 0) + 1;
            
            // Atualizar UI
            this.updateVehiclesList();
            return this.vehicles;
            
        } catch (error) {
            console.error('❌ Vehicles: Erro ao carregar veículos:', error);
            this.vehicles = [];
            this.updateVehiclesList();
            return [];
        }
    }

    // ✅ Adicionar veículo (MOCK)
    static async handleAddVehicle(event) {
        if (event) event.preventDefault();
        
        console.log('🚗 Vehicles: Adicionando novo veículo...');
        
        const form = document.getElementById('addVehicleForm');
        if (!form) {
            console.error('❌ Vehicles: Formulário não encontrado');
            return;
        }

        const formData = new FormData(form);
        const vehicleData = {
            marca: formData.get('marca')?.trim() || '',
            modelo: formData.get('modelo')?.trim() || '',
            ano: parseInt(formData.get('ano')) || new Date().getFullYear(),
            placa: formData.get('placa')?.trim()?.toUpperCase() || '',
            quilometragem: parseInt(formData.get('quilometragem')) || 0
        };

        // Validação
        if (!vehicleData.marca || !vehicleData.modelo) {
            alert('⚠️ Por favor, preencha marca e modelo do veículo');
            return;
        }

        try {
            // ✅ **MOCK - Adiciona ao array local**
            const newVehicle = {
                id: this.currentId++,
                ...vehicleData,
                createdAt: new Date().toISOString(),
                lastMaintenance: null,
                services: []
            };

            this.vehicles.push(newVehicle);
            this.saveToLocalStorage();
            
            console.log('✅ Vehicles: Veículo adicionado:', newVehicle);
            
            // Fechar modal e atualizar lista
            this.closeAddVehicleModal();
            this.updateVehiclesList();
            
            alert('🎉 Veículo adicionado com sucesso!');
            
        } catch (error) {
            console.error('❌ Vehicles: Erro ao adicionar veículo:', error);
            alert('❌ Erro ao adicionar veículo: ' + error.message);
        }
    }

    // ✅ Salvar no localStorage
    static saveToLocalStorage() {
        try {
            localStorage.setItem('user_vehicles', JSON.stringify(this.vehicles));
            console.log('💾 Vehicles: Dados salvos no localStorage');
        } catch (error) {
            console.error('❌ Vehicles: Erro ao salvar no localStorage:', error);
        }
    }

    // ✅ Atualizar lista na UI
    static updateVehiclesList() {
        console.log('🔄 Vehicles: Atualizando lista na UI...');
        
        const vehiclesList = document.getElementById('vehiclesList');
        const emptyState = document.getElementById('emptyVehiclesState');
        const statsElement = document.getElementById('totalVehicles');
        
        if (!vehiclesList) {
            console.log('⚠️ Vehicles: Elemento vehiclesList não encontrado');
            return;
        }

        // Atualizar estatísticas
        if (statsElement) {
            statsElement.textContent = this.vehicles.length;
        }

        // Mostrar/ocultar estado vazio
        if (emptyState) {
            if (this.vehicles.length === 0) {
                emptyState.classList.remove('hidden');
                vehiclesList.innerHTML = '';
            } else {
                emptyState.classList.add('hidden');
            }
        }

        // Gerar lista de veículos
        if (this.vehicles.length > 0) {
            vehiclesList.innerHTML = this.vehicles.map(vehicle => `
                <div class="vehicle-card" data-vehicle-id="${vehicle.id}">
                    <div class="vehicle-info">
                        <h3>${vehicle.marca} ${vehicle.modelo}</h3>
                        <p>Ano: ${vehicle.ano} • Placa: ${vehicle.placa || 'N/A'}</p>
                        <p>Quilometragem: ${vehicle.quilometragem.toLocaleString()} km</p>
                    </div>
                    <div class="vehicle-actions">
                        <button class="btn-secondary" onclick="Vehicles.handleEditVehicle(${vehicle.id})">
                            Editar
                        </button>
                        <button class="btn-danger" onclick="Vehicles.handleDeleteVehicle(${vehicle.id})">
                            Excluir
                        </button>
                    </div>
                </div>
            `).join('');
            
            console.log('✅ Vehicles: Lista atualizada com', this.vehicles.length, 'veículos');
        }
    }

    // ✅ Editar veículo (MOCK)
    static handleEditVehicle(vehicleId) {
        console.log('✏️ Vehicles: Editando veículo:', vehicleId);
        
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) {
            alert('❌ Veículo não encontrado');
            return;
        }

        // Preencher formulário de edição (se existir)
        const editForm = document.getElementById('editVehicleForm');
        if (editForm) {
            document.getElementById('editMarca').value = vehicle.marca;
            document.getElementById('editModelo').value = vehicle.modelo;
            document.getElementById('editAno').value = vehicle.ano;
            document.getElementById('editPlaca').value = vehicle.placa || '';
            document.getElementById('editQuilometragem').value = vehicle.quilometragem;
            
            // Mostrar modal de edição
            const modal = document.getElementById('editVehicleModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.dataset.editingVehicleId = vehicleId;
            }
        } else {
            // Fallback simples
            const newMarca = prompt('Nova marca:', vehicle.marca);
            const newModelo = prompt('Novo modelo:', vehicle.modelo);
            
            if (newMarca && newModelo) {
                vehicle.marca = newMarca;
                vehicle.modelo = newModelo;
                this.saveToLocalStorage();
                this.updateVehiclesList();
                alert('✅ Veículo atualizado!');
            }
        }
    }

    // ✅ Excluir veículo (MOCK)
    static handleDeleteVehicle(vehicleId) {
        console.log('🗑️ Vehicles: Excluindo veículo:', vehicleId);
        
        if (!confirm('Tem certeza que deseja excluir este veículo?')) {
            return;
        }

        const index = this.vehicles.findIndex(v => v.id === vehicleId);
        if (index !== -1) {
            this.vehicles.splice(index, 1);
            this.saveToLocalStorage();
            this.updateVehiclesList();
            console.log('✅ Vehicles: Veículo excluído');
            alert('✅ Veículo excluído com sucesso!');
        } else {
            alert('❌ Veículo não encontrado');
        }
    }

    // ✅ Fechar modal de adição
    static closeAddVehicleModal() {
        const modal = document.getElementById('addVehicleModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        const form = document.getElementById('addVehicleForm');
        if (form) {
            form.reset();
        }
        console.log('🚗 Vehicles: Modal fechado');
    }

    // ✅ Mostrar modal de adição
    static showAddVehicleModal() {
        const modal = document.getElementById('addVehicleModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        console.log('🚗 Vehicles: Modal aberto');
    }

    // ✅ Obter veículo por ID
    static getVehicleById(id) {
        return this.vehicles.find(vehicle => vehicle.id === id);
    }

    // ✅ Obter todos os veículos
    static getAllVehicles() {
        return this.vehicles;
    }

    // ✅ Adicionar serviço a um veículo
    static addServiceToVehicle(vehicleId, serviceData) {
        const vehicle = this.getVehicleById(vehicleId);
        if (vehicle) {
            if (!vehicle.services) {
                vehicle.services = [];
            }
            vehicle.services.push({
                id: Date.now(),
                ...serviceData,
                createdAt: new Date().toISOString()
            });
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }
}

// 🌐 Global
window.Vehicles = Vehicles;

// ✅ Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚗 Vehicles: Inicializando...');
    Vehicles.init();
});

console.log('🚗 Vehicles carregado - VERSÃO MOCK COMPLETA');
