import { BaseRepository } from './baseRepository.js';

export class FinancialRepository extends BaseRepository {
    constructor(db) {
        super(db, 'transactions');
    }

    async findByProjectId(projectId, options = {}) {
        const objectId = this._toObjectId(projectId);
        return await this.collection.find({ proyectoId: objectId }, options).toArray();
    }

    async getBalanceGeneral(options = {}) {
        const transactions = await this.collection.find({}, options).toArray();

        const totalIngresos = transactions
        .filter((t) => t.tipo === 'ingreso')
        .reduce((acc, t) => acc + Number(t.monto), 0);

        const totalEgresos = transactions
        .filter((t) => t.tipo === 'egreso')
        .reduce((acc, t) => acc + Number(t.monto), 0);

        return {
        totalIngresos,
        totalEgresos,
        balanceNeto: totalIngresos - totalEgresos,
        };
    }

    async findByReference(reference, options = {}) {
        return await this.collection.findOne({ reference }, options);
    }

    async deleteByDeliverableId(deliverableId, options = {}) {
        const objectId = this._toObjectId(deliverableId);
        return await this.collection.deleteMany({ deliverableId: objectId }, options);
    }

    async getFiltered(filters = {}, options = {}) {
        const query = {};
        if (filters.clientId) {
            query.clientId = this._toObjectId(filters.clientId);
        }
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = filters.startDate;
            if (filters.endDate) query.createdAt.$lte = filters.endDate;
        }
        return await this.collection.find(query, options).toArray();
    }
}

export default FinancialRepository;