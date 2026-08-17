import CreateClientCommand from './createClientCommand.js';

class CommandFactory {
  constructor(services) {
    this.services = services;
  }

  create(commandName) {
    switch (commandName) {
      case 'crear-cliente':
        return new CreateClientCommand(this.services.clientService);
      default:
        throw new Error(`No existe ningún comando llamado "${commandName}".`);
    }
  }
}

export default CommandFactory;