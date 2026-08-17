import { BaseRepository } from './baseRepository.js';

export class ProjectRepository extends BaseRepository {
    constructor(db) {
        super(db, 'projects');
    }

    async findByClientId(clientId, options = {}) {
        const objectId = this._toObjectId(clientId);
        return await this.collection.find({ clientId: objectId }, options).toArray();
    }

    async addAdvance(projectId, advanceData, options = {}) {
        const objectId = this._toObjectId(projectId);
        return await this.collection.findOneAndUpdate(
        { _id: objectId },
        { 
            $push: { avances: { ...advanceData, fecha: new Date() } },
            $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after', ...options }
        );
    }

    async updateStatus(projectId, status, options = {}) {
        const objectId = this._toObjectId(projectId);
        return await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after', ...options }
        );
    }
}

export default ProjectRepository;