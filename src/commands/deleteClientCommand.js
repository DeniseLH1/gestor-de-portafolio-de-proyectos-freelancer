import Command from './command.js';

class DeleteClientCommand extends Command {
  constructor(clientService) {
    super('Eliminar cliente', 'Elimina un cliente existente');
    this.clientService = clientService;
  }

  async execute(id) {
    return await this.clientService.delete(id);
  }
}

export default DeleteClientCommand;