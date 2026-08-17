import Command from './command.js';

class ListClientsCommand extends Command {
  constructor(clientService) {
    super('Listar clientes', 'Muestra todos los clientes registrados');
    this.clientService = clientService;
  }

  async execute() {
    return await this.clientService.findAll();
  }
}

export default ListClientsCommand;