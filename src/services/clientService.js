import Client from '../models/clients.js';

class ClientService {
  constructor(clientRepository) {
    this.clientRepository = clientRepository;
  }

  async create(data) {
    const client = new Client(data);
    client.assertValid();

    const existente = await this.clientRepository.findByEmail(client.email);
    if (existente) {
      throw new Error(`Ya existe un cliente registrado con el email "${client.email}".`);
    }

    const clienteGuardado = await this.clientRepository.create(client);
    return clienteGuardado;
  }

  async findById(id) {
    const cliente = await this.clientRepository.findById(id);
    if (!cliente) {
      throw new Error(`No se encontró ningún cliente con id ${id}.`);
    }
    return cliente;
  }

  async findAll() {
    return await this.clientRepository.findAll();
  }

  async update(id, data) {
    const existente = await this.clientRepository.findById(id);
    if (!existente) {
      throw new Error(`No se encontró ningún cliente con id ${id}.`);
    }

    const client = new Client({ ...existente, ...data });
    client.assertValid();

    const actualizado = await this.clientRepository.update(id, client);
    return actualizado;
  }

  async delete(id) {
    const eliminado = await this.clientRepository.delete(id);
    if (!eliminado) {
      throw new Error(`No se encontró ningún cliente con id ${id} para eliminar.`);
    }
    return eliminado;
  }
}

export default ClientService;