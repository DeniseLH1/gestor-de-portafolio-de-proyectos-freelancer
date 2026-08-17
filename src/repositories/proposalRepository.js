import Proposal from '../models/proposal.js';

export class ProposalService {
    constructor(proposalRepository, clientRepository) {
        this.proposalRepository = proposalRepository;
        this.clientRepository = clientRepository;
    }

    async createProposal(data) {
        const proposal = new Proposal(data);
        proposal.assertValid();

        const client = await this.clientRepository.findById(proposal.clientId);
        if (!client) {
            throw new Error(`No existe un cliente registrado con el ID ${proposal.clientId}.`);
        }

        if (proposal.validUntil && new Date(proposal.validUntil) < new Date()) {
            throw new Error('La fecha de vigencia debe ser posterior a la fecha actual.');
        }

        return await this.proposalRepository.create(proposal);
    }

    async getProposalById(id) {
        const proposal = await this.proposalRepository.findById(id);
        if (!proposal) {
            throw new Error(`No se encontró la propuesta con ID ${id}.`);
        }
        return proposal;
    }

    async getProposalsByClient(clientId) {
        const client = await this.clientRepository.findById(clientId);
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

        const proposal = await this.proposalRepository.findById(id);
        if (!proposal) {
            throw new Error(`No se encontró la propuesta con ID ${id}.`);
        }
        return await this.proposalRepository.updateStatus(id, newStatus);
    }
}