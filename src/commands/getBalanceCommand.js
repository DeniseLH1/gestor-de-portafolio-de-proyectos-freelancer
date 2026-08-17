import Command from './command.js';

class GetBalanceCommand extends Command {
  constructor(financialService) {
    super('Consultar balance', 'Muestra el resumen financiero con filtros opcionales');
    this.financialService = financialService;
  }

  async execute(filtros) {
    return await this.financialService.getBalanceSummary(filtros);
  }
}

export default GetBalanceCommand;