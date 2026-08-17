import inquirer from 'inquirer';

export async function clientMenu(clientService) {
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
                { name: 'Volver al Menú Principal', value: 'BACK' }
                ]
            }
        ]);

        try {
            switch (action) {
                case 'CREATE': {
                    const data = await inquirer.prompt([
                    { type: 'input', name: 'name', message: 'Nombre del cliente:' },
                    { type: 'input', name: 'email', message: 'Correo electrónico:' },
                    { type: 'input', name: 'company', message: 'Empresa:' }
                ]);
                const created = await clientService.createClient(data);
                console.log(`\nCliente registrado con éxito. ID: ${created.id || created._id}\n`);
            break;
            }

        case 'LIST': {
            const clients = await clientService.getAllClients();
            console.log('\n--- Lista de Clientes ---');
            console.table(clients);
            break;
        }

        case 'FIND': {
            const { id } = await inquirer.prompt([
            { type: 'input', name: 'id', message: 'ID del cliente:' }
            ]);
            const client = await clientService.getClientById(id);
            console.log('\n--- Información del Cliente ---');
            console.log(client);
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