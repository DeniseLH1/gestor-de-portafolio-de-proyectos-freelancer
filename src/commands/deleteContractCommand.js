import Command from './command.js';

class DeleteContractCommand extends Command {
  constructor(contractService) {
    super('Eliminar contrato', 'Elimina un contrato existente');
    this.contractService = contractService;
  }

  async execute(id) {
    return await this.contractService.delete(id);
  }
}

export default DeleteContractCommand;