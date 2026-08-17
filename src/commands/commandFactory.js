import CreateClientCommand from './createClientCommand.js';
import ListClientsCommand from './listClientsCommand.js';
import FindClientCommand from './findClientCommand.js';
import CreateContractCommand from './createContractCommand.js';
import ListContractsCommand from './listContractsCommand.js';
import FindContractCommand from './findContractCommand.js';
import CreateDeliverableCommand from './createDeliverableCommand.js';
import ListDeliverablesCommand from './listDeliverablesCommand.js';
import FindDeliverableCommand from './findDeliverableCommand.js';

class CommandFactory {
  constructor(services) {
    this.services = services;
  }

  create(commandName) {
    switch (commandName) {
      case 'crear-cliente':
        return new CreateClientCommand(this.services.clientService);
      case 'listar-clientes':
        return new ListClientsCommand(this.services.clientService);
      case 'buscar-cliente':
        return new FindClientCommand(this.services.clientService);
      case 'crear-contrato':
        return new CreateContractCommand(this.services.contractService);
      case 'listar-contratos':
        return new ListContractsCommand(this.services.contractService);
      case 'buscar-contrato':
        return new FindContractCommand(this.services.contractService);
      case 'crear-entregable':
        return new CreateDeliverableCommand(this.services.deliverableService);
      case 'listar-entregables':
        return new ListDeliverablesCommand(this.services.deliverableService);
      case 'buscar-entregable':
        return new FindDeliverableCommand(this.services.deliverableService);
      default:
        throw new Error(`No existe ningún comando llamado "${commandName}".`);
    }
  }
}

export default CommandFactory;