import { BaseRepository } from './baseRepository.js';

export class FinancialRepository extends BaseRepository {
    constructor(db) {
        super(db, 'transactions');
    }

    async findOne(query, options = {}) {
        return await this.collection.findOne(query, options);
    }

    async updateByCustomId(id, data, options = {}) {
        const res = await this.collection.updateOne({ id: Number(id) }, { $set: data }, options);
        return res.modifiedCount > 0;
    }

    async deleteByCustomId(id, options = {}) {
        const res = await this.collection.deleteOne({ id: Number(id) }, options);
        return res.deletedCount > 0;
    }

    async findByReference(reference, options = {}) {
        return await this.collection.findOne({ reference }, options);
    }

    async deleteByDeliverableId(deliverableId, options = {}) {
        return await this.collection.deleteMany({ deliverableId: Number(deliverableId) }, options);
    }

    async getFiltered(filters = {}, options = {}) {
        const query = {};
        if (filters.clientId) {
            query.clientId = Number(filters.clientId);
        }
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = filters.startDate;
            if (filters.endDate) query.createdAt.$lte = filters.endDate;
        }
        return await this.collection.find(query, options).toArray();
    }

    async getResumenAgregadoPorCliente(clientId) {
        const pipeline = [
            { $match: { clientId: Number(clientId) } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                },
            },
        ];

        const resultados = await this.collection.aggregate(pipeline).toArray();

        const totalIngresos = resultados.find((r) => r._id === 'INCOME')?.total || 0;
        const totalEgresos = resultados.find((r) => r._id === 'EXPENSE')?.total || 0;

        return {
            totalIngresos,
            totalEgresos,
            balanceNeto: totalIngresos - totalEgresos,
        };
    }
}

export default FinancialRepository;