import Contract from '../models/contracts.js';
import ValidationError from '../utils/ValidationError.js';
import { getNextSequenceValue } from '../utils/sequence.js';

class ContractService {
  constructor(contractRepository, projectRepository, clientRepository) {
    this.contractRepository = contractRepository;
    this.projectRepository = projectRepository;
    this.clientRepository = clientRepository;
  }

  async create(data) {
    const contract = new Contract(data);
    contract.assertValid();
    const proyecto = await this.projectRepository.findOne({ id: Number(contract.projectId) });
    if (!proyecto) throw new ValidationError(`No existe ningún proyecto con id ${contract.projectId}.`);
    const cliente = await this.clientRepository.findOne({ id: Number(contract.clientId) });
    if (!cliente) throw new ValidationError(`No existe ningún cliente con id ${contract.clientId}.`);
    const autoId = await getNextSequenceValue(this.contractRepository.collection.db, 'contracts_id');
    const contractData = { id: autoId, ...contract.toObject() };
    return await this.contractRepository.create(contractData);
  }

  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) throw new ValidationError('El ID debe ser un número entero positivo.');
    const contrato = await this.contractRepository.findOne({ id: numericId });
    if (!contrato) throw new ValidationError(`No se encontró ningún contrato con el ID ${numericId}.`);
    return contrato;
  }

  async findAll() {
    return await this.contractRepository.findAll();
  }

  async update(id, data) {
    const existente = await this.findById(id);
    const datosExistentes = { ...existente, projectId: existente.projectId.toString(), clientId: existente.clientId.toString() };
    const contract = new Contract({ ...datosExistentes, ...data });
    contract.assertValid();
    const proyecto = await this.projectRepository.findOne({ id: Number(contract.projectId) });
    if (!proyecto) throw new ValidationError(`No existe ningún proyecto con id ${contract.projectId}.`);
    const cliente = await this.clientRepository.findOne({ id: Number(contract.clientId) });
    if (!cliente) throw new ValidationError(`No existe ningún cliente con id ${contract.clientId}.`);
    return await this.contractRepository.updateByCustomId(existente.id, contract.toObject());
  }

  async delete(id) {
    const contrato = await this.findById(id);
    const eliminado = await this.contractRepository.deleteByCustomId(contrato.id);
    if (!eliminado) throw new ValidationError(`No se pudo eliminar el contrato con ID ${id}.`);
    return eliminado;
  }
}
export default ContractService;