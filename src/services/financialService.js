export class FinancialTransactionService {
    constructor(financialRepository, deliverableRepository, dbClient) {
        this.financialRepository = financialRepository;
        this.deliverableRepository = deliverableRepository;
        this.dbClient = dbClient; 
    }

    // Para registrar una transacción financiera (ingreso o egreso) en una transacción ACID para evitar duplicados
    async createTransaction(transactionData) {
        const session = await this.dbClient.startSession();
        let createdTransaction;

        try {
            await session.withTransaction(async () => {
                // Validaciones básicas
                if (!['INCOME', 'EXPENSE'].includes(transactionData.type)) {
                    throw new Error('El tipo debe ser "INCOME" o "EXPENSE".');
                }
                if (!transactionData.amount || transactionData.amount <= 0) {
                    throw new Error('El monto debe ser un valor positivo.');
                }

                // Para prevenir duplicidad si viene un identificador único/referencia
                if (transactionData.reference) {
                    const existing = await this.financialRepository.findByReference(
                        transactionData.reference,
                        { session }
                    );
                    if (existing) {
                        throw new Error(`La transacción con referencia "${transactionData.reference}" ya fue procesada.`);
                    }
                }

                // Para crear registro dentro de la transacción
                createdTransaction = await this.financialRepository.create(transactionData, { session });
            });

            return createdTransaction;
        } finally {
            await session.endSession();
        }
    }

    // Para cambiar el estado de un entregable o eliminarlo, ejecutando rollback financiero si es necesario
    async handleDeliverableStatusOrDelete(deliverableId, action, newStatus = null) {
        const session = await this.dbClient.startSession();

        try {
            await session.withTransaction(async () => {
                const deliverable = await this.deliverableRepository.findById(deliverableId, { session });
                if (!deliverable) {
                    throw new Error(`El entregable con ID ${deliverableId} no existe.`);
                }

                if (action === 'DELETE') {
                    // Si el entregable tenía pagos asociados, revertir o eliminar registros financieros
                    await this.financialRepository.deleteByDeliverableId(deliverableId, { session });
                    await this.deliverableRepository.delete(deliverableId, { session });
                } else if (action === 'CHANGE_STATUS') {
                    if (newStatus === 'CANCELLED') {
                        // Rollback/Reversión de transacciones asociadas
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

    // Calcular el balance financiero general con opciones de filtrado
    async getBalanceSummary(filters = {}) {
        const { clientId, startDate, endDate } = filters;

        // Validación de rango de fechas
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
}