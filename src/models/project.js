import { ObjectId } from 'mongodb';
import BaseModel from './baseModels.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const ESTADOS_PROYECTO = ['Planificado', 'En progreso', 'En espera', 'Completado', 'Cancelado'];

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
    this._isRequired(this.name, 'name') && this._isType(this.name, 'name', 'string');

    this._isRequired(this.clientId, 'clientId') &&
      this._matchesPattern(this.clientId, 'clientId', OBJECT_ID_REGEX, 'El clientId no tiene un formato válido.');

    if (this.proposalId) {
      this._matchesPattern(this.proposalId, 'proposalId', OBJECT_ID_REGEX, 'El proposalId no tiene un formato válido.');
    }
    if (this.contractId) {
      this._matchesPattern(this.contractId, 'contractId', OBJECT_ID_REGEX, 'El contractId no tiene un formato válido.');
    }

    this._isRequired(this.budget, 'budget') &&
      this._isType(this.budget, 'budget', 'number') &&
      this._isInRange(this.budget, 'budget', 0, 10000000);

    this._isOneOf(this.status, 'status', ESTADOS_PROYECTO);

    if (!Array.isArray(this.advances)) {
      this._errors.push('El campo "advances" debe ser un arreglo.');
    }

    if (this.startDate && this.endDate) {
      const inicio = new Date(this.startDate);
      const fin = new Date(this.endDate);
      if (!Number.isNaN(inicio.getTime()) && !Number.isNaN(fin.getTime()) && fin < inicio) {
        this._errors.push('El campo "endDate" no puede ser anterior a "startDate".');
      }
    }
  }

  toObject() {
    return {
      name: this.name,
      clientId: new ObjectId(this.clientId),
      proposalId: this.proposalId ? new ObjectId(this.proposalId) : null,
      contractId: this.contractId ? new ObjectId(this.contractId) : null,
      budget: this.budget,
      status: this.status,
      advances: this.advances,
      startDate: this.startDate ? new Date(this.startDate) : new Date(),
      endDate: this.endDate ? new Date(this.endDate) : null,
    };
  }
}

export default Project;