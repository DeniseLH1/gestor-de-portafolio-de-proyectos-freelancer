import BaseModel from './baseModels.js';
import ValidationError from '../utils/ValidationError.js';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const TELEFONO_REGEX = /^\+?[0-9]{7,15}$/;
export const DPI_REGEX = /^[0-9]{13}$/;

class Client extends BaseModel {
  constructor({
    nombre,
    email,
    telefono,
    dpi,
    empresa = null,
    estado = 'activo',
    fechaRegistro = new Date(),
  } = {}) {
    super();
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.dpi = dpi;
    this.empresa = empresa;
    this.estado = estado;
    this.fechaRegistro = fechaRegistro;
  }

  validate() {
    if (!this.nombre || typeof this.nombre !== 'string' || !this.nombre.trim()) {
      throw new ValidationError('El nombre es un campo obligatorio.');
    }

    if (!this.email || !EMAIL_REGEX.test(this.email.trim())) {
      throw new ValidationError('El email no tiene un formato válido.');
    }

    if (!this.telefono || !TELEFONO_REGEX.test(this.telefono.trim())) {
      throw new ValidationError('El teléfono debe tener entre 7 y 15 dígitos.');
    }

    if (!this.dpi || !DPI_REGEX.test(this.dpi.trim())) {
      throw new ValidationError('El DPI debe tener exactamente 13 dígitos numéricos.');
    }

    if (this.empresa !== null && typeof this.empresa !== 'string') {
      throw new ValidationError('El nombre de la empresa debe ser una cadena de texto.');
    }

    if (!['activo', 'inactivo'].includes(this.estado)) {
      throw new ValidationError('El estado debe ser "activo" o "inactivo".');
    }
  }

  toObject() {
    return {
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      telefono: this.telefono.trim(),
      dpi: this.dpi.trim(),
      empresa: this.empresa ? this.empresa.trim() : null,
      estado: this.estado,
      fechaRegistro: new Date(this.fechaRegistro),
    };
  }
}

export default Client;