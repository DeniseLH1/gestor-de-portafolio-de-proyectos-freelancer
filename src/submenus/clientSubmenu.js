import inquirer from 'inquirer';
import Table from 'cli-table3';
import { formatEstado, formatFecha, exito, error } from '../utils/format.js';
import { EMAIL_REGEX, TELEFONO_REGEX, DPI_REGEX } from '../models/clients.js';

// Función para validar IDs autoincrementables 
const validateNumericId = (val) => {
  const clean = val?.trim();
  const num = Number(clean);
  if (!clean || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return error('El ID debe ser un número entero positivo (ej: 1, 2, 3).');
  }
  return true;
};

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
              validate: (val) =>
                EMAIL_REGEX.test(val?.trim()) ? true : error('El email no tiene un formato válido.'),
            },
            {
              type: 'input',
              name: 'telefono',
              message: 'Teléfono:',
              validate: (val) =>
                TELEFONO_REGEX.test(val?.trim())
                  ? true
                  : error('El teléfono debe tener entre 7 y 15 dígitos numéricos.'),
            },
            {
              type: 'input',
              name: 'dpi',
              message: 'DPI (13 dígitos):',
              validate: (val) =>
                DPI_REGEX.test(val?.trim())
                  ? true
                  : error('El DPI debe contener exactamente 13 dígitos numéricos.'),
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
          console.table({
            ...cliente,
            estado: formatEstado(cliente.estado),
            fechaRegistro: formatFecha(cliente.fechaRegistro),
          });
          break;
        }

        case 'UPDATE': {
          const { id } = await inquirer.prompt([
            {
              type: 'input',
              name: 'id',
              message: 'ID del cliente a actualizar:',
              validate: validateNumericId,
            },
          ]);

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
              validate: (val) =>
                !val || EMAIL_REGEX.test(val.trim()) ? true : error('El email no tiene un formato válido.'),
            },
            {
              type: 'input',
              name: 'telefono',
              message: 'Nuevo teléfono (Enter para no cambiar):',
              validate: (val) =>
                !val || TELEFONO_REGEX.test(val.trim())
                  ? true
                  : error('El teléfono debe tener entre 7 y 15 dígitos.'),
            },
            {
              type: 'input',
              name: 'dpi',
              message: 'Nuevo DPI (Enter para no cambiar):',
              validate: (val) =>
                !val || DPI_REGEX.test(val.trim())
                  ? true
                  : error('El DPI debe contener exactamente 13 dígitos numéricos.'),
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

          const comando = commandFactory.create('actualizar-cliente');
          await comando.execute({ id: Number(id.trim()), data });
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
              message: '¿Confirma que desea eliminar este cliente?',
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