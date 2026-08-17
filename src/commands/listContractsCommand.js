import Command from './command.js';

class ListContractsCommand extends Command {
  constructor(contractService) {
    super('Listar contratos', 'Muestra todos los contratos registrados');
    this.contractService = contractService;
  }

  async execute() {
    return await this.contractService.findAll();
  }
}

export default ListContractsCommand;