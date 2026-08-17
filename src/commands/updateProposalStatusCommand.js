import Command from './command.js';

class UpdateProposalStatusCommand extends Command {
  constructor(proposalService) {
    super('Cambiar estado de propuesta', 'Actualiza el estado de una propuesta existente');
    this.proposalService = proposalService;
  }

  async execute({ id, newStatus }) {
    return await this.proposalService.updateStatus(id, newStatus);
  }
}

export default UpdateProposalStatusCommand;