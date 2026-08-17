import Command from './command.js';

class CreateProposalCommand extends Command {
  constructor(proposalService) {
    super('Crear propuesta', 'Registra una nueva propuesta para un cliente');
    this.proposalService = proposalService;
  }

  async execute(datos) {
    return await this.proposalService.createProposal(datos);
  }
}

export default CreateProposalCommand;