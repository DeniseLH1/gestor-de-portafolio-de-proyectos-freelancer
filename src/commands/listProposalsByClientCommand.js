import Command from './command.js';

class ListProposalsByClientCommand extends Command {
  constructor(proposalService) {
    super('Listar propuestas por cliente', 'Muestra las propuestas asociadas a un cliente');
    this.proposalService = proposalService;
  }

  async execute(clientId) {
    return await this.proposalService.getProposalsByClient(clientId);
  }
}

export default ListProposalsByClientCommand;