// vehicles.js - VERSÃO SUPER SIMPLIFICADA E FUNCIONAL
class Vehicles {
    static vehicles = [];
    static currentId = 1;

    static init() {
        console.log('🚗 Vehicles: Inicializando...');
        this.loadVehicles();
        
        // Configurar event listeners
        this.setupEventListeners();
    }

    static setupEventListeners() {
        // Adicionar veículo
        const addForm = document.getElementById('addVehicleForm');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddVehicle(e));
            console.log('✅ Vehicles: Event listener do formulário adicionado');
        } else {
            console.log('⚠️ Vehicles: Formulário addVehicleForm não encontrado, tentando encontrar depois...');
            // Tenta novamente depois
            setTimeout(() => this.setupEventListeners(), 1000);
        }

        // Botão para abrir modal
        const addBtn = document.getElementById('addVehicleBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddVehicleModal());
        }

        // Fechar modal
        const closeBtn = document.getElementById('closeAddVehicleModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAddVehicleModal());
        }
    }

    static loadVehicles() {
        try {
            const saved = localStorage.getItem('user_vehicles');
            if (saved) {
                this.vehicles = JSON.parse(saved);
                this.currentId = Math.max(...this.vehicles.map(v => v.id), 0) + 1;
            }
            this.updateVehiclesList();
        } catch (error) {
            console.error('❌ Vehicles: Erro ao carregar:', error);
            this.vehicles = [];
        }
    }

    static handleAddVehicle(event) {
        event.preventDefault();
        console.log('🚗 Vehicles: Adicionando veículo...');

        // Pegar dados do formulário de forma simples
        const marca = document.getElementById('vehicleMarca')?.value || 
                     document.querySelector('[name="marca"]')?.value || 
                     prompt('Marca do veículo:');
        
        const modelo = document.getElementById('vehicleModelo')?.value || 
                      document.querySelector('[name="modelo"]')?.value || 
                      prompt('Modelo do veículo:');

        if (!marca || !modelo) {
            alert('⚠️ Por favor, preencha marca e modelo');
            return;
        }

        // Criar veículo
        const newVehicle = {
            id: this.currentId++,
            marca: marca.trim(),
            modelo: modelo.trim(),
            ano: parseInt(document.getElementById('vehicleAno')?.value) || new Date().getFullYear(),
            placa: (document.getElementById('vehiclePlaca')?.value || '').toUpperCase(),
            quilometragem: parseInt(document.getElementById('vehicleQuilometragem')?.value) || 0,
            createdAt: new Date().toISOString()
        };

        this.vehicles.push(newVehicle);
        this.saveToLocalStorage();
        this.updateVehiclesList();
        this.closeAddVehicleModal();
        
        alert('🎉 Veículo adicionado com sucesso!');
        console.log('✅ Vehicles: Veículo adicionado:', newVehicle);
    }

    static showAddVehicleModal() {
        // Método simples para mostrar modal
        const modal = document.getElementById('addVehicleModal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.remove('hidden');
        } else {
            // Se não encontrar modal, usa prompt simples
            this.handleAddVehicle({ preventDefault: () => {} });
        }
    }

    static closeAddVehicleModal() {
        const modal = document.getElementById('addVehicleModal');
        const form = document.getElementById('addVehicleForm');
        
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
        if (form) {
            form.reset();
        }
    }

    static saveToLocalStorage() {
        localStorage.setItem('user_vehicles', JSON.stringify(this.vehicles));
    }

    static updateVehiclesList() {
        const container = document.getElementById('vehiclesList');
        const emptyState = document.getElementById('emptyVehiclesState');
        
        if (!container) {
            console.log('⚠️ Vehicles: Container da lista não encontrado');
            return;
        }

        // Atualizar contador
        const counter = document.getElementById('totalVehicles');
        if (counter) {
            counter.textContent = this.vehicles.length;
        }

        // Mostrar/ocultar estado vazio
        if (emptyState) {
            emptyState.style.display = this.vehicles.length === 0 ? 'block' : 'none';
        }

        // Gerar lista
        if (this.vehicles.length > 0) {
            container.innerHTML = this.vehicles.map(vehicle => `
                <div class="vehicle-item" style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; border-radius: 5px;">
                    <h3>${vehicle.marca} ${vehicle.modelo}</h3>
                    <p>Ano: ${vehicle.ano} | Placa: ${vehicle.placa || 'N/A'} | KM: ${vehicle.quilometragem}</p>
                    <button onclick="Vehicles.editVehicle(${vehicle.id})" style="margin-right: 10px;">Editar</button>
                    <button onclick="Vehicles.deleteVehicle(${vehicle.id})" style="background: red; color: white;">Excluir</button>
                </div>
            `).join('');
        } else {
            container.innerHTML = '';
        }
    }

    static editVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id === id);
        if (vehicle) {
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

    static deleteVehicle(id) {
        if (confirm('Tem certeza que deseja excluir este veículo?')) {
            this.vehicles = this.vehicles.filter(v => v.id !== id);
            this.saveToLocalStorage();
            this.updateVehiclesList();
            alert('✅ Veículo excluído!');
        }
    }
}

// Inicialização automática
setTimeout(() => {
    console.log('🚗 Vehicles: Iniciando...');
    Vehicles.init();
}, 1000);

window.Vehicles = Vehicles;
console.log('✅ Vehicles carregado - VERSÃO SIMPLIFICADA');
