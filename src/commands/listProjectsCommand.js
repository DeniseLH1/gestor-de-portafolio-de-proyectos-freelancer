import Command from './command.js';

class ListProjectsCommand extends Command {
  constructor(projectService) {
    super('Listar proyectos', 'Muestra todos los proyectos registrados');
    this.projectService = projectService;
  }

  async execute() {
    return await this.projectService.getAllProjects();
  }
}

export default ListProjectsCommand;