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
          { name: '4. Actualizar entregable', value: 'UPDATE' },
          { name: '5. Eliminar entregable', value: 'DELETE' },
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
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del entregable:' }]);
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

        case 'UPDATE': {
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del entregable a actualizar:' }]);
          const campos = await inquirer.prompt([
            { type: 'input', name: 'descripcion', message: 'Nueva descripción (Enter para no cambiar):' },
            {
              type: 'list',
              name: 'status',
              message: 'Nuevo estado:',
              choices: ['(no cambiar)', 'pendiente', 'entregado', 'aprobado', 'rechazado'],
            },
          ]);
          const data = {};
          if (campos.descripcion) data.descripcion = campos.descripcion;
          if (campos.status !== '(no cambiar)') data.status = campos.status;
          const comando = commandFactory.create('actualizar-entregable');
          await comando.execute({ id, data });
          console.log(`\n${exito('Entregable actualizado con éxito.')}\n`);
          break;
        }

        case 'DELETE': {
          const { id, confirmar } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del entregable a eliminar:' },
            { type: 'confirm', name: 'confirmar', message: '¿Confirma que desea eliminar este entregable?', default: false },
          ]);
          if (!confirmar) {
            console.log('\nOperación cancelada.\n');
            break;
          }
          const comando = commandFactory.create('eliminar-entregable');
          await comando.execute(id);
          console.log(`\n${exito('Entregable eliminado con éxito.')}\n`);
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