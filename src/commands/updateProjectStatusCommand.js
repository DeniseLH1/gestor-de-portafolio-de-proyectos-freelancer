import Command from './command.js';

class UpdateProjectStatusCommand extends Command {
  constructor(projectService) {
    super('Actualizar estado de proyecto', 'Cambia el estado de un proyecto existente');
    this.projectService = projectService;
  }

  async execute({ id, status }) {
    return await this.projectService.updateStatus(id, status);
  }
}

export default UpdateProjectStatusCommand;