import ValidationError from '../utils/ValidationError.js';

class BaseModel {
  constructor() {
    if (new.target === BaseModel) {
      throw new Error(
        'BaseModel es una clase abstracta: no se puede instanciar directamente. ' +
          'Debe heredarse con "extends" (ej. class Cliente extends BaseModel).',
      );
    }

    this._errors = [];
  }

  _isRequired(value, field) {
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '');

    if (isEmpty) {
      this._errors.push(`El campo "${field}" es obligatorio.`);
      return false;
    }
    return true;
  }

  _isType(value, field, type) {
  if (typeof value !== type) {
    this._errors.push(`El campo "${field}" debe ser de tipo "${type}".`);
    return false;
  }
  return true;
}

_matchesPattern(value, field, regex, message) {
  if (typeof value !== 'string' || !regex.test(value)) {
    this._errors.push(message ?? `El campo "${field}" tiene un formato inválido.`);
    return false;
  }
  return true;
}

_isInRange(value, field, min, max) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < min || value > max) {
    this._errors.push(`El campo "${field}" debe estar entre ${min} y ${max}.`);
    return false;
  }
  return true;
}

_isOneOf(value, field, allowed) {
  if (!allowed.includes(value)) {
    this._errors.push(`El campo "${field}" debe ser uno de: ${allowed.join(', ')}.`);
    return false;
  }
  return true;
}

_isValidDate(value, field) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    this._errors.push(`El campo "${field}" debe ser una fecha válida.`);
    return false;
  }
  return true;
}

validate() {
    throw new Error(`${this.constructor.name} debe implementar su propio método validate().`);
  }

  isValid() {
    this._errors = [];
    this.validate();
    return this._errors.length === 0;
  }

  assertValid() {
    this._errors = [];
    this.validate();
    if (this._errors.length > 0) {
      throw new ValidationError(
        `${this.constructor.name} tiene ${this._errors.length} error(es) de validación.`,
        this._errors,
      );
    }
  }

  getErrors() {
    return [...this._errors];
  }
}

export default BaseModel;