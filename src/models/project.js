import { ObjectId } from 'mongodb';
import BaseModel from './baseModels.js';
import ValidationError from '../utils/ValidationError.js';

export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
export const NUMERIC_ID_REGEX = /^[0-9]+$/;
export const ESTADOS_PROYECTO = ['Planificado', 'En progreso', 'En espera', 'Completado', 'Cancelado'];

class Project extends BaseModel {
  constructor({
    name,
    clientId,
    proposalId = null,
    contractId = null,
    budget,
    status = 'Planificado',
    advances = [],
    startDate = new Date(),
    endDate = null,
  } = {}) {
    super();
    this.name = name;
    this.clientId = clientId;
    this.proposalId = proposalId;
    this.contractId = contractId;
    this.budget = budget;
    this.status = status;
    this.advances = advances;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  validate() {
    if (!this.name || typeof this.name !== 'string' || !this.name.trim()) {
      throw new ValidationError('El nombre del proyecto es obligatorio.');
    }

    if (!this.clientId || !NUMERIC_ID_REGEX.test(String(this.clientId).trim())) {
      throw new ValidationError('El clientId debe ser un número entero positivo.');
    }

    if (this.proposalId && !OBJECT_ID_REGEX.test(String(this.proposalId).trim())) {
      throw new ValidationError('El proposalId no tiene un formato válido.');
    }

    if (this.contractId && !NUMERIC_ID_REGEX.test(String(this.contractId).trim())) {
      throw new ValidationError('El contractId debe ser un número entero positivo.');
    }

    if (this.budget === undefined || this.budget === null || typeof this.budget !== 'number' || this.budget < 0) {
      throw new ValidationError('El presupuesto debe ser un número mayor o igual a 0.');
    }

    if (!ESTADOS_PROYECTO.includes(this.status)) {
      throw new ValidationError(`El estado debe ser uno de: ${ESTADOS_PROYECTO.join(', ')}.`);
    }

    if (!Array.isArray(this.advances)) {
      throw new ValidationError('El campo "advances" debe ser un arreglo.');
    }

    const inicio = new Date(this.startDate);
    if (Number.isNaN(inicio.getTime())) {
      throw new ValidationError('La fecha de inicio no es válida.');
    }

    if (this.endDate) {
      const fin = new Date(this.endDate);
      if (Number.isNaN(fin.getTime())) {
        throw new ValidationError('La fecha de fin no es válida.');
      }
      if (fin < inicio) {
        throw new ValidationError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      }
    }
  }

  toObject() {
    return {
      name: this.name.trim(),
      clientId: Number(this.clientId),
      proposalId: this.proposalId ? new ObjectId(this.proposalId) : null,
      contractId: this.contractId ? Number(this.contractId) : null,
      budget: this.budget,
      status: this.status,
      advances: this.advances,
      startDate: new Date(this.startDate),
      endDate: this.endDate ? new Date(this.endDate) : null,
    };
  }
}

export default Project;