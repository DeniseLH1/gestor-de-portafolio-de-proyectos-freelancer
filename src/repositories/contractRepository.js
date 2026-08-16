import { BaseRepository } from './baseRepository.js';

export class ContractRepository extends BaseRepository {
    constructor(db) {
        super(db, 'contracts');
    }
    async findByProjectId(projectId, options = {}) {
        const objectId = this._toObjectId ? this._toObjectId(projectId) : projectId;
        return await this.collection.findOne({ projectId: objectId }, options);
    }

    async updateStatus(contractId, status, options = {}) {
        const objectId = this._toObjectId ? this._toObjectId(contractId) : contractId;
        return await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after', ...options }
        );
    }
}

export default ContractRepository;