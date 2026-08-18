import Client from '../models/clients.js';
import ValidationError from '../utils/ValidationError.js';
import { getNextSequenceValue } from '../utils/sequence.js';

class ClientService {
  constructor(clientRepository) {
    this.clientRepository = clientRepository;
  }

async create(data) {
  const client = new Client(data);
  client.assertValid();

  const existente = await this.clientRepository.findByEmail(client.email);
  if (existente) {
    throw new ValidationError(`Ya existe un cliente registrado con el email "${client.email}".`);
  }

  const autoId = await getNextSequenceValue(this.clientRepository.collection.db, 'clients_id');

  const clientData = {
    id: autoId,
    ...client.toObject()
  };

  return await this.clientRepository.create(clientData);
}

  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new ValidationError('El ID debe ser un número entero positivo.');
    }

    // Busca por el campo autoincrementable 'id'
    const cliente = await this.clientRepository.findOne({ id: numericId });
    if (!cliente) {
      throw new ValidationError(`No se encontró ningún cliente con el ID ${numericId}.`);
    }
    return cliente;
  }

  async findAll() {
    return await this.clientRepository.findAll();
  }

  async update(id, data) {
    const cliente = await this.findById(id);

    const client = new Client({ ...cliente, ...data });
    client.assertValid();

    // Actualiza usando el campo 'id' autoincrementable
    return await this.clientRepository.updateByCustomId(cliente.id, client.toObject());
  }

  async delete(id) {
    const cliente = await this.findById(id);
    const eliminado = await this.clientRepository.deleteByCustomId(cliente.id);
    if (!eliminado) {
      throw new ValidationError(`No se pudo eliminar el cliente con ID ${id}.`);
    }
    return eliminado;
  }
}

export default ClientService;