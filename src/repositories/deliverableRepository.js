import { BaseRepository } from './baseRepository.js';

export class DeliverableRepository extends BaseRepository {
    constructor(db) {
        super(db, 'deliverables');
    }

    async findOne(query, options = {}) {
        return await this.collection.findOne(query, options);
    }

    async findByProjectId(projectId, options = {}) {
        return await this.collection.find({ projectId: Number(projectId) }, options).toArray();
    }

    async updateByCustomId(id, data, options = {}) {
        const res = await this.collection.updateOne({ id: Number(id) }, { $set: data }, options);
        return res.modifiedCount > 0;
    }

    async deleteByCustomId(id, options = {}) {
        const res = await this.collection.deleteOne({ id: Number(id) }, options);
        return res.deletedCount > 0;
    }

    async updateStatus(deliverableId, status, options = {}) {
        return await this.collection.findOneAndUpdate(
        { id: Number(deliverableId) },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after', ...options }
        );
    }
}

export default DeliverableRepository;