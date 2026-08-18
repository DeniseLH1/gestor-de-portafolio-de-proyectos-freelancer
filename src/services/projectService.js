import Project from '../models/project.js';
import ValidationError from '../utils/ValidationError.js';
import { getNextSequenceValue } from '../utils/sequence.js';

export class ProjectService {
    constructor(projectRepository, clientRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
    }

    async createProject(data) {
        const project = new Project(data);
        project.assertValid();

        const client = await this.clientRepository.findOne({ id: Number(project.clientId) });
        if (!client) {
            throw new ValidationError(`No se encontró ningún cliente registrado con el ID ${project.clientId}.`);
        }

        const autoId = await getNextSequenceValue(this.projectRepository.collection.db, 'projects_id');
        const projectData = { id: autoId, ...project.toObject() };

        return await this.projectRepository.create(projectData);
    }

    async getAllProjects() {
        return await this.projectRepository.findAll();
    }

    async getProjectById(id) {
        const numericId = Number(id);
        if (isNaN(numericId) || numericId <= 0) {
            throw new ValidationError('El ID debe ser un número entero positivo.');
        }
        const project = await this.projectRepository.findOne({ id: numericId });
        if (!project) {
            throw new ValidationError(`El proyecto con ID ${numericId} no existe.`);
        }
        return project;
    }

    async getProjectsByClient(clientId) {
        const client = await this.clientRepository.findOne({ id: Number(clientId) });
        if (!client) {
            throw new ValidationError(`El cliente con ID ${clientId} no existe.`);
        }
        return await this.projectRepository.findByClientId(clientId);
    }

    async updateStatus(id, newStatus) {
        const validStatuses = ['Planificado', 'En progreso', 'En espera', 'Completado', 'Cancelado'];

        if (!validStatuses.includes(newStatus)) {
            throw new ValidationError(`Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}`);
        }

        const project = await this.getProjectById(id);
        return await this.projectRepository.updateByCustomId(project.id, { status: newStatus });
    }

    async updateProject(id, updateData) {
        const existente = await this.getProjectById(id);

        const datosExistentes = {
            ...existente,
            clientId: existente.clientId.toString(),
            proposalId: existente.proposalId ? existente.proposalId.toString() : null,
            contractId: existente.contractId ? existente.contractId.toString() : null,
        };

        const project = new Project({ ...datosExistentes, ...updateData });
        project.assertValid();

        return await this.projectRepository.updateByCustomId(existente.id, project.toObject());
    }
}