// updateDeliverableCommand.js
import Command from './command.js';

class UpdateDeliverableCommand extends Command {
  constructor(deliverableService) {
    super('Actualizar entregable', 'Modifica los datos de un entregable existente');
    this.deliverableService = deliverableService;
  }

  async execute({ id, data }) {
    return await this.deliverableService.update(id, data);
  }
}

export default UpdateDeliverableCommand;