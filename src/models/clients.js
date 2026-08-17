import BaseModel from './baseModels.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_REGEX = /^\+?[0-9]{7,15}$/;
const DPI_REGEX = /^[0-9]{13}$/;

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
    this._isRequired(this.nombre, 'nombre') && this._isType(this.nombre, 'nombre', 'string');

    this._isRequired(this.email, 'email') &&
      this._matchesPattern(this.email, 'email', EMAIL_REGEX, 'El email no tiene un formato válido.');

    this._isRequired(this.telefono, 'telefono') &&
      this._matchesPattern(this.telefono, 'telefono', TELEFONO_REGEX, 'El teléfono debe tener entre 7 y 15 dígitos.');

    this._isRequired(this.dpi, 'dpi') &&
      this._matchesPattern(this.dpi, 'dpi', DPI_REGEX, 'El DPI debe tener exactamente 13 dígitos numéricos.');

    if (this.empresa !== null) {
      this._isType(this.empresa, 'empresa', 'string');
    }

    this._isOneOf(this.estado, 'estado', ['activo', 'inactivo']);

    this._isValidDate(this.fechaRegistro, 'fechaRegistro');
  }

  toObject() {
    return {
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      dpi: this.dpi,
      empresa: this.empresa,
      estado: this.estado,
      fechaRegistro: new Date(this.fechaRegistro),
    };
  }
}

export default Client;