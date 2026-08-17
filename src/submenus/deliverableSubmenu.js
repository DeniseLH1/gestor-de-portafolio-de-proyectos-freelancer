import inquirer from 'inquirer';
import { formatEstado, formatFecha, exito, error } from '../utils/format.js';

export async function deliverableMenu(commandFactory) {
  let mainLoop = true;

  while (mainLoop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '--- GESTIÓN DE ENTREGABLES ---',
        choices: [
          { name: '1. Registrar nuevo entregable', value: 'CREATE' },
          { name: '2. Listar todos los entregables', value: 'LIST' },
          { name: '3. Buscar entregable por ID', value: 'FIND' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ],
      },
    ]);

    try {
      switch (action) {
        case 'CREATE': {
          const datos = await inquirer.prompt([
            { type: 'input', name: 'projectId', message: 'ID del proyecto:' },
            { type: 'input', name: 'descripcion', message: 'Descripción del entregable:' },
            { type: 'input', name: 'fechaLimite', message: 'Fecha límite (YYYY-MM-DD):' },
          ]);

          const comando = commandFactory.create('crear-entregable');
          const creado = await comando.execute(datos);
          console.log(`\n${exito(`Entregable registrado con éxito. ID: ${creado._id}`)}\n`);
          break;
        }

        case 'LIST': {
          const comando = commandFactory.create('listar-entregables');
          const entregables = await comando.execute();
          console.log('\n--- Lista de Entregables ---');
          console.table(
            entregables.map((e) => ({
              id: e._id.toString(),
              descripcion: e.descripcion,
              fechaLimite: formatFecha(e.fechaLimite),
              status: formatEstado(e.status),
            })),
          );
          break;
        }

        case 'FIND': {
          const { id } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del entregable:' },
          ]);
          const comando = commandFactory.create('buscar-entregable');
          const entregable = await comando.execute(id);
          console.log('\n--- Información del Entregable ---');
          console.log({
            ...entregable,
            fechaLimite: formatFecha(entregable.fechaLimite),
            status: formatEstado(entregable.status),
          });
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