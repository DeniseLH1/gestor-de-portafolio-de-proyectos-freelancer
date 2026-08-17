import Command from './command.js';

class DeleteDeliverableCommand extends Command {
  constructor(deliverableService) {
    super('Eliminar entregable', 'Elimina un entregable existente');
    this.deliverableService = deliverableService;
  }

  async execute(id) {
    return await this.deliverableService.delete(id);
  }
}

export default DeleteDeliverableCommand;