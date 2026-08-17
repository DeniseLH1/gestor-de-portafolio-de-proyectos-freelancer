import CreateClientCommand from './createClientCommand.js';
import ListClientsCommand from './listClientsCommand.js';
import FindClientCommand from './findClientCommand.js';
import CreateContractCommand from './createContractCommand.js';
import ListContractsCommand from './listContractsCommand.js';
import FindContractCommand from './findContractCommand.js';
import CreateDeliverableCommand from './createDeliverableCommand.js';
import ListDeliverablesCommand from './listDeliverablesCommand.js';
import FindDeliverableCommand from './findDeliverableCommand.js';
import CreateProposalCommand from './createProposalCommand.js';
import ListProposalsByClientCommand from './listProposalsByClientCommand.js';
import UpdateProposalStatusCommand from './updateProposalStatusCommand.js';
import ConvertProposalCommand from './convertProposalCommand.js';
import CreateProjectCommand from './createProjectCommand.js';
import ListProjectsCommand from './listProjectsCommand.js';
import ListProjectsByClientCommand from './listProjectsByClientCommand.js';
import UpdateProjectStatusCommand from './updateProjectStatusCommand.js';
import CreateTransactionCommand from './createTransactionCommand.js';
import GetBalanceCommand from './getBalanceCommand.js';
import HandleDeliverableActionCommand from './handleDeliverableActionCommand.js';

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
      case 'crear-propuesta':
        return new CreateProposalCommand(this.services.proposalService);
      case 'listar-propuestas-cliente':
        return new ListProposalsByClientCommand(this.services.proposalService);
      case 'actualizar-estado-propuesta':
        return new UpdateProposalStatusCommand(this.services.proposalService);
      case 'convertir-propuesta':
        return new ConvertProposalCommand(this.services.proposalService, this.services.projectService);
      case 'crear-proyecto':
        return new CreateProjectCommand(this.services.projectService);
      case 'listar-proyectos':
        return new ListProjectsCommand(this.services.projectService);
      case 'listar-proyectos-cliente':
        return new ListProjectsByClientCommand(this.services.projectService);
      case 'actualizar-estado-proyecto':
        return new UpdateProjectStatusCommand(this.services.projectService);
      case 'crear-transaccion':
        return new CreateTransactionCommand(this.services.financialService);
      case 'consultar-balance':
        return new GetBalanceCommand(this.services.financialService);
      case 'gestionar-entregable-financiero':
        return new HandleDeliverableActionCommand(this.services.financialService);
      default:
        throw new Error(`No existe ningún comando llamado "${commandName}".`);
    }
  }
}

export default CommandFactory;