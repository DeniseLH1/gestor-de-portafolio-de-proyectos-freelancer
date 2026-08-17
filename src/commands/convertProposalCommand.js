import Command from './command.js';

class ConvertProposalCommand extends Command {
  constructor(proposalService, projectService) {
    super('Convertir propuesta a proyecto', 'Convierte una propuesta aceptada en un nuevo proyecto');
    this.proposalService = proposalService;
    this.projectService = projectService;
  }

  async execute(proposalId) {
    const proposal = await this.proposalService.getProposalById(proposalId);
    if (proposal.status !== 'ACCEPTED') {
      throw new Error('Solo se pueden convertir propuestas en estado ACCEPTED.');
    }

    const projectData = {
      name: proposal.title,
      clientId: proposal.clientId,
      budget: proposal.amount,
      status: 'Planificado',
    };

    return await this.projectService.createProject(projectData);
  }
}

export default ConvertProposalCommand;