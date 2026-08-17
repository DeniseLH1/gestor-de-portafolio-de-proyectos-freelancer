import BaseModel from './baseModels.js';
import { connectDB, toObjectId } from "./db.js";

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

export async function buscarClientePorId(idInput) {
  const db = await connectDB();
  const objectId = toObjectId(idInput);

  if (!objectId) {
    console.log("\n El ID debe ser un hash de 24 caracteres hexadecimales sin espacios.");
    return null;
  }

  return await db.collection("clientes").findOne({ _id: objectId });
}

export async function actualizarCliente(idInput, datos) {
  const db = await connectDB();
  const objectId = toObjectId(idInput);

  if (!objectId) {
    console.log("\n El ID del cliente a actualizar no es válido.");
    return false;
  }

  const updateFields = {};
  if (datos.nombre?.trim()) updateFields.nombre = datos.nombre.trim();
  if (datos.email?.trim()) updateFields.email = datos.email.trim();
  if (datos.telefono?.trim()) updateFields.telefono = datos.telefono.trim();
  if (datos.dpi?.trim()) updateFields.dpi = datos.dpi.trim();
  if (datos.empresa?.trim()) updateFields.empresa = datos.empresa.trim();

  // Validar expresiones regulares si se proporcionan campos específicos
  if (updateFields.email && !EMAIL_REGEX.test(updateFields.email)) {
    console.log("\n El email proporcionado no es válido.");
    return false;
  }
  if (updateFields.telefono && !TELEFONO_REGEX.test(updateFields.telefono)) {
    console.log("\n El teléfono debe tener entre 7 y 15 dígitos.");
    return false;
  }
  if (updateFields.dpi && !DPI_REGEX.test(updateFields.dpi)) {
    console.log("\n El DPI debe tener exactamente 13 dígitos numéricos.");
    return false;
  }

  if (Object.keys(updateFields).length === 0) {
    console.log("\n No se proporcionaron campos para actualizar.");
    return false;
  }

  const res = await db.collection("clientes").updateOne(
    { _id: objectId },
    { $set: updateFields }
  );

  return res.modifiedCount > 0;
}

export async function eliminarCliente(idInput) {
  const db = await connectDB();
  const objectId = toObjectId(idInput);

  if (!objectId) {
    console.log("\n El ID del cliente a eliminar no es válido.");
    return false;
  }

  const res = await db.collection("clientes").deleteOne({ _id: objectId });
  return res.deletedCount > 0;
}