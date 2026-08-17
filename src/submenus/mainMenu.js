import inquirer from 'inquirer';
import connectDB, { getClient } from '../../config/db.js';
import { ClientRepository } from '../repositories/clientRepository.js';
import { ContractRepository } from '../repositories/contractRepository.js';
import { DeliverableRepository } from '../repositories/deliverableRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import { ProposalRepository } from '../repositories/proposalRepository.js';
import { FinancialRepository } from '../repositories/financialRepository.js';
import ClientService from '../services/clientService.js';
import ContractService from '../services/contractService.js';
import DeliverableService from '../services/deliverableService.js';
import { ProposalService } from '../services/proposalService.js';
import { ProjectService } from '../services/projectService.js';
import { FinancialTransactionService } from '../services/financialService.js';
import CommandFactory from '../commands/commandFactory.js';
import { clientMenu } from './clientSubmenu.js';
import { contractMenu } from './contractSubmenu.js';
import { deliverableMenu } from './deliverableSubmenu.js';
import { proposalMenu } from './proposalSubmenu.js';
import { projectMenu } from './projectSubmenu.js';
import { financialMenu } from './financialSubmenu.js';

export async function mainMenu() {
  const db = await connectDB();
  const client = getClient();

  const clientRepository = new ClientRepository(db);
  const contractRepository = new ContractRepository(db);
  const deliverableRepository = new DeliverableRepository(db);
  const projectRepository = new ProjectRepository(db);
  const proposalRepository = new ProposalRepository(db);
  const financialRepository = new FinancialRepository(db);

  const clientService = new ClientService(clientRepository);
  const contractService = new ContractService(contractRepository, projectRepository, clientRepository);
  const deliverableService = new DeliverableService(deliverableRepository, projectRepository);
  const proposalService = new ProposalService(proposalRepository, clientRepository);
  const projectService = new ProjectService(projectRepository, clientRepository);
  const financialService = new FinancialTransactionService(financialRepository, deliverableRepository, client);

  const commandFactory = new CommandFactory({
    clientService,
    contractService,
    deliverableService,
    proposalService,
    projectService,
    financialService,
  });

  let mainLoop = true;

  while (mainLoop) {
    const { section } = await inquirer.prompt([
      {
        type: 'select',
        name: 'section',
        message: '=== GESTOR DE PORTAFOLIO FREELANCER ===',
        choices: [
          { name: '1. Clientes', value: 'CLIENTS' },
          { name: '2. Contratos', value: 'CONTRACTS' },
          { name: '3. Entregables', value: 'DELIVERABLES' },
          { name: '4. Propuestas y Conversión a Proyectos', value: 'PROPOSALS' },
          { name: '5. Proyectos', value: 'PROJECTS' },
          { name: '6. Finanzas', value: 'FINANCIAL' },
          { name: 'Salir', value: 'EXIT' },
        ],
      },
    ]);

    switch (section) {
      case 'CLIENTS':
        await clientMenu(commandFactory);
        break;
      case 'CONTRACTS':
        await contractMenu(commandFactory);
        break;
      case 'DELIVERABLES':
        await deliverableMenu(commandFactory);
        break;
      case 'PROPOSALS':
        await proposalMenu(commandFactory);
        break;
      case 'PROJECTS':
        await projectMenu(commandFactory);
        break;
      case 'FINANCIAL':
        await financialMenu(commandFactory);
        break;
      case 'EXIT':
        mainLoop = false;
        console.log('\n¡Hasta pronto!\n');
        break;
    }
  }
}