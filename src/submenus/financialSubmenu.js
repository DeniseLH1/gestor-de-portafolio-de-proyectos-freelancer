import inquirer from 'inquirer';
import { exito, error } from '../utils/format.js';

export async function financialMenu(commandFactory) {
  let mainLoop = true;

  while (mainLoop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '--- MÓDULO FINANCIERO ---',
        choices: [
          { name: '1. Registrar Transacción (Ingreso / Egreso)', value: 'CREATE_TX' },
          { name: '2. Consultar Balance General / Filtros', value: 'BALANCE' },
          { name: '3. Gestionar Estado/Eliminación de Entregables (Rollback)', value: 'DELIVERABLE_ACTION' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ],
      },
    ]);

    try {
      switch (action) {
        case 'CREATE_TX': {
          const data = await inquirer.prompt([
            {
              type: 'list',
              name: 'type',
              message: 'Tipo de transacción:',
              choices: ['INCOME', 'EXPENSE'],
            },
            { type: 'number', name: 'amount', message: 'Monto:' },
            { type: 'input', name: 'reference', message: 'Referencia / Código único (Opcional):' },
            { type: 'input', name: 'clientId', message: 'ID del cliente asociado (Opcional):' },
            { type: 'input', name: 'deliverableId', message: 'ID del entregable asociado (Opcional):' },
          ]);
          if (!data.reference) delete data.reference;
          if (!data.clientId) delete data.clientId;
          if (!data.deliverableId) delete data.deliverableId;

          const comando = commandFactory.create('crear-transaccion');
          const tx = await comando.execute(data);
          console.log(`\n${exito(`Transacción financiera procesada bajo transacción ACID. ID: ${tx._id}`)}\n`);
          break;
        }

        case 'BALANCE': {
          const filters = await inquirer.prompt([
            { type: 'input', name: 'clientId', message: 'ID Cliente (Dejar vacío para todos):' },
            { type: 'input', name: 'startDate', message: 'Fecha Inicio YYYY-MM-DD (Opcional):' },
            { type: 'input', name: 'endDate', message: 'Fecha Fin YYYY-MM-DD (Opcional):' },
          ]);

          const comando = commandFactory.create('consultar-balance');
          const summary = await comando.execute({
            clientId: filters.clientId || null,
            startDate: filters.startDate || null,
            endDate: filters.endDate || null,
          });

          console.log('\n================ RESUMEN FINANCIERO ================');
          console.log(` Ingresos Totales :  $${summary.totalIncome}`);
          console.log(` Egresos Totales  :  $${summary.totalExpenses}`);
          console.log(` Balance Neto     :  $${summary.netBalance}`);
          console.log(` Transacciones    :  ${summary.transactionCount}`);
          console.log('====================================================\n');
          break;
        }

        case 'DELIVERABLE_ACTION': {
          const { deliverableId, deliverableAction, newStatus } = await inquirer.prompt([
            { type: 'input', name: 'deliverableId', message: 'ID del Entregable:' },
            {
              type: 'list',
              name: 'deliverableAction',
              message: 'Acción a realizar:',
              choices: [
                { name: 'Cambiar Estado', value: 'CHANGE_STATUS' },
                { name: 'Eliminar Entregable', value: 'DELETE' },
              ],
            },
            {
              type: 'list',
              name: 'newStatus',
              message: 'Seleccione nuevo estado:',
              when: (answers) => answers.deliverableAction === 'CHANGE_STATUS',
              choices: ['pendiente', 'entregado', 'aprobado', 'rechazado'],
            },
          ]);

          const comando = commandFactory.create('gestionar-entregable-financiero');
          await comando.execute({ deliverableId, action: deliverableAction, newStatus });

          console.log(`\n${exito('Operación sobre el entregable y rollback financiero ejecutados con éxito.')}\n`);
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