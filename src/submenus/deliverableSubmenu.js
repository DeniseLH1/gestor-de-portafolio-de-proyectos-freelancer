import inquirer from 'inquirer';

export async function deliverableMenu(commandFactory) {
  let mainLoop = true;

  while (mainLoop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '--- GESTIÓN DE ENTREGABLES ---',
        choices: [
          { name: '1. Registrar nuevo entregable', value: 'CREATE' },
          { name: '2. Listar todos los entregables', value: 'LIST' },
          { name: '3. Buscar entregable por ID', value: 'FIND' },
          { name: 'Volver al Menú Principal', value: 'BACK' },
        ],
      },
    ]);

    try {
      switch (action) {
        case 'CREATE': {
          const datos = await inquirer.prompt([
            { type: 'input', name: 'projectId', message: 'ID del proyecto:' },
            { type: 'input', name: 'descripcion', message: 'Descripción del entregable:' },
            { type: 'input', name: 'fechaLimite', message: 'Fecha límite (YYYY-MM-DD):' },
          ]);

          const comando = commandFactory.create('crear-entregable');
          const creado = await comando.execute(datos);
          console.log(`\nEntregable registrado con éxito. ID: ${creado._id}\n`);
          break;
        }

        case 'LIST': {
          const comando = commandFactory.create('listar-entregables');
          const entregables = await comando.execute();
          console.log('\n--- Lista de Entregables ---');
          console.table(entregables);
          break;
        }

        case 'FIND': {
          const { id } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del entregable:' },
          ]);
          const comando = commandFactory.create('buscar-entregable');
          const entregable = await comando.execute(id);
          console.log('\n--- Información del Entregable ---');
          console.log(entregable);
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