import Command from './command.js';

class UpdateContractCommand extends Command {
  constructor(contractService) {
    super('Actualizar contrato', 'Modifica los datos de un contrato existente');
    this.contractService = contractService;
  }

  async execute({ id, data }) {
    return await this.contractService.update(id, data);
  }
}

export default UpdateContractCommand;