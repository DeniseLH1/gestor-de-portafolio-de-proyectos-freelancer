import inquirer from 'inquirer';
import Table from 'cli-table3';
import { formatEstado, formatMoneda, exito, error } from '../utils/format.js';
import { validarMonto } from '../utils/prompts.js';
import { NUMERIC_ID_REGEX } from '../models/proposal.js';

const validateNumericId = (val) => {
  const clean = val?.trim();
  const num = Number(clean);
  if (!clean || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return error('El ID debe ser un número entero positivo (ej: 1, 2, 3).');
  }
  return true;
};

export async function proposalMenu(commandFactory) {
  let mainLoop = true;
  while (mainLoop) {
    const { action } = await inquirer.prompt([
      { type: 'select', name: 'action', message: '--- GESTIÓN DE PROPUESTAS ---',
        choices: [
          { name: '1. Crear propuesta', value: 'CREATE' },
          { name: '2. Listar propuestas por cliente', value: 'LIST_BY_CLIENT' },
          { name: '3. Cambiar estado de propuesta', value: 'UPDATE_STATUS' },
          { name: '4. Convertir propuesta aceptada a proyecto', value: 'CONVERT' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ] },
    ]);
    try {
      switch (action) {
        case 'CREATE': {
          const data = await inquirer.prompt([
            { type: 'input', name: 'clientId', message: 'ID del Cliente:',
              validate: async (val) => {
                const clean = val?.trim();
                if (!NUMERIC_ID_REGEX.test(clean)) return error('El ID del cliente debe ser un número entero positivo.');
                try {
                  const clientes = await commandFactory.create('listar-clientes').execute();
                  const existe = clientes.some((c) => Number(c.id) === Number(clean));
                  if (!existe) return error(`No existe ningún cliente con el ID "${clean}".`);
                } catch {}
                return true;
              } },
            { type: 'input', name: 'title', message: 'Título de la propuesta:', validate: (val) => (val && val.trim() ? true : error('El título es obligatorio.')) },
            { type: 'number', name: 'amount', message: 'Monto de la propuesta:', validate: validarMonto },
          ]);
          const comando = commandFactory.create('crear-propuesta');
          const propuesta = await comando.execute(data);
          console.log(`\n${exito(`Propuesta creada con éxito. ID: ${propuesta.id}`)}\n`);
          break;
        }
        case 'LIST_BY_CLIENT': {
          const { clientId } = await inquirer.prompt([{ type: 'input', name: 'clientId', message: 'ID del Cliente:', validate: validateNumericId }]);
          const comando = commandFactory.create('listar-propuestas-cliente');
          const propuestas = await comando.execute(Number(clientId.trim()));
          console.log('\n--- Propuestas del Cliente ---');
          const table = new Table({ head: ['ID', 'Título', 'Monto', 'Estado'] });
          propuestas.forEach((p) => table.push([(p.id ?? p._id).toString(), p.title, formatMoneda(p.amount), formatEstado(p.status)]));
          console.log(table.toString());
          break;
        }
        case 'UPDATE_STATUS': {
          const { id, newStatus } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID de la propuesta:', validate: validateNumericId },
            { type: 'select', name: 'newStatus', message: 'Seleccione el nuevo estado:', choices: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'] },
          ]);
          const comando = commandFactory.create('actualizar-estado-propuesta');
          await comando.execute({ id: Number(id.trim()), newStatus });
          console.log(`\n${exito(`Estado actualizado a "${newStatus}" correctamente.`)}\n`);
          break;
        }
        case 'CONVERT': {
          const { proposalId } = await inquirer.prompt([{ type: 'input', name: 'proposalId', message: 'ID de la propuesta aceptada:', validate: validateNumericId }]);
          const comando = commandFactory.create('convertir-propuesta');
          const nuevoProyecto = await comando.execute(Number(proposalId.trim()));
          console.log(`\n${exito(`Propuesta convertida en Proyecto. Nuevo ID de Proyecto: ${nuevoProyecto.id}`)}\n`);
          break;
        }
        case 'BACK': mainLoop = false; break;
      }
    } catch (e) { console.error(`\n${error(e.message)}\n`); }
  }
}