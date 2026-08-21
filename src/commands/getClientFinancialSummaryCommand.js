import Command from './command.js';

class GetClientFinancialSummaryCommand extends Command {
  constructor(financialService) {
    super('Resumen financiero por cliente', 'Genera el resumen de ingresos, egresos y balance de un cliente usando agregación de MongoDB');
    this.financialService = financialService;
  }

  async execute(clientId) {
    return await this.financialService.getResumenPorCliente(clientId);
  }
}

export default GetClientFinancialSummaryCommand;