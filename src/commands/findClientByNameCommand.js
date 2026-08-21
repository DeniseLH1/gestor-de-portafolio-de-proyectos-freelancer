import Command from './command.js';

class FindClientByNameCommand extends Command {
  constructor(clientService) {
    super('Buscar cliente por nombre', 'Busca uno o varios clientes cuyo nombre coincida');
    this.clientService = clientService;
  }

  async execute(nombre) {
    return await this.clientService.findByName(nombre);
  }
}

export default FindClientByNameCommand;