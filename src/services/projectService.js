export class ProjectService {
    constructor(projectRepository, clientRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
    }

    // Para registrar un nuevo proyecto en el sistema
    async createProject(data) {
        // Validaciones de campos obligatorios
        if (!data.name || data.name.trim() === '') {
            throw new Error('El nombre del proyecto es obligatorio.');
        }

        if (!data.clientId) {
            throw new Error('El proyecto debe estar asignado a un cliente válido.');
        }

        // Validación del presupuesto
        if (data.budget !== undefined && data.budget < 0) {
            throw new Error('El presupuesto no puede ser un monto negativo.');
        }

        // Verificación de que el cliente existe antes de vincularlo
        const client = await this.clientRepository.findById(data.clientId);
        if (!client) {
            throw new Error(`No se encontró ningún cliente registrado con el ID ${data.clientId}.`);
        }

        // Validación de coherencia en fechas si ambas están presentes
        if (data.startDate && data.endDate) {
            if (new Date(data.startDate) > new Date(data.endDate)) {
                throw new Error('La fecha de finalización no puede ser anterior a la fecha de inicio.');
            }
        }

        // Asignación de estado por defecto en español y guardar
        const projectData = {
            ...data,
            status: data.status || 'Planificado'
        };

        return await this.projectRepository.create(projectData);
    }

    // Para obtener todos los proyectos registrados en el sistema
    async getAllProjects() {
        return await this.projectRepository.findAll();
    }

    // Obtener un proyecto por su ID
    async getProjectById(id) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error(`El proyecto con ID ${id} no existe.`);
        }
        return project;
    }

    // Para obtener todos los proyectos asociados a un cliente
    async getProjectsByClient(clientId) {
        const client = await this.clientRepository.findById(clientId);
        if (!client) {
            throw new Error(`El cliente con ID ${clientId} no existe.`);
        }
        return await this.projectRepository.findByClientId(clientId);
    }

    // Para actualizar el estado de un proyecto
    async updateStatus(id, newStatus) {
        const validStatuses = ['Planificado', 'En progreso', 'En espera', 'Completado', 'Cancelado'];

        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}`);
        }

        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error(`No se encontró el proyecto con ID ${id}.`);
        }

        return await this.projectRepository.updateStatus(id, newStatus);
    }

    // Para actualizar la información de un proyecto
    async updateProject(id, updateData) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error(`El proyecto con ID ${id} no existe.`);
        }

        if (updateData.budget !== undefined && updateData.budget < 0) {
            throw new Error('El presupuesto no puede ser un monto negativo.');
        }

        // Validación de coherencia de fechas en la actualización
        const startDate = updateData.startDate || project.startDate;
        const endDate = updateData.endDate || project.endDate;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw new Error('La fecha de finalización no puede ser anterior a la fecha de inicio.');
        }

        return await this.projectRepository.update(id, updateData);
    }
}