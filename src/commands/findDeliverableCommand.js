import Command from './command.js';

class FindDeliverableCommand extends Command {
  constructor(deliverableService) {
    super('Buscar entregable', 'Busca un entregable por su id');
    this.deliverableService = deliverableService;
  }

  async execute(id) {
    return await this.deliverableService.findById(id);
  }
}

export default FindDeliverableCommand;