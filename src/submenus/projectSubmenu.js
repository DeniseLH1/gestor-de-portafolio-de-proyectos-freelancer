import inquirer from 'inquirer';

export async function projectMenu(projectService) {
    let mainLoop = true;

    while (mainLoop) {
        const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: '--- GESTIÓN DE PROYECTOS Y ENTREGABLES ---',
            choices: [
                { name: '1. Registrar nuevo proyecto', value: 'CREATE' },
                { name: '2. Listar todos los proyectos', value: 'LIST' },
                { name: '3. Buscar proyectos por cliente', value: 'BY_CLIENT' },
                { name: '4. Actualizar estado de proyecto', value: 'UPDATE_STATUS' },
                { name: 'Volver al Menú Principal', value: 'BACK' }
                ]
            }
        ]);

    try {
        switch (action) {
            case 'CREATE': {
                const data = await inquirer.prompt([
                    { type: 'input', name: 'name', message: 'Nombre del proyecto:' },
                    { type: 'input', name: 'clientId', message: 'ID del Cliente:' },
                    { type: 'number', name: 'budget', message: 'Presupuesto inicial:' },
                    { type: 'input', name: 'startDate', message: 'Fecha de inicio (YYYY-MM-DD):' },
                    { type: 'input', name: 'endDate', message: 'Fecha estimada fin (YYYY-MM-DD):' }
                ]);
                const project = await projectService.createProject(data);
                console.log(`\nProyecto registrado con éxito. ID: ${project.id || project._id}\n`);
                break;
                }

            case 'LIST': {
                const projects = await projectService.getAllProjects();
                console.table(projects);
                break;
            }

            case 'BY_CLIENT': {
                const { clientId } = await inquirer.prompt([
                    { type: 'input', name: 'clientId', message: 'ID del Cliente:' }
                ]);
                const projects = await projectService.getProjectsByClient(clientId);
                console.table(projects);
                break;
            }

            case 'UPDATE_STATUS': {
                const { id, status } = await inquirer.prompt([
                    { type: 'input', name: 'id', message: 'ID del Proyecto:' },
                    {
                        type: 'list',
                        name: 'status',
                        message: 'Seleccione el nuevo estado:',
                        choices: ['Planificado', 'En progreso', 'En espera', 'Completado', 'Cancelado']
                    }
                ]);
                await projectService.updateStatus(id, status);
                console.log(`\nEstado actualizado a "${status}" con éxito.\n`);
                break;
            }

            case 'BACK':
                mainLoop = false;
                break;
                }
            }  catch (error) {
            console.error(`\nError: ${error.message}\n`);
        }
    }
}