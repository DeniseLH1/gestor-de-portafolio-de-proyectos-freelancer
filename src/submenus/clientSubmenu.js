import inquirer from 'inquirer';
import Table from 'cli-table3';
import { formatEstado, formatFecha, exito, error } from '../utils/format.js';
import { EMAIL_REGEX, TELEFONO_REGEX, DPI_REGEX } from '../models/clients.js';

// Función para validar que la entrada sea un entero positivo
const validateNumericId = (val) => {
  const clean = val?.trim();
  const num = Number(clean);
  if (!clean || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return error('El ID debe ser un número entero positivo (ej: 1, 2, 3).');
  }
  return true;
};

// Función para imprimir la ficha de un solo cliente sin i0, i1...
function mostrarFichaCliente(c) {
  const table = new Table({
    head: ['Campo', 'Valor'],
    wordWrap: true,
  });

  table.push(
    { 'ID': (c.id ?? c._id).toString() },
    { 'Nombre': c.nombre || 'N/A' },
    { 'Email': c.email || 'N/A' },
    { 'Teléfono': c.telefono || 'N/A' },
    { 'DPI': c.dpi || 'N/A' },
    { 'Empresa': c.empresa || 'N/A' },
    { 'Estado': formatEstado(c.estado) },
    { 'Fecha Registro': formatFecha(c.fechaRegistro) }
  );

  console.log(table.toString());
}

