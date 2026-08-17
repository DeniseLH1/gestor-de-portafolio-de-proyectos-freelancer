export class ProposalService {
    constructor(proposalRepository, clientRepository) {
        this.proposalRepository = proposalRepository;
        this.clientRepository = clientRepository;
    }

    async createProposal(data) {
        if (!data.title || data.title.trim() === '') {
            throw new Error('El título de la propuesta es obligatorio.');
        }
        if (!data.amount || data.amount <= 0) {
            throw new Error('El monto ofertado debe ser mayor a 0.');
        }

        const client = await this.clientRepository.findById(data.clientId);
        if (!client) {
            throw new Error(`No existe un cliente registrado con el ID ${data.clientId}.`);
        }

        if (data.validUntil && new Date(data.validUntil) < new Date()) {
            throw new Error('La fecha de vigencia debe ser posterior a la fecha actual.');
        }

        return await this.proposalRepository.create({
            ...data,
            status: data.status || 'DRAFT'
            });
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