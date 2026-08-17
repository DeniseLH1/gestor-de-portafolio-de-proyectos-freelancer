import Command from './command.js';

class ListProjectsByClientCommand extends Command {
  constructor(projectService) {
    super('Buscar proyectos por cliente', 'Muestra los proyectos asociados a un cliente');
    this.projectService = projectService;
  }

  async execute(clientId) {
    return await this.projectService.getProjectsByClient(clientId);
  }
}

export default ListProjectsByClientCommand;