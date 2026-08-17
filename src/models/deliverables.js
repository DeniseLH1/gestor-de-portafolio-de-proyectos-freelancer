import BaseModel from './baseModels.js';
import { ObjectId } from 'mongodb';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

class Deliverable extends BaseModel {
  constructor({
    projectId,
    descripcion,
    fechaLimite,
    status = 'pendiente',
  } = {}) {
    super();
    this.projectId = projectId;
    this.descripcion = descripcion;
    this.fechaLimite = fechaLimite;
    this.status = status;
  }

  validate() {
    this._isRequired(this.projectId, 'projectId') &&
      this._matchesPattern(this.projectId, 'projectId', OBJECT_ID_REGEX, 'El projectId no tiene un formato válido.');

    this._isRequired(this.descripcion, 'descripcion') &&
      this._isType(this.descripcion, 'descripcion', 'string');

    this._isRequired(this.fechaLimite, 'fechaLimite') &&
      this._isValidDate(this.fechaLimite, 'fechaLimite');

    this._isOneOf(this.status, 'status', ['pendiente', 'entregado', 'aprobado', 'rechazado']);
  }

  toObject() {
    return {
      projectId: new ObjectId(this.projectId),
      descripcion: this.descripcion,
      fechaLimite: new Date(this.fechaLimite),
      status: this.status,
    };
  }
}

export default Deliverable;