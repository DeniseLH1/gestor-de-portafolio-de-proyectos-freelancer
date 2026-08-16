import BaseModel from './baseModels.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const ESTADOS_PROYECTO = ['activo', 'pausado', 'finalizado', 'cancelado'];

class Project extends BaseModel {
    constructor({
        nombre,
        clienteId,
        propuestaId = null,
        contratoId = null,
        presupuesto,
        estado = 'activo',
        // para almacenar registros de avances
        avances = [], 
        fechaInicio = new Date(),
        fechaFin = null,
    } = {}) {
        super();
        this.nombre = nombre;
        this.clienteId = clienteId;
        this.propuestaId = propuestaId;
        this.contratoId = contratoId;
        this.presupuesto = presupuesto;
        this.estado = estado;
        this.avances = avances;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
    }

    validate() {
        this._isRequired(this.nombre, 'nombre') &&
        this._isType(this.nombre, 'nombre', 'string');

        this._isRequired(this.clienteId, 'clienteId') &&
        this._matchesPattern(this.clienteId, 'clienteId', OBJECT_ID_REGEX, 'El cliente no tiene un formato válido.');

    if (this.propuestaId) {
        this._matchesPattern(this.propuestaId, 'propuestaId', OBJECT_ID_REGEX, 'La propuesta no tiene un formato válido.');
    }

    if (this.contratoId) {
        this._matchesPattern(this.contratoId, 'contratoId', OBJECT_ID_REGEX, 'El contrato no tiene un formato válido.');
    }

    this._isRequired(this.presupuesto, 'presupuesto') &&
        this._isType(this.presupuesto, 'presupuesto', 'number') &&
        this._isInRange(this.presupuesto, 'presupuesto', 0.01, 10000000);

    this._isRequired(this.estado, 'estado') &&
        this._isOneOf(this.estado, 'estado', ESTADOS_PROYECTO);

    if (this.avances && !Array.isArray(this.avances)) {
        throw new Error('Los avances deben ser un arreglo de registros.');
    }

    return true;
    }
}

export default Project;