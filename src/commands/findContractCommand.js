import Command from './command.js';

class FindContractCommand extends Command {
  constructor(contractService) {
    super('Buscar contrato', 'Busca un contrato por su id');
    this.contractService = contractService;
  }

  async execute(id) {
    return await this.contractService.findById(id);
  }
}

export default FindContractCommand;