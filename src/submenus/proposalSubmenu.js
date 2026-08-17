import inquirer from 'inquirer';

export async function proposalMenu(proposalService, projectService) {
    let mainLoop = true;

    while (mainLoop) {
        const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: '--- GESTIÓN DE PROPUESTAS Y PROYECTOS ---',
            choices: [
                { name: '1. Crear propuesta', value: 'CREATE' },
                { name: '2. Listar propuestas por cliente', value: 'LIST_BY_CLIENT' },
                { name: '3. Cambiar estado de propuesta', value: 'UPDATE_STATUS' },
                { name: '4. Convertir propuesta aceptada a proyecto', value: 'CONVERT' },
                { name: 'Volver al Menú Principal', value: 'BACK' }
                ]
            }
        ]);

    try {
        switch (action) {
            case 'CREATE': {
                const data = await inquirer.prompt([
                    { type: 'input', name: 'clientId', message: 'ID del Cliente:' },
                    { type: 'input', name: 'title', message: 'Título de la propuesta:' },
                    { type: 'number', name: 'amount', message: 'Monto de la propuesta:' }
                ]);
                const proposal = await proposalService.createProposal(data);
                console.log(`\nPropuesta creada con éxito. ID: ${proposal.id || proposal._id}\n`);
                break;
            }

            case 'LIST_BY_CLIENT': {
                const { clientId } = await inquirer.prompt([
                    { type: 'input', name: 'clientId', message: 'ID del Cliente:' }
                    ]);
                const proposals = await proposalService.getProposalsByClient(clientId);
                    console.table(proposals);
                    break;
                }

            case 'UPDATE_STATUS': {
                const { id, newStatus } = await inquirer.prompt([
                { type: 'input', name: 'id', message: 'ID de la propuesta:' },
                {
                    type: 'list',
                    name: 'newStatus',
                    message: 'Seleccione el nuevo estado:',
                    choices: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']
                }
                ]);
                await proposalService.updateStatus(id, newStatus);
                console.log(`\nEstado actualizado a "${newStatus}" correctamente.\n`);
                break;
            }

            case 'CONVERT': {
                const { proposalId } = await inquirer.prompt([
                    { type: 'input', name: 'proposalId', message: 'ID de la propuesta aceptada:' }
                ]);
          
          // Para crear el proyecto basado en los datos de la propuesta
                const proposal = await proposalService.getProposalById(proposalId);
                if (proposal.status !== 'ACCEPTED') {
                    throw new Error('Solo se pueden convertir propuestas en estado ACCEPTED.');
                }

                const projectData = {
                    name: proposal.title,
                    clientId: proposal.clientId,
                    budget: proposal.amount,
                    status: 'Planificado'
                };

                const newProject = await projectService.createProject(projectData);
                console.log(`\nPropuesta convertida en Proyecto. Nuevo ID de Proyecto: ${newProject.id || newProject._id}\n`);
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