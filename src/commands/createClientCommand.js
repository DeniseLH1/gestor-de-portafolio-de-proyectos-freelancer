import Command from './command.js';

class CreateClientCommand extends Command {
  constructor(clientService) {
    super('Crear cliente', 'Registra un nuevo cliente en el sistema');
    this.clientService = clientService;
  }

  async execute(datos) {
    return await this.clientService.create(datos);
  }
}

export default CreateClientCommand;