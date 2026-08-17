import Command from './command.js';

class UpdateClientCommand extends Command {
  constructor(clientService) {
    super('Actualizar cliente', 'Modifica los datos de un cliente existente');
    this.clientService = clientService;
  }

  async execute({ id, data }) {
    return await this.clientService.update(id, data);
  }
}

export default UpdateClientCommand;