import Command from './command.js';

class FindClientCommand extends Command {
  constructor(clientService) {
    super('Buscar cliente', 'Busca un cliente por su id');
    this.clientService = clientService;
  }

  async execute(id) {
    return await this.clientService.findById(id);
  }
}

export default FindClientCommand;