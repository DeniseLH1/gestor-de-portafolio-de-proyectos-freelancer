import inquirer from 'inquirer';
import connectDB from '../../config/db.js';
import { ClientRepository } from '../repositories/clientRepository.js';
import { ContractRepository } from '../repositories/contractRepository.js';
import { DeliverableRepository } from '../repositories/deliverableRepository.js';
import { ProjectRepository } from '../repositories/projectRepository.js';
import ClientService from '../services/clientService.js';
import ContractService from '../services/contractService.js';
import DeliverableService from '../services/deliverableService.js';
import CommandFactory from '../commands/commandFactory.js';
import { clientMenu } from './clientSubmenu.js';
import { contractMenu } from './contractSubmenu.js';
import { deliverableMenu } from './deliverableSubmenu.js';

export async function mainMenu() {
  const db = await connectDB();

  const clientRepository = new ClientRepository(db);
  const contractRepository = new ContractRepository(db);
  const deliverableRepository = new DeliverableRepository(db);
  const projectRepository = new ProjectRepository(db);

  const clientService = new ClientService(clientRepository);
  const contractService = new ContractService(contractRepository, projectRepository, clientRepository);
  const deliverableService = new DeliverableService(deliverableRepository, projectRepository);

  const commandFactory = new CommandFactory({ clientService, contractService, deliverableService });

  let mainLoop = true;

  while (mainLoop) {
    const { section } = await inquirer.prompt([
      {
        type: 'list',
        name: 'section',
        message: '=== GESTOR DE PORTAFOLIO FREELANCER ===',
        choices: [
          { name: '1. Clientes', value: 'CLIENTS' },
          { name: '2. Contratos', value: 'CONTRACTS' },
          { name: '3. Entregables', value: 'DELIVERABLES' },
          { name: '4. Propuestas (próximamente)', value: 'PROPOSALS' },
          { name: '5. Proyectos (próximamente)', value: 'PROJECTS' },
          { name: '6. Finanzas (próximamente)', value: 'FINANCIAL' },
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
      case 'PROJECTS':
      case 'FINANCIAL':
        console.log('\nEsta sección todavía está en construcción.\n');
        break;
      case 'EXIT':
        mainLoop = false;
        console.log('\n¡Hasta pronto!\n');
        break;
    }
  }
}