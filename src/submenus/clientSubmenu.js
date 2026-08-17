import inquirer from 'inquirer';
import { formatEstado, formatFecha, exito, error } from '../utils/format.js';

export async function clientMenu(commandFactory) {
  let mainLoop = true;

  while (mainLoop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
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
            { type: 'input', name: 'nombre', message: 'Nombre del cliente:' },
            { type: 'input', name: 'email', message: 'Correo electrónico:' },
            { type: 'input', name: 'telefono', message: 'Teléfono:' },
            { type: 'input', name: 'dpi', message: 'DPI (13 dígitos):' },
            { type: 'input', name: 'empresa', message: 'Empresa (opcional, Enter para omitir):' },
          ]);
          if (!datos.empresa) datos.empresa = null;

          const comando = commandFactory.create('crear-cliente');
          const creado = await comando.execute(datos);
          console.log(`\n${exito(`Cliente registrado con éxito. ID: ${creado._id}`)}\n`);
          break;
        }

        case 'LIST': {
          const comando = commandFactory.create('listar-clientes');
          const clientes = await comando.execute();
          console.log('\n--- Lista de Clientes ---');
          console.table(
            clientes.map((c) => ({
              id: c._id.toString(),
              nombre: c.nombre,
              email: c.email,
              estado: formatEstado(c.estado),
              fechaRegistro: formatFecha(c.fechaRegistro),
            })),
          );
          break;
        }

        case 'FIND': {
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del cliente:' }]);
          const comando = commandFactory.create('buscar-cliente');
          const cliente = await comando.execute(id);
          console.log('\n--- Información del Cliente ---');
          console.log({
            ...cliente,
            estado: formatEstado(cliente.estado),
            fechaRegistro: formatFecha(cliente.fechaRegistro),
          });
          break;
        }

        case 'UPDATE': {
          const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: 'ID del cliente a actualizar:' }]);
          const campos = await inquirer.prompt([
            { type: 'input', name: 'nombre', message: 'Nuevo nombre (Enter para no cambiar):' },
            { type: 'input', name: 'email', message: 'Nuevo email (Enter para no cambiar):' },
            { type: 'input', name: 'telefono', message: 'Nuevo teléfono (Enter para no cambiar):' },
            { type: 'input', name: 'empresa', message: 'Nueva empresa (Enter para no cambiar):' },
          ]);
          const data = {};
          for (const [campo, valor] of Object.entries(campos)) {
            if (valor) data[campo] = valor;
          }
          const comando = commandFactory.create('actualizar-cliente');
          await comando.execute({ id, data });
          console.log(`\n${exito('Cliente actualizado con éxito.')}\n`);
          break;
        }

        case 'DELETE': {
          const { id, confirmar } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del cliente a eliminar:' },
            { type: 'confirm', name: 'confirmar', message: '¿Confirma que desea eliminar este cliente?', default: false },
          ]);
          if (!confirmar) {
            console.log('\nOperación cancelada.\n');
            break;
          }
          const comando = commandFactory.create('eliminar-cliente');
          await comando.execute(id);
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