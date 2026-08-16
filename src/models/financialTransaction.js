import BaseModel from './baseModels.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const TIPO_TRANSACCION = ['ingreso', 'egreso'];

class Transaction extends BaseModel {
    constructor({
        tipo,
        monto,
        descripcion,
        categoria,
        proyectoId = null,
        clienteId = null,
        fecha = new Date(),
    } = {}) {
        super();
        this.tipo = tipo;
        this.monto = monto;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.proyectoId = proyectoId;
        this.clienteId = clienteId;
        this.fecha = fecha;
        this.validate();
    }

    validate() {
    this._isRequired(this.tipo, 'tipo');
    this._isOneOf(this.tipo, TIPO_TRANSACCION, 'tipo');

    this._isRequired(this.monto, 'monto');
    this._isType(this.monto, 'number', 'monto');
    this._isInRange(this.monto, 0.01, Infinity, 'monto');

    this._isRequired(this.descripcion, 'descripcion');
    this._isType(this.descripcion, 'string', 'descripcion');

    this._isRequired(this.categoria, 'categoria');
    this._isType(this.categoria, 'string', 'categoria');

    // 2. Validaciones para proyectoId y clienteId
    if (this.proyectoId) {
        this._matchesPattern(this.proyectoId, OBJECT_ID_REGEX, 'proyectoId');
    }

    if (this.clienteId) {
        this._matchesPattern(this.clienteId, OBJECT_ID_REGEX, 'clienteId');
    }

    // 3. Validación de fecha
    if (this.fecha && !(this.fecha instanceof Date) && isNaN(new Date(this.fecha).getTime())) {
        throw new Error('La fecha proporcionada no es válida.');
    }
    }
}

export default Transaction;