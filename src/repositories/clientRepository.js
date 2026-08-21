import { BaseRepository } from './baseRepository.js';

export class ClientRepository extends BaseRepository {
    constructor(db) {
        super(db, 'clients');
    }

    async findByEmail(email, options = {}) {
        return await this.collection.findOne({ email }, options);
    }

    async findByName(nombre, options = {}) {
        return await this.collection.find({ nombre: { $regex: nombre, $options: 'i' } }, options).toArray();
    }

    async findOne(query, options = {}) {
        return await this.collection.findOne(query, options);
    }

    async updateByCustomId(id, data) {
        const res = await this.collection.updateOne({ id: Number(id) }, { $set: data });
        return res.modifiedCount > 0;
    }

    async deleteByCustomId(id) {
        const res = await this.collection.deleteOne({ id: Number(id) });
        return res.deletedCount > 0;
    }
}

export default ClientRepository;