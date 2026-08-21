import inquirer from 'inquirer';
import Table from 'cli-table3';
import { formatEstado, formatFecha, exito, error, mostrarError } from '../utils/format.js';
import { preguntasFecha, armarFecha } from '../utils/prompts.js';
import { NUMERIC_ID_REGEX } from '../models/deliverables.js';

const validateNumericId = (val) => {
  const clean = val?.trim();
  const num = Number(clean);
  if (!clean || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return error('El ID debe ser un número entero positivo (ej: 1, 2, 3).');
  }
  return true;
};

export async function deliverableMenu(commandFactory) {
  let mainLoop = true;
  while (mainLoop) {
    const { action } = await inquirer.prompt([
      { type: 'select', name: 'action', message: '--- GESTIÓN DE ENTREGABLES ---',
        choices: [
          { name: '1. Registrar nuevo entregable', value: 'CREATE' },
          { name: '2. Listar todos los entregables', value: 'LIST' },
          { name: '3. Buscar entregable por ID', value: 'FIND' },
          { name: '4. Actualizar entregable', value: 'UPDATE' },
          { name: '5. Eliminar entregable', value: 'DELETE' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ] },
    ]);
    try {
      switch (action) {
        case 'CREATE': {
          const r = await inquirer.prompt([
            { type: 'input', name: 'projectId', message: 'ID del proyecto:',
              validate: async (val) => {
                const clean = val?.trim();
                if (!NUMERIC_ID_REGEX.test(clean)) return error('El ID del proyecto debe ser un número entero positivo.');
                try {
                  const proyectos = await commandFactory.create('listar-proyectos').execute();
                  const existe = proyectos.some((p) => Number(p.id) === Number(clean));
                  if (!existe) return error(`No existe ningún proyecto con el ID "${clean}".`);
                } catch {}
                return true;
              } },
            { type: 'input', name: 'descripcion', message: 'Descripción del entregable:', validate: (val) => (val && val.trim() ? true : error('La descripción es obligatoria.')) },
            ...preguntasFecha('límite del entregable', 'limite'),
          ]);
          const datos = {
            projectId: r.projectId,
            descripcion: r.descripcion,
            fechaLimite: armarFecha(r.limiteDia, r.limiteMes, r.limiteAnio),
          };
          const comando = commandFactory.create('crear-entregable');
          const creado = await comando.execute(datos);
          console.log(`\n${exito(`Entregable registrado con éxito. ID: ${creado.id}`)}\n`);
          break;
        }
        case 'LIST': {
          const comando = commandFactory.create('listar-entregables');
          const entregables = await comando.execute();
          console.log('\n--- Lista de Entregables ---');
          const table = new Table({ head: ['ID', 'ID Proyecto', 'Descripción', 'Fecha Límite', 'Estado'] });
          entregables.forEach((e) => table.push([(e.id ?? e._id).toString(), e.projectId.toString(), e.descripcion, formatFecha(e.fechaLimite), formatEstado(e.status)]));
          console.log(table.toString());
          break;
        }
        case 'FIND': {
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del entregable:', validate: validateNumericId }]);
          const comando = commandFactory.create('buscar-entregable');
          const entregable = await comando.execute(Number(id.trim()));
          console.log('\n--- Información del Entregable ---');
          console.log({ ...entregable, fechaLimite: formatFecha(entregable.fechaLimite), status: formatEstado(entregable.status) });
          break;
        }
        case 'UPDATE': {
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del entregable a actualizar:', validate: validateNumericId }]);
          const campos = await inquirer.prompt([
            { type: 'input', name: 'descripcion', message: 'Nueva descripción (Enter para no cambiar):' },
            { type: 'select', name: 'status', message: 'Nuevo estado:', choices: ['(no cambiar)', 'pendiente', 'entregado', 'aprobado', 'rechazado'] },
          ]);
          const data = {};
          if (campos.descripcion) data.descripcion = campos.descripcion;
          if (campos.status !== '(no cambiar)') data.status = campos.status;
          const comando = commandFactory.create('actualizar-entregable');
          await comando.execute({ id: Number(id.trim()), data });
          console.log(`\n${exito('Entregable actualizado con éxito.')}\n`);
          break;
        }
        case 'DELETE': {
          const { id, confirmar } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del entregable a eliminar:', validate: validateNumericId },
            { type: 'confirm', name: 'confirmar', message: '¿Confirma que desea eliminar este entregable?', default: false },
          ]);
          if (!confirmar) { console.log('\nOperación cancelada.\n'); break; }
          const comando = commandFactory.create('eliminar-entregable');
          await comando.execute(Number(id.trim()));
          console.log(`\n${exito('Entregable eliminado con éxito.')}\n`);
          break;
        }
        case 'BACK': mainLoop = false; break;
      }
    } catch (e) { mostrarError(e); }
  }
}