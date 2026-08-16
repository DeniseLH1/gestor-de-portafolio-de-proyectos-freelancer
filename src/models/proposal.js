import BaseModel from './baseModels.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

class Proposal extends BaseModel {
    constructor({
        clienteId,
        descripcion,
        precio,
        diasEstimados,
        estado = 'pendiente',
        fechaCreacion = new Date(),
    } = {}) {
        super();
        this.clienteId = clienteId;
        this.descripcion = descripcion;
        this.precio = precio;
        this.diasEstimados = diasEstimados;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
    }

    validate() {
        this._isRequired(this.clienteId, 'clienteId');
        this._isRequired(this.descripcion, 'descripcion');
        this._isRequired(this.precio, 'precio');
        this._isType(this.precio, 'number', 'precio');
        this._isInRange(this.precio, 1, Infinity, 'precio');
        this._isRequired(this.diasEstimados, 'diasEstimados');
        this._isOneOf(this.estado,['pendiente', 'aceptada', 'rechazada'],'estado');
    }
}

export default Proposal;