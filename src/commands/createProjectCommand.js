import Command from './command.js';

class CreateProjectCommand extends Command {
  constructor(projectService) {
    super('Crear proyecto', 'Registra un nuevo proyecto para un cliente');
    this.projectService = projectService;
  }

  async execute(datos) {
    return await this.projectService.createProject(datos);
  }
}

export default CreateProjectCommand;