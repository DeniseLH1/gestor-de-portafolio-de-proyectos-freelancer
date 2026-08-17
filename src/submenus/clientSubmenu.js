import inquirer from 'inquirer';

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
          console.log(`\nCliente registrado con éxito. ID: ${creado._id}\n`);
          break;
        }

        case 'LIST': {
          const comando = commandFactory.create('listar-clientes');
          const clientes = await comando.execute();
          console.log('\n--- Lista de Clientes ---');
          console.table(clientes);
          break;
        }

        case 'FIND': {
          const { id } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del cliente:' },
          ]);
          const comando = commandFactory.create('buscar-cliente');
          const cliente = await comando.execute(id);
          console.log('\n--- Información del Cliente ---');
          console.log(cliente);
          break;
        }

        case 'BACK':
          mainLoop = false;
          break;
      }
    } catch (error) {
      console.error(`\nError: ${error.message}\n`);
    }
  }
}