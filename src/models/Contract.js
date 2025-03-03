const sumBy = require("lodash/sumBy");


class Contract {

    /**
     * Calculate contract remaining
     * 
     * @return void
     */
    async calculateRemaining() {
        const Transaction = this.model('Transaction');
        const Contract = this.model('Contract');

        const remaining = {
            referenceModel: 'Contract',
            reference: this.id,
            client: this.client,
            type: 'RECEIVEABLE',
            paidAt: null,
        }

        const contract = await Contract.findById(this.id).populate([
            { path: "transactions" },
        ]);

        const totalPaid = await contract.getTotalPaid();

        if (totalPaid < contract.price) {
            let transaction = await Transaction.findOne(remaining);

            transaction = transaction || new Transaction(remaining);

            transaction.amount = contract.price - totalPaid;

            if (transaction.isNew) {
                transaction.createdAt = new Date();
            }

            await transaction.save();
        }

        if (totalPaid === contract.price) {
            await Transaction.deleteMany(remaining);
        }
    }

    /**
     * Settle the contract
     * 
     * @return void
     */
    async settle() {
        try {
            const Transaction = this.model('Transaction');

            await Transaction.updateMany(
                {
                    referenceModel: 'Contract',
                    reference: this.id,
                    client: this.client,
                    type: 'RECEIVEABLE',
                    paidAt: null
                },
                { paidAt: new Date() }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if contract is settled
     */
    async isSettled() {
        try {
            const Transaction = this.model('Transaction');

            const unpaids = await Transaction.count({
                referenceModel: 'Contract',
                reference: this.id,
                client: this.client,
                type: 'RECEIVEABLE',
                paidAt: null
            });

            return unpaids < 1;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get contract total paid
     */
    async getTotalPaid() {
        try {
            const Transaction = this.model('Transaction');

            const transactions = await Transaction.find({
                referenceModel: 'Contract',
                reference: this.id,
                client: this.client,
                type: 'RECEIVEABLE',
                paidAt: { $ne: null }
            });

            return sumBy(transactions, 'amount');
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get contract remaining
     */
    async getRemaining() {
        try {
            const totalPaid = await this.getTotalPaid();

            const Contract = this.model('Contract');
            const self = await Contract
                .findById(this.id)

            return self.price - totalPaid;
        } catch (error) {
            throw error;
        }
    }

    //
}

module.exports = Contract;