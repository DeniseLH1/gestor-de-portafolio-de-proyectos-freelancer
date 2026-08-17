import { ObjectId } from 'mongodb';
import BaseModel from './baseModels.js';

const VALID_STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

class Proposal extends BaseModel {
  constructor({ clientId, title, amount, validUntil = null, status = 'DRAFT' } = {}) {
    super();
    this.clientId = clientId;
    this.title = title;
    this.amount = amount;
    this.validUntil = validUntil;
    this.status = status;
  }

  validate() {
    this._isRequired(this.clientId, 'clientId');

    this._isRequired(this.title, 'title') && this._isType(this.title, 'title', 'string');

    this._isRequired(this.amount, 'amount') &&
      this._isType(this.amount, 'amount', 'number') &&
      this._isInRange(this.amount, 'amount', 0.01, Number.MAX_SAFE_INTEGER);

    if (this.validUntil) {
      this._isValidDate(this.validUntil, 'validUntil');
    }

    this._isOneOf(this.status, 'status', VALID_STATUSES);
  }

  toObject() {
    return {
      clientId: new ObjectId(this.clientId),
      title: this.title,
      amount: this.amount,
      validUntil: this.validUntil ? new Date(this.validUntil) : null,
      status: this.status,
    };
  }
}

export default Proposal;