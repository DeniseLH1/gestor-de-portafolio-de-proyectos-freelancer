import BaseModel from './baseModels.js';
import { ObjectId } from 'mongodb';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

class Contract extends BaseModel {
  constructor({
    projectId,
    clientId,
    fechaInicio,
    fechaFin,
    valorTotal,
    condiciones,
    status = 'borrador',
  } = {}) {
    super();
    this.projectId = projectId;
    this.clientId = clientId;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.valorTotal = valorTotal;
    this.condiciones = condiciones;
    this.status = status;
  }

  validate() {
    this._isRequired(this.projectId, 'projectId') &&
      this._matchesPattern(this.projectId, 'projectId', OBJECT_ID_REGEX, 'El projectId no tiene un formato válido.');

    this._isRequired(this.clientId, 'clientId') &&
      this._matchesPattern(this.clientId, 'clientId', OBJECT_ID_REGEX, 'El clientId no tiene un formato válido.');

    const inicioOk =
      this._isRequired(this.fechaInicio, 'fechaInicio') && this._isValidDate(this.fechaInicio, 'fechaInicio');
    const finOk =
      this._isRequired(this.fechaFin, 'fechaFin') && this._isValidDate(this.fechaFin, 'fechaFin');

    if (inicioOk && finOk) {
      const inicio = new Date(this.fechaInicio);
      const fin = new Date(this.fechaFin);
      if (fin <= inicio) {
        this._errors.push('El campo "fechaFin" debe ser posterior a "fechaInicio".');
      }
    }

    this._isRequired(this.valorTotal, 'valorTotal') &&
      this._isType(this.valorTotal, 'valorTotal', 'number') &&
      this._isInRange(this.valorTotal, 'valorTotal', 0.01, Number.MAX_SAFE_INTEGER);

    this._isRequired(this.condiciones, 'condiciones') &&
      this._isType(this.condiciones, 'condiciones', 'string');

    this._isOneOf(this.status, 'status', ['borrador', 'activo', 'finalizado', 'cancelado']);
  }

  toObject() {
    return {
      projectId: new ObjectId(this.projectId),
      clientId: new ObjectId(this.clientId),
      fechaInicio: new Date(this.fechaInicio),
      fechaFin: new Date(this.fechaFin),
      valorTotal: this.valorTotal,
      condiciones: this.condiciones,
      status: this.status,
    };
  }
}

export default Contract;