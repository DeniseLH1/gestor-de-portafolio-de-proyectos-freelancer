import Command from './command.js';

class CreateTransactionCommand extends Command {
  constructor(financialService) {
    super('Registrar transacción', 'Registra un ingreso o egreso financiero');
    this.financialService = financialService;
  }

  async execute(datos) {
    return await this.financialService.createTransaction(datos);
  }
}

export default CreateTransactionCommand;