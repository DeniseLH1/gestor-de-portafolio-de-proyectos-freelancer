import Deliverable from '../models/deliverables.js';

class DeliverableService {
  constructor(deliverableRepository, projectRepository) {
    this.deliverableRepository = deliverableRepository;
    this.projectRepository = projectRepository;
  }

  async create(data) {
    const deliverable = new Deliverable(data);
    deliverable.assertValid();

    const proyecto = await this.projectRepository.findById(deliverable.projectId);
    if (!proyecto) {
      throw new Error(`No existe ningún proyecto con id ${deliverable.projectId}.`);
    }

    const entregableGuardado = await this.deliverableRepository.create(deliverable);
    return entregableGuardado;
  }

  async findById(id) {
  const entregable = await this.deliverableRepository.findById(id);
  if (!entregable) {
    throw new Error(`No se encontró ningún entregable con id ${id}.`);
  }
  return entregable;
}

async findAll() {
  return await this.deliverableRepository.findAll();
}

async update(id, data) {
  const existente = await this.deliverableRepository.findById(id);
  if (!existente) {
    throw new Error(`No se encontró ningún entregable con id ${id}.`);
  }

  const datosExistentes = {
    ...existente,
    projectId: existente.projectId.toString(),
  };

  const deliverable = new Deliverable({ ...datosExistentes, ...data });
  deliverable.assertValid();

  const proyecto = await this.projectRepository.findById(deliverable.projectId);
  if (!proyecto) {
    throw new Error(`No existe ningún proyecto con id ${deliverable.projectId}.`);
  }

  const actualizado = await this.deliverableRepository.update(id, deliverable);
  return actualizado;
}

async delete(id) {
  const eliminado = await this.deliverableRepository.delete(id);
  if (!eliminado) {
    throw new Error(`No se encontró ningún entregable con id ${id} para eliminar.`);
  }
  return eliminado;
}
}

export default DeliverableService;