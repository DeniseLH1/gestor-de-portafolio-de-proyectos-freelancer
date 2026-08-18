import { BaseRepository } from './baseRepository.js';

export class ProposalRepository extends BaseRepository {
    constructor(db) {
        super(db, 'proposals');
    }

    async findOne(query, options = {}) {
        return await this.collection.findOne(query, options);
    }

    async findByClientId(clientId, options = {}) {
        return await this.collection.find({ clientId: Number(clientId) }, options).toArray();
    }

    async updateByCustomId(id, data, options = {}) {
        const res = await this.collection.updateOne({ id: Number(id) }, { $set: data }, options);
        return res.modifiedCount > 0;
    }

    async deleteByCustomId(id, options = {}) {
        const res = await this.collection.deleteOne({ id: Number(id) }, options);
        return res.deletedCount > 0;
    }

    async updateStatus(proposalId, status, options = {}) {
        return await this.collection.findOneAndUpdate(
        { id: Number(proposalId) },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after', ...options }
        );
    }
}

export default ProposalRepository;