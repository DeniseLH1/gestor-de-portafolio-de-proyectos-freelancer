import Command from './command.js';

class CreateDeliverableCommand extends Command {
  constructor(deliverableService) {
    super('Crear entregable', 'Registra un nuevo entregable en el sistema');
    this.deliverableService = deliverableService;
  }

  async execute(datos) {
    return await this.deliverableService.create(datos);
  }
}

export default CreateDeliverableCommand;