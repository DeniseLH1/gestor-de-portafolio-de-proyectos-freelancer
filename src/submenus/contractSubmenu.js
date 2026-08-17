import inquirer from 'inquirer';
import Table from 'cli-table3';
import { formatEstado, formatFecha, formatMoneda, exito, error } from '../utils/format.js';

export async function contractMenu(commandFactory) {
  let mainLoop = true;

  while (mainLoop) {
    const { action } = await inquirer.prompt([
      {
        type: 'select',
        name: 'action',
        message: '--- GESTIÓN DE CONTRATOS ---',
        choices: [
          { name: '1. Registrar nuevo contrato', value: 'CREATE' },
          { name: '2. Listar todos los contratos', value: 'LIST' },
          { name: '3. Buscar contrato por ID', value: 'FIND' },
          { name: '4. Actualizar contrato', value: 'UPDATE' },
          { name: '5. Eliminar contrato', value: 'DELETE' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ],
      },
    ]);

    try {
      switch (action) {
        case 'CREATE': {
          const datos = await inquirer.prompt([
            { type: 'input', name: 'projectId', message: 'ID del proyecto:' },
            { type: 'input', name: 'clientId', message: 'ID del cliente:' },
            { type: 'input', name: 'fechaInicio', message: 'Fecha de inicio (YYYY-MM-DD):' },
            { type: 'input', name: 'fechaFin', message: 'Fecha de fin (YYYY-MM-DD):' },
            { type: 'number', name: 'valorTotal', message: 'Valor total:' },
            { type: 'input', name: 'condiciones', message: 'Condiciones del contrato:' },
          ]);
          const comando = commandFactory.create('crear-contrato');
          const creado = await comando.execute(datos);
          console.log(`\n${exito(`Contrato registrado con éxito. ID: ${creado._id}`)}\n`);
          break;
        }

        case 'LIST': {
          const comando = commandFactory.create('listar-contratos');
          const contratos = await comando.execute();
          console.log('\n--- Lista de Contratos ---');
          const table = new Table({ head: ['ID', 'Fecha Inicio', 'Fecha Fin', 'Valor Total', 'Estado'] });
          contratos.forEach((c) => {
            table.push([
              c._id.toString(),
              formatFecha(c.fechaInicio),
              formatFecha(c.fechaFin),
              formatMoneda(c.valorTotal),
              formatEstado(c.status),
            ]);
          });
          console.log(table.toString());
          break;
        }

        case 'FIND': {
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del contrato:' }]);
          const comando = commandFactory.create('buscar-contrato');
          const contrato = await comando.execute(id);
          console.log('\n--- Información del Contrato ---');
          console.log({
            ...contrato,
            fechaInicio: formatFecha(contrato.fechaInicio),
            fechaFin: formatFecha(contrato.fechaFin),
            valorTotal: formatMoneda(contrato.valorTotal),
            status: formatEstado(contrato.status),
          });
          break;
        }

        case 'UPDATE': {
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del contrato a actualizar:' }]);
          const campos = await inquirer.prompt([
            { type: 'input', name: 'condiciones', message: 'Nuevas condiciones (Enter para no cambiar):' },
            { type: 'input', name: 'valorTotal', message: 'Nuevo valor total (Enter para no cambiar):' },
          ]);
          const data = {};
          if (campos.condiciones) data.condiciones = campos.condiciones;
          if (campos.valorTotal) data.valorTotal = Number(campos.valorTotal);
          const comando = commandFactory.create('actualizar-contrato');
          await comando.execute({ id, data });
          console.log(`\n${exito('Contrato actualizado con éxito.')}\n`);
          break;
        }

        case 'DELETE': {
          const { id, confirmar } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del contrato a eliminar:' },
            { type: 'confirm', name: 'confirmar', message: '¿Confirma que desea eliminar este contrato?', default: false },
          ]);
          if (!confirmar) {
            console.log('\nOperación cancelada.\n');
            break;
          }
          const comando = commandFactory.create('eliminar-contrato');
          await comando.execute(id);
          console.log(`\n${exito('Contrato eliminado con éxito.')}\n`);
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