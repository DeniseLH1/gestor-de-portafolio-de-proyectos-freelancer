import Command from './command.js';

class CreateContractCommand extends Command {
  constructor(contractService) {
    super('Crear contrato', 'Registra un nuevo contrato en el sistema');
    this.contractService = contractService;
  }

  async execute(datos) {
    return await this.contractService.create(datos);
  }
}

export default CreateContractCommand;