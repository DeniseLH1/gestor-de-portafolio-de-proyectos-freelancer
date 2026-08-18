import { BaseRepository } from './baseRepository.js';

export class ClientRepository extends BaseRepository {
    constructor(db) {
        super(db, 'clients');
    }

    async findByEmail(email, options = {}) {
        return await this.collection.findOne({ email }, options);
    }

  // Búsqueda por campo 'id' personalizado
    async findOne(query, options = {}) {
        return await this.collection.findOne(query, options);
    }

  // Actualización usando el 'id' 
    async updateByCustomId(id, data) {
        const res = await this.collection.updateOne({ id: Number(id) }, { $set: data });
        return res.modifiedCount > 0;
    }

  // Eliminación usando el 'id' 
    async deleteByCustomId(id) {
        const res = await this.collection.deleteOne({ id: Number(id) });
        return res.deletedCount > 0;
    }
}

export default ClientRepository;