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
}

export default FinancialRepository;