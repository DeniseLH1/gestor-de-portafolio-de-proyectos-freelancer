import Deliverable from '../models/deliverables.js';
import ValidationError from '../utils/ValidationError.js';
import { getNextSequenceValue } from '../utils/sequence.js';

class DeliverableService {
  constructor(deliverableRepository, projectRepository) {
    this.deliverableRepository = deliverableRepository;
    this.projectRepository = projectRepository;
  }

  async create(data) {
    const deliverable = new Deliverable(data);
    deliverable.assertValid();

    const proyecto = await this.projectRepository.findOne({ id: Number(deliverable.projectId) });
    if (!proyecto) {
      throw new ValidationError(`No existe ningún proyecto con id ${deliverable.projectId}.`);
    }

    const autoId = await getNextSequenceValue(this.deliverableRepository.collection.db, 'deliverables_id');
    const deliverableData = { id: autoId, ...deliverable.toObject() };

    return await this.deliverableRepository.create(deliverableData);
  }

  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new ValidationError('El ID debe ser un número entero positivo.');
    }

    const entregable = await this.deliverableRepository.findOne({ id: numericId });
    if (!entregable) {
      throw new ValidationError(`No se encontró ningún entregable con id ${numericId}.`);
    }
    return entregable;
  }

  async findAll() {
    return await this.deliverableRepository.findAll();
  }

  async update(id, data) {
    const existente = await this.findById(id);

    const datosExistentes = {
      ...existente,
      projectId: existente.projectId.toString(),
    };

    const deliverable = new Deliverable({ ...datosExistentes, ...data });
    deliverable.assertValid();

    const proyecto = await this.projectRepository.findOne({ id: Number(deliverable.projectId) });
    if (!proyecto) {
      throw new ValidationError(`No existe ningún proyecto con id ${deliverable.projectId}.`);
    }

    return await this.deliverableRepository.updateByCustomId(existente.id, deliverable.toObject());
  }

  async delete(id) {
    const existente = await this.findById(id);
    const eliminado = await this.deliverableRepository.deleteByCustomId(existente.id);
    if (!eliminado) {
      throw new ValidationError(`No se pudo eliminar el entregable con id ${id}.`);
    }
    return eliminado;
  }
}

export default DeliverableService;