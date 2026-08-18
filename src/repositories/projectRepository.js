import { BaseRepository } from './baseRepository.js';

export class ProjectRepository extends BaseRepository {
    constructor(db) {
        super(db, 'projects');
    }

    async findByClientId(clientId, options = {}) {
        return await this.collection.find({ clientId: Number(clientId) }, options).toArray();
    }

    async addAdvance(projectId, advanceData, options = {}) {
        return await this.collection.findOneAndUpdate(
        { id: Number(projectId) },
        {
            $push: { advances: { ...advanceData, fecha: new Date() } },
            $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after', ...options }
        );
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

export default ProjectRepository;