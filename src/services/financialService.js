import Transaction from '../models/financialTransaction.js';
import { getNextSequenceValue } from '../utils/sequence.js';

export class FinancialTransactionService {
    constructor(financialRepository, deliverableRepository, dbClient) {
        this.financialRepository = financialRepository;
        this.deliverableRepository = deliverableRepository;
        this.dbClient = dbClient; 
    }

    async createTransaction(transactionData) {
        const transaction = new Transaction(transactionData);
        transaction.assertValid();

        const session = await this.dbClient.startSession();
        let createdTransaction;

        try {
            await session.withTransaction(async () => {
                if (transaction.reference) {
                    const existing = await this.financialRepository.findByReference(
                        transaction.reference,
                        { session }
                    );
                    if (existing) {
                        throw new Error(`La transacción con referencia "${transaction.reference}" ya fue procesada.`);
                    }
                }

                const autoId = await getNextSequenceValue(this.financialRepository.collection.db, 'transactions_id');
                const doc = { id: autoId, ...transaction.toObject() };

                createdTransaction = await this.financialRepository.create(doc, { session });
            });

            return createdTransaction;
        } finally {
            await session.endSession();
        }
    }

    async handleDeliverableStatusOrDelete(deliverableId, action, newStatus = null) {
        const session = await this.dbClient.startSession();

        try {
            await session.withTransaction(async () => {
                const deliverable = await this.deliverableRepository.findOne(
                    { id: Number(deliverableId) },
                    { session }
                );
                if (!deliverable) {
                    throw new Error(`El entregable con ID ${deliverableId} no existe.`);
                }

                if (action === 'DELETE') {
                    await this.financialRepository.deleteByDeliverableId(deliverableId, { session });
                    await this.deliverableRepository.deleteByCustomId(deliverableId, { session });
                } else if (action === 'CHANGE_STATUS') {
                    if (newStatus === 'CANCELLED') {
                        await this.financialRepository.deleteByDeliverableId(deliverableId, { session });
                    }
                    await this.deliverableRepository.updateStatus(deliverableId, newStatus, { session });
                }
            });

            return true;
        } finally {
            await session.endSession();
        }
    }

    async getBalanceSummary(filters = {}) {
        const { clientId, startDate, endDate } = filters;

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw new Error('La fecha inicial no puede ser mayor que la fecha final.');
        }

        const transactions = await this.financialRepository.getFiltered({
            clientId,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null
        });

        const summary = transactions.reduce(
            (acc, tx) => {
                if (tx.type === 'INCOME') {
                    acc.totalIncome += tx.amount;
                } else if (tx.type === 'EXPENSE') {
                    acc.totalExpenses += tx.amount;
                }
                return acc;
            },
            { totalIncome: 0, totalExpenses: 0 }
        );

        return {
            totalIncome: summary.totalIncome,
            totalExpenses: summary.totalExpenses,
            netBalance: summary.totalIncome - summary.totalExpenses,
            transactionCount: transactions.length
        };
    }

    async getResumenPorCliente(clientId) {
        return await this.financialRepository.getResumenAgregadoPorCliente(clientId);
    }
}