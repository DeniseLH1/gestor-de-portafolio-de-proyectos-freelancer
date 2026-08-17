import Project from '../models/project.js';

export class ProjectService {
    constructor(projectRepository, clientRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
    }

    async createProject(data) {
        const project = new Project(data);
        project.assertValid();

        const client = await this.clientRepository.findById(project.clientId);
        if (!client) {
            throw new Error(`No se encontró ningún cliente registrado con el ID ${project.clientId}.`);
        }

        return await this.projectRepository.create(project);
    }

    async getAllProjects() {
        return await this.projectRepository.findAll();
    }

    async getProjectById(id) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error(`El proyecto con ID ${id} no existe.`);
        }
        return project;
    }

    async getProjectsByClient(clientId) {
        const client = await this.clientRepository.findById(clientId);
        if (!client) {
            throw new Error(`El cliente con ID ${clientId} no existe.`);
        }
        return await this.projectRepository.findByClientId(clientId);
    }

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

    async updateProject(id, updateData) {
        const existente = await this.projectRepository.findById(id);
        if (!existente) {
            throw new Error(`El proyecto con ID ${id} no existe.`);
        }

        const datosExistentes = {
            ...existente,
            clientId: existente.clientId.toString(),
            proposalId: existente.proposalId ? existente.proposalId.toString() : null,
            contractId: existente.contractId ? existente.contractId.toString() : null,
        };

        const project = new Project({ ...datosExistentes, ...updateData });
        project.assertValid();

        return await this.projectRepository.update(id, project);
    }
}