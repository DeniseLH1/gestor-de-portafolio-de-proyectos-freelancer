import inquirer from 'inquirer';
import { exito, error } from '../utils/format.js';

export async function proposalMenu(commandFactory) {
  let mainLoop = true;

  while (mainLoop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '--- GESTIÓN DE PROPUESTAS Y PROYECTOS ---',
        choices: [
          { name: '1. Crear propuesta', value: 'CREATE' },
          { name: '2. Listar propuestas por cliente', value: 'LIST_BY_CLIENT' },
          { name: '3. Cambiar estado de propuesta', value: 'UPDATE_STATUS' },
          { name: '4. Convertir propuesta aceptada a proyecto', value: 'CONVERT' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ],
      },
    ]);

    try {
      switch (action) {
        case 'CREATE': {
          const data = await inquirer.prompt([
            { type: 'input', name: 'clientId', message: 'ID del Cliente:' },
            { type: 'input', name: 'title', message: 'Título de la propuesta:' },
            { type: 'number', name: 'amount', message: 'Monto de la propuesta:' },
          ]);
          const comando = commandFactory.create('crear-propuesta');
          const propuesta = await comando.execute(data);
          console.log(`\n${exito(`Propuesta creada con éxito. ID: ${propuesta._id}`)}\n`);
          break;
        }

        case 'LIST_BY_CLIENT': {
          const { clientId } = await inquirer.prompt([
            { type: 'input', name: 'clientId', message: 'ID del Cliente:' },
          ]);
          const comando = commandFactory.create('listar-propuestas-cliente');
          const propuestas = await comando.execute(clientId);
          console.table(propuestas);
          break;
        }

        case 'UPDATE_STATUS': {
          const { id, newStatus } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID de la propuesta:' },
            {
              type: 'list',
              name: 'newStatus',
              message: 'Seleccione el nuevo estado:',
              choices: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
            },
          ]);
          const comando = commandFactory.create('actualizar-estado-propuesta');
          await comando.execute({ id, newStatus });
          console.log(`\n${exito(`Estado actualizado a "${newStatus}" correctamente.`)}\n`);
          break;
        }

        case 'CONVERT': {
          const { proposalId } = await inquirer.prompt([
            { type: 'input', name: 'proposalId', message: 'ID de la propuesta aceptada:' },
          ]);
          const comando = commandFactory.create('convertir-propuesta');
          const nuevoProyecto = await comando.execute(proposalId);
          console.log(`\n${exito(`Propuesta convertida en Proyecto. Nuevo ID de Proyecto: ${nuevoProyecto._id}`)}\n`);
          break;
        }

        case 'BACK':
          mainLoop = false;
          break;
      }
    } catch (e) {
      console.error(`\n${error(e.message)}\n`);
    }
  }
}