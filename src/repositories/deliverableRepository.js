import { BaseRepository } from './baseRepository.js';

export class DeliverableRepository extends BaseRepository {
    constructor(db) {
        super(db, 'deliverables');
    }

    async findByProjectId(projectId, options = {}) {
        const objectId = this._toObjectId(projectId);
        return await this.collection.find({ projectId: objectId }, options).toArray();
    }

    async updateStatus(deliverableId, status, options = {}) {
        const objectId = this._toObjectId(deliverableId);
        return await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after', ...options }
        );
    }
}

export default DeliverableRepository;