import BaseModel from './baseModels.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

class Deliverable extends BaseModel {
  constructor({
    proyectoId,
    descripcion,
    fechaLimite,
    estado = 'pendiente',
  } = {}) {
    super();
    this.proyectoId = proyectoId;
    this.descripcion = descripcion;
    this.fechaLimite = fechaLimite;
    this.estado = estado;
  }

  validate() {
  this._isRequired(this.proyectoId, 'proyectoId') &&
    this._matchesPattern(this.proyectoId, 'proyectoId', OBJECT_ID_REGEX, 'El proyectoId no tiene un formato válido.');

  this._isRequired(this.descripcion, 'descripcion') &&
    this._isType(this.descripcion, 'descripcion', 'string');

  this._isRequired(this.fechaLimite, 'fechaLimite') &&
    this._isValidDate(this.fechaLimite, 'fechaLimite');

  this._isOneOf(this.estado, 'estado', ['pendiente', 'entregado', 'aprobado', 'rechazado']);
}
}

export default Deliverable;