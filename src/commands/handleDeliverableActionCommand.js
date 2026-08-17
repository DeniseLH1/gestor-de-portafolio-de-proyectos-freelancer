import Command from './command.js';

class HandleDeliverableActionCommand extends Command {
  constructor(financialService) {
    super('Gestionar entregable (con rollback)', 'Cambia el estado o elimina un entregable, revirtiendo transacciones asociadas');
    this.financialService = financialService;
  }

  async execute({ deliverableId, action, newStatus }) {
    return await this.financialService.handleDeliverableStatusOrDelete(deliverableId, action, newStatus);
  }
}

export default HandleDeliverableActionCommand;