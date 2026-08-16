import { BaseRepository } from './baseRepository.js';

export class ClientRepository extends BaseRepository {
    constructor(db) {
        super(db, 'clients');
    }

    async findByEmail(email, options = {}) {
        return await this.collection.findOne({ email }, options);
    }
}

export default ClientRepository;