import { ObjectId } from 'mongodb';
import BaseModel from './baseModels.js';
import ValidationError from '../utils/ValidationError.js';

export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
export const CLIENT_ID_REGEX = /^[0-9]+$/;
export const ESTADOS_CONTRATO = ['borrador', 'activo', 'finalizado', 'cancelado'];

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
    if (!this.projectId || !OBJECT_ID_REGEX.test(String(this.projectId).trim())) {
      throw new ValidationError('El projectId no tiene un formato válido (debe ser un ID de MongoDB de 24 caracteres).');
    }

    if (!this.clientId || !CLIENT_ID_REGEX.test(String(this.clientId).trim())) {
      throw new ValidationError('El clientId debe ser un número entero positivo.');
    }

    const inicio = new Date(this.fechaInicio);
    if (!this.fechaInicio || Number.isNaN(inicio.getTime())) {
      throw new ValidationError('La fecha de inicio no es válida.');
    }

    const fin = new Date(this.fechaFin);
    if (!this.fechaFin || Number.isNaN(fin.getTime())) {
      throw new ValidationError('La fecha de fin no es válida.');
    }

    if (fin <= inicio) {
      throw new ValidationError('La fecha de fin debe ser posterior a la fecha de inicio.');
    }

    if (this.valorTotal === undefined || this.valorTotal === null || typeof this.valorTotal !== 'number' || this.valorTotal <= 0) {
      throw new ValidationError('El valor total debe ser un número mayor a 0.');
    }

    if (!this.condiciones || typeof this.condiciones !== 'string' || !this.condiciones.trim()) {
      throw new ValidationError('Las condiciones son un campo obligatorio.');
    }

    if (!ESTADOS_CONTRATO.includes(this.status)) {
      throw new ValidationError(`El estado debe ser uno de: ${ESTADOS_CONTRATO.join(', ')}.`);
    }
  }

  toObject() {
    return {
      projectId: new ObjectId(this.projectId),
      clientId: Number(this.clientId),
      fechaInicio: new Date(this.fechaInicio),
      fechaFin: new Date(this.fechaFin),
      valorTotal: this.valorTotal,
      condiciones: this.condiciones.trim(),
      status: this.status,
    };
  }
}

export default Contract;