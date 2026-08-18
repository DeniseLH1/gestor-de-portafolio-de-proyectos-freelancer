import BaseModel from './baseModels.js';

const NUMERIC_ID_REGEX = /^[0-9]+$/;
const TIPOS_TRANSACCION = ['INCOME', 'EXPENSE'];

class Transaction extends BaseModel {
  constructor({ type, amount, reference = null, clientId = null, deliverableId = null } = {}) {
    super();
    this.type = type;
    this.amount = amount;
    this.reference = reference;
    this.clientId = clientId;
    this.deliverableId = deliverableId;
  }

  validate() {
    this._isRequired(this.type, 'type') && this._isOneOf(this.type, 'type', TIPOS_TRANSACCION);

    this._isRequired(this.amount, 'amount') &&
      this._isType(this.amount, 'amount', 'number') &&
      this._isInRange(this.amount, 'amount', 0.01, Number.MAX_SAFE_INTEGER);

    if (this.reference) {
      this._isType(this.reference, 'reference', 'string');
    }

    if (this.clientId) {
      this._matchesPattern(this.clientId, 'clientId', NUMERIC_ID_REGEX, 'El clientId debe ser un número entero positivo.');
    }

    if (this.deliverableId) {
      this._matchesPattern(this.deliverableId, 'deliverableId', NUMERIC_ID_REGEX, 'El deliverableId debe ser un número entero positivo.');
    }
  }

  toObject() {
    return {
      type: this.type,
      amount: this.amount,
      reference: this.reference,
      clientId: this.clientId ? Number(this.clientId) : null,
      deliverableId: this.deliverableId ? Number(this.deliverableId) : null,
    };
  }
}

export default Transaction;