export async function clientMenu(commandFactory) {
  let mainLoop = true;

  while (mainLoop) {
    const { action } = await inquirer.prompt([
      {
        type: 'select',
        name: 'action',
        message: '--- GESTIÓN DE CLIENTES ---',
        choices: [
          { name: '1. Registrar nuevo cliente', value: 'CREATE' },
          { name: '2. Listar todos los clientes', value: 'LIST' },
          { name: '3. Buscar cliente por ID', value: 'FIND' },
          { name: '4. Actualizar cliente', value: 'UPDATE' },
          { name: '5. Eliminar cliente', value: 'DELETE' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ],
      },
    ]);

    try {
      switch (action) {
        case 'CREATE': {
          const datos = await inquirer.prompt([
            {
              type: 'input',
              name: 'nombre',
              message: 'Nombre del cliente:',
              validate: (val) => (val && val.trim() ? true : error('El nombre es un campo obligatorio.')),
            },
            {
              type: 'input',
              name: 'email',
              message: 'Correo electrónico:',
              validate: async (val) => {
                const clean = val?.trim();
                if (!EMAIL_REGEX.test(clean)) return error('El email no tiene un formato válido.');
                try {
                  const cmdListar = commandFactory.create('listar-clientes');
                  const clientes = await cmdListar.execute();
                  const existe = clientes.some((c) => c.email === clean);
                  if (existe) return error(`Ya existe un cliente registrado con el email: "${clean}".`);
                } catch {
                  // Si falla la verificación permite continuar
                }
                return true;
              },
            },
            {
              type: 'input',
              name: 'telefono',
              message: 'Teléfono:',
              validate: async (val) => {
                const clean = val?.trim();
                if (!TELEFONO_REGEX.test(clean)) return error('El teléfono debe tener entre 7 y 15 dígitos numéricos.');
                try {
                  const cmdListar = commandFactory.create('listar-clientes');
                  const clientes = await cmdListar.execute();
                  const existe = clientes.some((c) => c.telefono === clean);
                  if (existe) return error(`Ya existe un cliente registrado con el teléfono: "${clean}".`);
                } catch {
                  // Continuar si falla consulta
                }
                return true;
              },
            },
            {
              type: 'input',
              name: 'dpi',
              message: 'DPI (13 dígitos):',
              validate: async (val) => {
                const clean = val?.trim();
                if (!DPI_REGEX.test(clean)) return error('El DPI debe contener exactamente 13 dígitos numéricos.');
                try {
                  const cmdListar = commandFactory.create('listar-clientes');
                  const clientes = await cmdListar.execute();
                  const existe = clientes.some((c) => c.dpi === clean);
                  if (existe) return error(`Ya existe un cliente registrado con el DPI: "${clean}".`);
                } catch {
                  // Continuar si falla consulta
                }
                return true;
              },
            },
            {
              type: 'input',
              name: 'empresa',
              message: 'Empresa (opcional, Enter para omitir):',
            },
          ]);

          if (!datos.empresa?.trim()) datos.empresa = null;

          const comando = commandFactory.create('crear-cliente');
          const creado = await comando.execute(datos);
          console.log(`\n${exito(`Cliente registrado con éxito. ID: ${creado.id || creado._id}`)}\n`);
          break;
        }

        case 'LIST': {
          const comando = commandFactory.create('listar-clientes');
          const clientes = await comando.execute();
          console.log('\n--- Lista de Clientes ---');
          const table = new Table({ head: ['ID', 'Nombre', 'Email', 'Estado', 'Fecha Registro'] });
          clientes.forEach((c) => {
            table.push([
              (c.id ?? c._id).toString(),
              c.nombre,
              c.email,
              formatEstado(c.estado),
              formatFecha(c.fechaRegistro),
            ]);
          });
          console.log(table.toString());
          break;
        }

        case 'FIND': {
          const { id } = await inquirer.prompt([
            {
              type: 'input',
              name: 'id',
              message: 'ID del cliente:',
              validate: validateNumericId,
            },
          ]);
          const comando = commandFactory.create('buscar-cliente');
          const cliente = await comando.execute(Number(id.trim()));
          console.log('\n--- Información del Cliente ---');
          mostrarFichaCliente(cliente);
          break;
        }

        case 'UPDATE': {
          let clienteAEditar = null;
          let idNumerico = null;

          // 1. Reintentar inmediatamente si el ID ingresado no existe
          while (!clienteAEditar) {
            const { idInput } = await inquirer.prompt([
              {
                type: 'input',
                name: 'idInput',
                message: 'ID del cliente a actualizar (o 0 para cancelar):',
              },
            ]);

            const cleanId = idInput?.trim();
            if (cleanId === '0') break;

            const esValido = validateNumericId(cleanId);
            if (esValido !== true) {
              console.log(`\n${esValido}\n`);
              continue;
            }

            try {
              idNumerico = Number(cleanId);
              const cmdBuscar = commandFactory.create('buscar-cliente');
              clienteAEditar = await cmdBuscar.execute(idNumerico);
            } catch (err) {
              console.log(`\n${error(`El ID ${cleanId} no existe. Intente nuevamente.`)}\n`);
            }
          }

          if (!clienteAEditar) {
            console.log('\nOperación cancelada.\n');
            break;
          }

          console.log('\n--- Cliente Seleccionado ---');
          mostrarFichaCliente(clienteAEditar);

          // 2. Formulario de edición con validaciones de duplicados exclusivas
          const campos = await inquirer.prompt([
            {
              type: 'input',
              name: 'nombre',
              message: 'Nuevo nombre (Enter para no cambiar):',
            },
            {
              type: 'input',
              name: 'email',
              message: 'Nuevo email (Enter para no cambiar):',
              validate: async (val) => {
                const clean = val?.trim();
                if (!clean) return true;
                if (!EMAIL_REGEX.test(clean)) return error('El email no tiene un formato válido.');
                try {
                  const cmdListar = commandFactory.create('listar-clientes');
                  const clientes = await cmdListar.execute();
                  const existe = clientes.some((c) => c.email === clean && (c.id ?? c._id) !== idNumerico);
                  if (existe) return error(`Ya existe otro cliente registrado con el email: "${clean}".`);
                } catch {
                  // Continuar
                }
                return true;
              },
            },
            {
              type: 'input',
              name: 'telefono',
              message: 'Nuevo teléfono (Enter para no cambiar):',
              validate: async (val) => {
                const clean = val?.trim();
                if (!clean) return true;
                if (!TELEFONO_REGEX.test(clean)) return error('El teléfono debe tener entre 7 y 15 dígitos.');
                try {
                  const cmdListar = commandFactory.create('listar-clientes');
                  const clientes = await cmdListar.execute();
                  const existe = clientes.some((c) => c.telefono === clean && (c.id ?? c._id) !== idNumerico);
                  if (existe) return error(`Ya existe otro cliente registrado con el teléfono: "${clean}".`);
                } catch {
                  // Continuar
                }
                return true;
              },
            },
            {
              type: 'input',
              name: 'dpi',
              message: 'Nuevo DPI (Enter para no cambiar):',
              validate: async (val) => {
                const clean = val?.trim();
                if (!clean) return true;
                if (!DPI_REGEX.test(clean)) return error('El DPI debe contener exactamente 13 dígitos numéricos.');
                try {
                  const cmdListar = commandFactory.create('listar-clientes');
                  const clientes = await cmdListar.execute();
                  const existe = clientes.some((c) => c.dpi === clean && (c.id ?? c._id) !== idNumerico);
                  if (existe) return error(`Ya existe otro cliente registrado con el DPI: "${clean}".`);
                } catch {
                  // Continuar
                }
                return true;
              },
            },
            {
              type: 'input',
              name: 'empresa',
              message: 'Nueva empresa (Enter para no cambiar):',
            },
          ]);

          const data = {};
          for (const [campo, valor] of Object.entries(campos)) {
            if (valor?.trim()) data[campo] = valor.trim();
          }

          if (Object.keys(data).length === 0) {
            console.log('\nNo se realizaron cambios.\n');
            break;
          }

          const comando = commandFactory.create('actualizar-cliente');
          await comando.execute({ id: idNumerico, data });
          console.log(`\n${exito('Cliente actualizado con éxito.')}\n`);
          break;
        }

        case 'DELETE': {
          const { id, confirmar } = await inquirer.prompt([
            {
              type: 'input',
              name: 'id',
              message: 'ID del cliente a eliminar:',
              validate: validateNumericId,
            },
            {
              type: 'confirm',
              name: 'confirmar',
              message: '¿Confirms que deseas eliminar este cliente?',
              default: false,
            },
          ]);

          if (!confirmar) {
            console.log('\nOperación cancelada.\n');
            break;
          }

          const comando = commandFactory.create('eliminar-cliente');
          await comando.execute(Number(id.trim()));
          console.log(`\n${exito('Cliente eliminado con éxito.')}\n`);
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