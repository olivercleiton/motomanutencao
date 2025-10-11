import re
from datetime import datetime

def validate_email(email):
    """Valida formato de e-mail"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_plate(plate):
    """Valida formato de placa (brasileiro)"""
    if not plate:
        return True
    
    # Formato Mercosul: ABC1D23
    mercosul_pattern = r'^[A-Z]{3}[0-9][A-Z][0-9]{2}$'
    # Formato antigo: ABC-1234
    old_pattern = r'^[A-Z]{3}-[0-9]{4}$'
    
    return re.match(mercosul_pattern, plate) is not None or re.match(old_pattern, plate) is not None

def format_currency(value):
    """Formata valor para moeda brasileira"""
    if value is None:
        return "R$ 0,00"
    return f"R$ {value:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

def format_date(date_string):
    """Formata data para formato brasileiro"""
    if not date_string:
        return ""
    
    try:
        if isinstance(date_string, str):
            date = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        else:
            date = date_string
        
        return date.strftime('%d/%m/%Y')
    except:
        return str(date_string)

def format_mileage(mileage):
    """Formata quilometragem com separadores"""
    if mileage is None:
        return "0"
    return f"{mileage:,.0f}".replace(',', '.')

def calculate_next_maintenance(last_service_km, interval_km, current_km):
    """Calcula próxima manutenção"""
    if interval_km <= 0:
        return 0
    
    next_km = last_service_km + interval_km
    remaining = next_km - current_km
    
    return max(0, remaining)

def get_maintenance_status(remaining_km, interval_km):
    """Retorna status da manutenção baseado na quilometragem restante"""
    if remaining_km <= 0:
        return 'due'  # Vencido
    elif remaining_km <= interval_km * 0.2:
        return 'soon'  # Em breve (20% do intervalo)
    else:
        return 'ok'  # OK

def calculate_monthly_average(services, months=6):
    """Calcula média mensal dos custos"""
    if not services:
        return 0
    
    cutoff_date = datetime.now().replace(day=1)
    for _ in range(months - 1):
        # Subtrai um mês
        if cutoff_date.month == 1:
            cutoff_date = cutoff_date.replace(year=cutoff_date.year - 1, month=12)
        else:
            cutoff_date = cutoff_date.replace(month=cutoff_date.month - 1)
    
    recent_services = [
        s for s in services 
        if isinstance(s.get('date'), str) and 
        datetime.fromisoformat(s['date'].replace('Z', '+00:00')) >= cutoff_date
    ]
    
    total_cost = sum(s.get('cost', 0) for s in recent_services)
    return total_cost / months

def validate_service_data(service_data):
    """Valida dados de serviço"""
    errors = []
    
    if not service_data.get('service_type'):
        errors.append('Tipo de serviço é obrigatório')
    
    if not service_data.get('date'):
        errors.append('Data do serviço é obrigatória')
    else:
        try:
            datetime.strptime(service_data['date'], '%Y-%m-%d')
        except ValueError:
            errors.append('Data inválida')
    
    if not service_data.get('mileage'):
        errors.append('Quilometragem é obrigatória')
    elif not isinstance(service_data['mileage'], (int, float)) or service_data['mileage'] < 0:
        errors.append('Quilometragem deve ser um número positivo')
    
    if service_data.get('cost') and (not isinstance(service_data['cost'], (int, float)) or service_data['cost'] < 0):
        errors.append('Custo deve ser um número positivo')
    
    return errors

def validate_vehicle_data(vehicle_data):
    """Valida dados do veículo"""
    errors = []
    
    if not vehicle_data.get('name'):
        errors.append('Nome do veículo é obrigatório')
    
    if not vehicle_data.get('model'):
        errors.append('Modelo do veículo é obrigatório')
    
    if not vehicle_data.get('year'):
        errors.append('Ano do veículo é obrigatório')
    elif not isinstance(vehicle_data['year'], int) or vehicle_data['year'] < 1900 or vehicle_data['year'] > datetime.now().year + 1:
        errors.append('Ano do veículo é inválido')
    
    if not vehicle_data.get('current_mileage'):
        errors.append('Quilometragem atual é obrigatória')
    elif not isinstance(vehicle_data['current_mileage'], (int, float)) or vehicle_data['current_mileage'] < 0:
        errors.append('Quilometragem deve ser um número positivo')
    
    if vehicle_data.get('plate') and not validate_plate(vehicle_data['plate']):
        errors.append('Placa do veículo é inválida')
    
    return errors

def group_services_by_type(services):
    """Agrupa serviços por tipo"""
    grouped = {}
    for service in services:
        service_type = service.get('service_type', 'Outro')
        if service_type not in grouped:
            grouped[service_type] = []
        grouped[service_type].append(service)
    return grouped

def calculate_service_stats(services):
    """Calcula estatísticas dos serviços"""
    if not services:
        return {
            'total_services': 0,
            'total_cost': 0,
            'average_cost': 0,
            'services_by_type': {}
        }
    
    total_cost = sum(s.get('cost', 0) for s in services)
    services_by_type = {}
    
    for service in services:
        service_type = service.get('service_type', 'Outro')
        if service_type not in services_by_type:
            services_by_type[service_type] = {
                'count': 0,
                'total_cost': 0,
                'average_cost': 0
            }
        
        services_by_type[service_type]['count'] += 1
        services_by_type[service_type]['total_cost'] += service.get('cost', 0)
    
    # Calcular média por tipo
    for service_type in services_by_type:
        services_by_type[service_type]['average_cost'] = (
            services_by_type[service_type]['total_cost'] / services_by_type[service_type]['count']
        )
    
    return {
        'total_services': len(services),
        'total_cost': total_cost,
        'average_cost': total_cost / len(services) if services else 0,
        'services_by_type': services_by_type
    }

def get_default_maintenance_config():
    """Retorna configuração padrão de manutenção"""
    return {
        "Troca de óleo": 3000,
        "Troca de pneu": 10000,
        "Ajuste de freios": 5000,
        "Troca de correia": 15000,
        "Revisão geral": 6000,
        "Outro": 0
    }