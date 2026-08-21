import inquirer from 'inquirer';
import Table from 'cli-table3';
import chalk from 'chalk';
import ora from 'ora';
import { exito, mostrarError } from '../utils/format.js';
import { validarMonto } from '../utils/prompts.js';

const NUMERIC_ID_REGEX = /^[0-9]+$/;

const validateNumericId = (val) => {
  const clean = val?.trim();
  const num = Number(clean);
  if (!clean || isNaN(num) || num <= 0 || !Number.isInteger(num)) return 'El ID debe ser un número entero positivo (ej: 1, 2, 3).';
  return true;
};

export async function financialMenu(commandFactory) {
  let mainLoop = true;
  while (mainLoop) {
    const { action } = await inquirer.prompt([
      { type: 'select', name: 'action', message: '--- GESTIÓN DE FINANZAS ---',
        choices: [
          { name: '1. Registrar Transacción (Ingreso / Egreso)', value: 'CREATE_TX' },
          { name: '2. Consultar Balance General / Filtros', value: 'BALANCE' },
          { name: '3. Gestionar Estado/Eliminación de Entregables (Rollback)', value: 'DELIVERABLE_ACTION' },
          { name: '4. Resumen Financiero por Cliente (por ID o nombre)', value: 'CLIENT_SUMMARY' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ] },
    ]);
    try {
      switch (action) {
        case 'CREATE_TX': {
          const r = await inquirer.prompt([
            { type: 'select', name: 'type', message: 'Tipo de transacción:', choices: ['INCOME', 'EXPENSE'] },
            { type: 'input', name: 'amount', message: 'Monto:', validate: validarMonto },
            { type: 'input', name: 'reference', message: 'Referencia / Código único (Opcional, Enter para omitir):' },
            { type: 'input', name: 'clientId', message: 'ID del cliente asociado (Opcional, Enter para omitir):',
              validate: async (val) => {
                if (!val || !val.trim()) return true;
                const clean = val.trim();
                if (!NUMERIC_ID_REGEX.test(clean)) return 'El ID del cliente debe ser un número entero positivo.';
                try {
                  const clientes = await commandFactory.create('listar-clientes').execute();
                  const existe = clientes.some((c) => Number(c.id) === Number(clean));
                  if (!existe) return `No existe ningún cliente con el ID "${clean}".`;
                } catch {}
                return true;
              } },
            { type: 'input', name: 'deliverableId', message: 'ID del entregable asociado (Opcional, Enter para omitir):',
              validate: async (val) => {
                if (!val || !val.trim()) return true;
                const clean = val.trim();
                if (!NUMERIC_ID_REGEX.test(clean)) return 'El ID del entregable debe ser un número entero positivo.';
                try {
                  const entregables = await commandFactory.create('listar-entregables').execute();
                  const existe = entregables.some((e) => Number(e.id) === Number(clean));
                  if (!existe) return `No existe ningún entregable con el ID "${clean}".`;
                } catch {}
                return true;
              } },
          ]);
          const data = { type: r.type, amount: Number(r.amount) };
          if (r.reference) data.reference = r.reference;
          if (r.clientId) data.clientId = r.clientId;
          if (r.deliverableId) data.deliverableId = r.deliverableId;

          const comando = commandFactory.create('crear-transaccion');
          const tx = await comando.execute(data);
          console.log(`\n${exito(`Transacción financiera procesada bajo transacción ACID. ID: ${tx.id}`)}\n`);
          break;
        }
        case 'BALANCE': {
          const filters = await inquirer.prompt([
            { type: 'input', name: 'clientId', message: 'ID Cliente (Dejar vacío para todos):' },
            { type: 'input', name: 'startDate', message: 'Fecha Inicio YYYY-MM-DD (Opcional, Enter para omitir):' },
            { type: 'input', name: 'endDate', message: 'Fecha Fin YYYY-MM-DD (Opcional, Enter para omitir):' },
          ]);
          const comando = commandFactory.create('consultar-balance');
          const summary = await comando.execute({ clientId: filters.clientId || null, startDate: filters.startDate || null, endDate: filters.endDate || null });
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
            { type: 'input', name: 'deliverableId', message: 'ID del Entregable:', validate: validateNumericId },
            { type: 'select', name: 'deliverableAction', message: 'Acción a realizar:', choices: [{ name: 'Cambiar Estado', value: 'CHANGE_STATUS' }, { name: 'Eliminar Entregable', value: 'DELETE' }] },
            { type: 'select', name: 'newStatus', message: 'Seleccione nuevo estado:', when: (a) => a.deliverableAction === 'CHANGE_STATUS', choices: ['pendiente', 'entregado', 'aprobado', 'rechazado'] },
          ]);
          const comando = commandFactory.create('gestionar-entregable-financiero');
          await comando.execute({ deliverableId: Number(deliverableId.trim()), action: deliverableAction, newStatus });
          console.log(`\n${exito('Operación sobre el entregable y rollback financiero ejecutados con éxito.')}\n`);
          break;
        }
        case 'CLIENT_SUMMARY': {
          const { busqueda } = await inquirer.prompt([
            { type: 'input', name: 'busqueda', message: 'ID o nombre del cliente:', validate: (v) => (v && v.trim() ? true : 'Este campo es obligatorio.') },
          ]);
          const clean = busqueda.trim();
          let cliente;

          if (NUMERIC_ID_REGEX.test(clean)) {
            cliente = await commandFactory.create('buscar-cliente').execute(Number(clean));
          } else {
            const coincidencias = await commandFactory.create('buscar-cliente-nombre').execute(clean);
            if (coincidencias.length > 1) {
              console.log(chalk.yellow('\nSe encontró más de un cliente con ese nombre:'));
              const tablaCoincidencias = new Table({ head: ['ID', 'Nombre', 'Email'] });
              coincidencias.forEach((c) => tablaCoincidencias.push([c.id, c.nombre, c.email]));
              console.log(tablaCoincidencias.toString());
              console.log(chalk.yellow('\nVuelve a intentar usando el ID exacto de la lista de arriba.\n'));
              break;
            }
            cliente = coincidencias[0];
          }

          const spinner = ora('Consultando información financiera con agregación de MongoDB...').start();
          let resumen;
          try {
            resumen = await commandFactory.create('resumen-financiero-cliente').execute(cliente.id);
            spinner.succeed('Resumen generado con éxito.');
          } catch (e) {
            spinner.fail('No se pudo generar el resumen.');
            throw e;
          }

          console.log('\n--- Resumen Financiero del Cliente ---');
          const tabla = new Table({ head: ['Campo', 'Valor'] });
          tabla.push(
            { 'Cliente': `${cliente.nombre} (ID: ${cliente.id})` },
            { 'Total Ingresos': chalk.green(`$${resumen.totalIngresos.toFixed(2)}`) },
            { 'Total Egresos': chalk.red(`$${resumen.totalEgresos.toFixed(2)}`) },
            { 'Balance Neto': (resumen.balanceNeto >= 0 ? chalk.green : chalk.red)(`$${resumen.balanceNeto.toFixed(2)}`) },
          );
          console.log(tabla.toString());
          console.log();
          break;
        }
        case 'BACK': mainLoop = false; break;
      }
    } catch (e) { mostrarError(e); }
  }
}