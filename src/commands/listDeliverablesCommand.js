import Command from './command.js';

class ListDeliverablesCommand extends Command {
  constructor(deliverableService) {
    super('Listar entregables', 'Muestra todos los entregables registrados');
    this.deliverableService = deliverableService;
  }

  async execute() {
    return await this.deliverableService.findAll();
  }
}

export default ListDeliverablesCommand;