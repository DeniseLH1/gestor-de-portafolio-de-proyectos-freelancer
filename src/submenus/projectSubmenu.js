import inquirer from 'inquirer';
import { exito, error } from '../utils/format.js';

export async function projectMenu(commandFactory) {
  let mainLoop = true;

  while (mainLoop) {
    const { action } = await inquirer.prompt([
      {
        type: 'select',
        name: 'action',
        message: '--- GESTIÓN DE PROYECTOS Y ENTREGABLES ---',
        choices: [
          { name: '1. Registrar nuevo proyecto', value: 'CREATE' },
          { name: '2. Listar todos los proyectos', value: 'LIST' },
          { name: '3. Buscar proyectos por cliente', value: 'BY_CLIENT' },
          { name: '4. Actualizar estado de proyecto', value: 'UPDATE_STATUS' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ],
      },
    ]);

    try {
      switch (action) {
        case 'CREATE': {
          const data = await inquirer.prompt([
            { type: 'input', name: 'name', message: 'Nombre del proyecto:' },
            { type: 'input', name: 'clientId', message: 'ID del Cliente:' },
            { type: 'number', name: 'budget', message: 'Presupuesto inicial:' },
            { type: 'input', name: 'startDate', message: 'Fecha de inicio (YYYY-MM-DD):' },
            { type: 'input', name: 'endDate', message: 'Fecha estimada fin (YYYY-MM-DD):' },
          ]);
          const comando = commandFactory.create('crear-proyecto');
          const proyecto = await comando.execute(data);
          console.log(`\n${exito(`Proyecto registrado con éxito. ID: ${proyecto._id}`)}\n`);
          break;
        }

        case 'LIST': {
          const comando = commandFactory.create('listar-proyectos');
          const proyectos = await comando.execute();
          console.table(proyectos);
          break;
        }

        case 'BY_CLIENT': {
          const { clientId } = await inquirer.prompt([
            { type: 'input', name: 'clientId', message: 'ID del Cliente:' },
          ]);
          const comando = commandFactory.create('listar-proyectos-cliente');
          const proyectos = await comando.execute(clientId);
          console.table(proyectos);
          break;
        }

        case 'UPDATE_STATUS': {
          const { id, status } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del Proyecto:' },
            {
              type: 'select',
              name: 'status',
              message: 'Seleccione el nuevo estado:',
              choices: ['Planificado', 'En progreso', 'En espera', 'Completado', 'Cancelado'],
            },
          ]);
          const comando = commandFactory.create('actualizar-estado-proyecto');
          await comando.execute({ id, status });
          console.log(`\n${exito(`Estado actualizado a "${status}" con éxito.`)}\n`);
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