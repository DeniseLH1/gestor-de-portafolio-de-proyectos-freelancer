import { BaseRepository } from './baseRepository.js';

export class ProposalRepository extends BaseRepository {
    constructor(db) {
        super(db, 'proposals');
    }

    async findByClientId(clientId, options = {}) {
        const objectId = this._toObjectId(clientId);
        return await this.collection.find({ clientId: objectId }, options).toArray();
    }

    async updateStatus(proposalId, status, options = {}) {
        const objectId = this._toObjectId(proposalId);
        return await this.collection.findOneAndUpdate(
        { _id: objectId },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after', ...options }
        );
    }
}

export default ProposalRepository;