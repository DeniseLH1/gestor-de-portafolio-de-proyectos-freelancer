import Proposal from '../models/proposal.js';
import ValidationError from '../utils/ValidationError.js';
import { getNextSequenceValue } from '../utils/sequence.js';

export class ProposalService {
    constructor(proposalRepository, clientRepository) {
        this.proposalRepository = proposalRepository;
        this.clientRepository = clientRepository;
    }

    async createProposal(data) {
        const proposal = new Proposal(data);
        proposal.assertValid();

        const client = await this.clientRepository.findOne({ id: Number(proposal.clientId) });
        if (!client) {
            throw new Error(`No existe un cliente registrado con el ID ${proposal.clientId}.`);
        }

        if (proposal.validUntil && new Date(proposal.validUntil) < new Date()) {
            throw new Error('La fecha de vigencia debe ser posterior a la fecha actual.');
        }

        const autoId = await getNextSequenceValue(this.proposalRepository.collection.db, 'proposals_id');
        const proposalData = { id: autoId, ...proposal.toObject() };

        return await this.proposalRepository.create(proposalData);
    }

    async getProposalById(id) {
        const numericId = Number(id);
        if (isNaN(numericId) || numericId <= 0) {
            throw new ValidationError('El ID debe ser un número entero positivo.');
        }

        const proposal = await this.proposalRepository.findOne({ id: numericId });
        if (!proposal) {
            throw new Error(`No se encontró la propuesta con ID ${numericId}.`);
        }
        return proposal;
    }

    async getProposalsByClient(clientId) {
        const client = await this.clientRepository.findOne({ id: Number(clientId) });
        if (!client) {
            throw new Error(`El cliente con ID ${clientId} no existe.`);
        }
        return await this.proposalRepository.findByClientId(clientId);
    }

    async updateStatus(id, newStatus) {
        const validStatuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Estado no válido. Valores permitidos: ${validStatuses.join(', ')}`);
        }

        const proposal = await this.getProposalById(id);
        return await this.proposalRepository.updateStatus(proposal.id, newStatus);
    }
}