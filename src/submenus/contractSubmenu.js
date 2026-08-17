import inquirer from 'inquirer';
import { formatEstado, formatFecha, formatMoneda, exito, error } from '../utils/format.js';

export async function contractMenu(commandFactory) {
  let mainLoop = true;

  while (mainLoop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '--- GESTIÓN DE CONTRATOS ---',
        choices: [
          { name: '1. Registrar nuevo contrato', value: 'CREATE' },
          { name: '2. Listar todos los contratos', value: 'LIST' },
          { name: '3. Buscar contrato por ID', value: 'FIND' },
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
          console.table(
            contratos.map((c) => ({
              id: c._id.toString(),
              fechaInicio: formatFecha(c.fechaInicio),
              fechaFin: formatFecha(c.fechaFin),
              valorTotal: formatMoneda(c.valorTotal),
              status: formatEstado(c.status),
            })),
          );
          break;
        }

        case 'FIND': {
          const { id } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del contrato:' },
          ]);
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

        case 'BACK':
          mainLoop = false;
          break;
      }
    } catch (e) {
      console.error(`\n${error(e.message)}\n`);
    }
  }
}