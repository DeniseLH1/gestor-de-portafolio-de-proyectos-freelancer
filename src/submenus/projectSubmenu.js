import inquirer from 'inquirer';
import Table from 'cli-table3';
import { formatEstado, formatFecha, formatMoneda, exito, error } from '../utils/format.js';
import { validarMonto } from '../utils/prompts.js';
import { NUMERIC_ID_REGEX } from '../models/project.js';

const validateNumericId = (val) => {
  const clean = val?.trim();
  const num = Number(clean);
  if (!clean || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return error('El ID debe ser un número entero positivo (ej: 1, 2, 3).');
  }
  return true;
};

const validarDia = (v) => { const n = Number(v); return (Number.isInteger(n) && n >= 1 && n <= 31) || error('Ingresa un día válido, entre 1 y 31.'); };
const validarMes = (v) => { const n = Number(v); return (Number.isInteger(n) && n >= 1 && n <= 12) || error('Ingresa un mes válido, entre 1 y 12.'); };
const validarAnio = (v) => { const n = Number(v); return (Number.isInteger(n) && n >= 2000 && n <= 2100) || error('Ingresa un año válido.'); };
const armarFecha = (dia, mes, anio) => `${anio}-${String(Number(mes)).padStart(2, '0')}-${String(Number(dia)).padStart(2, '0')}`;

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
          const r = await inquirer.prompt([
            { type: 'input', name: 'name', message: 'Nombre del proyecto:', validate: (v) => (v && v.trim() ? true : error('El nombre es obligatorio.')) },
            {
              type: 'input',
              name: 'clientId',
              message: 'ID del Cliente:',
              validate: async (val) => {
                const clean = val?.trim();
                if (!NUMERIC_ID_REGEX.test(clean)) return error('El ID del cliente debe ser un número entero positivo.');
                try {
                  const clientes = await commandFactory.create('listar-clientes').execute();
                  const existe = clientes.some((c) => Number(c.id) === Number(clean));
                  if (!existe) return error(`No existe ningún cliente con el ID "${clean}".`);
                } catch {}
                return true;
              },
            },
            { type: 'number', name: 'budget', message: 'Presupuesto inicial:', validate: validarMonto },
            { type: 'input', name: 'diaInicio', message: 'Día de inicio del proyecto (1-31):', validate: validarDia },
            { type: 'input', name: 'mesInicio', message: 'Mes de inicio del proyecto (1-12):', validate: validarMes },
            { type: 'input', name: 'anioInicio', message: 'Año de inicio del proyecto (ej. 2026):', validate: validarAnio },
            { type: 'input', name: 'diaFin', message: 'Día de fin estimado (1-31):', validate: validarDia },
            { type: 'input', name: 'mesFin', message: 'Mes de fin estimado (1-12):', validate: validarMes },
            { type: 'input', name: 'anioFin', message: 'Año de fin estimado (ej. 2026):', validate: validarAnio },
          ]);

          const data = {
            name: r.name,
            clientId: r.clientId,
            budget: r.budget,
            startDate: armarFecha(r.diaInicio, r.mesInicio, r.anioInicio),
            endDate: armarFecha(r.diaFin, r.mesFin, r.anioFin),
          };

          const comando = commandFactory.create('crear-proyecto');
          const proyecto = await comando.execute(data);
          console.log(`\n${exito(`Proyecto registrado con éxito. ID: ${proyecto.id}`)}\n`);
          break;
        }

        case 'LIST': {
          const comando = commandFactory.create('listar-proyectos');
          const proyectos = await comando.execute();
          console.log('\n--- Lista de Proyectos ---');
          const table = new Table({ head: ['ID', 'Nombre', 'ID Cliente', 'Presupuesto', 'Estado', 'Fecha Inicio'] });
          proyectos.forEach((p) => {
            table.push([
              (p.id ?? p._id).toString(),
              p.name,
              p.clientId.toString(),
              formatMoneda(p.budget),
              formatEstado(p.status),
              formatFecha(p.startDate),
            ]);
          });
          console.log(table.toString());
          break;
        }

        case 'BY_CLIENT': {
          const { clientId } = await inquirer.prompt([
            { type: 'input', name: 'clientId', message: 'ID del Cliente:', validate: validateNumericId },
          ]);
          const comando = commandFactory.create('listar-proyectos-cliente');
          const proyectos = await comando.execute(Number(clientId.trim()));
          console.log('\n--- Proyectos del Cliente ---');
          const table = new Table({ head: ['ID', 'Nombre', 'Presupuesto', 'Estado', 'Fecha Inicio'] });
          proyectos.forEach((p) => {
            table.push([
              (p.id ?? p._id).toString(),
              p.name,
              formatMoneda(p.budget),
              formatEstado(p.status),
              formatFecha(p.startDate),
            ]);
          });
          console.log(table.toString());
          break;
        }

        case 'UPDATE_STATUS': {
          const { id, status } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del Proyecto:', validate: validateNumericId },
            {
              type: 'select',
              name: 'status',
              message: 'Seleccione el nuevo estado:',
              choices: ['Planificado', 'En progreso', 'En espera', 'Completado', 'Cancelado'],
            },
          ]);
          const comando = commandFactory.create('actualizar-estado-proyecto');
          await comando.execute({ id: Number(id.trim()), status });
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