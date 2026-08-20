import inquirer from 'inquirer';
import Table from 'cli-table3';
import { formatEstado, formatFecha, formatMoneda, exito, error, mostrarError } from '../utils/format.js';
import { preguntasFecha, armarFecha, validarMonto } from '../utils/prompts.js';
import { CLIENT_ID_REGEX, PROJECT_ID_REGEX } from '../models/contracts.js';

const validateNumericId = (val) => {
  const clean = val?.trim();
  const num = Number(clean);
  if (!clean || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return error('El ID debe ser un número entero positivo (ej: 1, 2, 3).');
  }
  return true;
};

function mostrarFichaContrato(c) {
  const table = new Table({ head: ['Campo', 'Valor'], wordWrap: true });
  table.push(
    { 'ID': (c.id ?? c._id).toString() },
    { 'ID Proyecto': c.projectId.toString() },
    { 'ID Cliente': c.clientId.toString() },
    { 'Fecha Inicio': formatFecha(c.fechaInicio) },
    { 'Fecha Fin': formatFecha(c.fechaFin) },
    { 'Valor Total': formatMoneda(c.valorTotal) },
    { 'Condiciones': c.condiciones },
    { 'Estado': formatEstado(c.status) },
  );
  console.log(table.toString());
}

export async function contractMenu(commandFactory) {
  let mainLoop = true;
  while (mainLoop) {
    const { action } = await inquirer.prompt([
      { type: 'select', name: 'action', message: '--- GESTIÓN DE CONTRATOS ---',
        choices: [
          { name: '1. Registrar nuevo contrato', value: 'CREATE' },
          { name: '2. Listar todos los contratos', value: 'LIST' },
          { name: '3. Buscar contrato por ID', value: 'FIND' },
          { name: '4. Actualizar contrato', value: 'UPDATE' },
          { name: '5. Eliminar contrato', value: 'DELETE' },
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
                if (!PROJECT_ID_REGEX.test(clean)) return error('El ID del proyecto debe ser un número entero positivo.');
                try {
                  const proyectos = await commandFactory.create('listar-proyectos').execute();
                  const existe = proyectos.some((p) => Number(p.id) === Number(clean));
                  if (!existe) return error(`No existe ningún proyecto con el ID "${clean}".`);
                } catch {}
                return true;
              } },
            { type: 'input', name: 'clientId', message: 'ID del cliente:',
              validate: async (val) => {
                const clean = val?.trim();
                if (!CLIENT_ID_REGEX.test(clean)) return error('El ID del cliente debe ser un número entero positivo.');
                try {
                  const clientes = await commandFactory.create('listar-clientes').execute();
                  const existe = clientes.some((c) => Number(c.id) === Number(clean));
                  if (!existe) return error(`No existe ningún cliente con el ID "${clean}".`);
                } catch {}
                return true;
              } },
            ...preguntasFecha('inicio del contrato', 'inicio'),
            ...preguntasFecha('fin del contrato', 'fin'),
            { type: 'number', name: 'valorTotal', message: 'Valor total:', validate: validarMonto },
            { type: 'input', name: 'condiciones', message: 'Condiciones del contrato:', validate: (val) => (val && val.trim() ? true : error('Las condiciones son obligatorias.')) },
          ]);
          const datos = {
            projectId: r.projectId,
            clientId: r.clientId,
            fechaInicio: armarFecha(r.inicioDia, r.inicioMes, r.inicioAnio),
            fechaFin: armarFecha(r.finDia, r.finMes, r.finAnio),
            valorTotal: r.valorTotal,
            condiciones: r.condiciones,
          };
          const comando = commandFactory.create('crear-contrato');
          const creado = await comando.execute(datos);
          console.log(`\n${exito(`Contrato registrado con éxito. ID: ${creado.id}`)}\n`);
          break;
        }
        case 'LIST': {
          const comando = commandFactory.create('listar-contratos');
          const contratos = await comando.execute();
          console.log('\n--- Lista de Contratos ---');
          const table = new Table({ head: ['ID', 'ID Proyecto', 'ID Cliente', 'Fecha Inicio', 'Fecha Fin', 'Valor Total', 'Estado'] });
          contratos.forEach((c) => table.push([(c.id ?? c._id).toString(), c.projectId.toString(), c.clientId.toString(), formatFecha(c.fechaInicio), formatFecha(c.fechaFin), formatMoneda(c.valorTotal), formatEstado(c.status)]));
          console.log(table.toString());
          break;
        }
        case 'FIND': {
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del contrato:', validate: validateNumericId }]);
          const comando = commandFactory.create('buscar-contrato');
          const contrato = await comando.execute(Number(id.trim()));
          mostrarFichaContrato(contrato);
          break;
        }
        case 'UPDATE': {
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del contrato a actualizar:', validate: validateNumericId }]);
          const campos = await inquirer.prompt([
            { type: 'input', name: 'condiciones', message: 'Nuevas condiciones (Enter para no cambiar):' },
            { type: 'input', name: 'valorTotal', message: 'Nuevo valor total (Enter para no cambiar):', validate: (v) => (!v || (!Number.isNaN(Number(v)) && Number(v) > 0)) || error('El monto ingresado no es válido.') },
          ]);
          const data = {};
          if (campos.condiciones) data.condiciones = campos.condiciones;
          if (campos.valorTotal) data.valorTotal = Number(campos.valorTotal);
          const comando = commandFactory.create('actualizar-contrato');
          await comando.execute({ id: Number(id.trim()), data });
          console.log(`\n${exito('Contrato actualizado con éxito.')}\n`);
          break;
        }
        case 'DELETE': {
          const { id, confirmar } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del contrato a eliminar:', validate: validateNumericId },
            { type: 'confirm', name: 'confirmar', message: '¿Confirma que desea eliminar este contrato?', default: false },
          ]);
          if (!confirmar) { console.log('\nOperación cancelada.\n'); break; }
          const comando = commandFactory.create('eliminar-contrato');
          await comando.execute(Number(id.trim()));
          console.log(`\n${exito('Contrato eliminado con éxito.')}\n`);
          break;
        }
        case 'BACK': mainLoop = false; break;
      }
    } catch (e) { mostrarError(e); }
  }
}