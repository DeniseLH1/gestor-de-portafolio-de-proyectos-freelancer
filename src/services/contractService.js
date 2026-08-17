import Contract from '../models/contracts.js';

class ContractService {
  constructor(contractRepository, projectRepository, clientRepository) {
    this.contractRepository = contractRepository;
    this.projectRepository = projectRepository;
    this.clientRepository = clientRepository;
  }

  async create(data) {
    const contract = new Contract(data);
    contract.assertValid();

    const proyecto = await this.projectRepository.findById(contract.projectId);
    if (!proyecto) {
      throw new Error(`No existe ningún proyecto con id ${contract.projectId}.`);
    }

    const cliente = await this.clientRepository.findById(contract.clientId);
    if (!cliente) {
      throw new Error(`No existe ningún cliente con id ${contract.clientId}.`);
    }

    const contratoGuardado = await this.contractRepository.create(contract);
    return contratoGuardado;
  }

  async findById(id) {
    const contrato = await this.contractRepository.findById(id);
    if (!contrato) {
      throw new Error(`No se encontró ningún contrato con id ${id}.`);
    }
    return contrato;
  }

  async findAll() {
    return await this.contractRepository.findAll();
  }

  async update(id, data) {
    const existente = await this.contractRepository.findById(id);
    if (!existente) {
      throw new Error(`No se encontró ningún contrato con id ${id}.`);
    }

    const datosExistentes = {
      ...existente,
      projectId: existente.projectId.toString(),
      clientId: existente.clientId.toString(),
    };

    const contract = new Contract({ ...datosExistentes, ...data });
    contract.assertValid();

    const proyecto = await this.projectRepository.findById(contract.projectId);
    if (!proyecto) {
      throw new Error(`No existe ningún proyecto con id ${contract.projectId}.`);
    }

    const cliente = await this.clientRepository.findById(contract.clientId);
    if (!cliente) {
      throw new Error(`No existe ningún cliente con id ${contract.clientId}.`);
    }

    const actualizado = await this.contractRepository.update(id, contract);
    return actualizado;
  }

  async delete(id) {
    const eliminado = await this.contractRepository.delete(id);
    if (!eliminado) {
      throw new Error(`No se encontró ningún contrato con id ${id} para eliminar.`);
    }
    return eliminado;
  }
}

export default ContractService;