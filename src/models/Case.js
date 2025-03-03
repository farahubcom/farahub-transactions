const sumBy = require("lodash/sumBy");


class Case {

    /**
     * Calculate _case remaining
     * 
     * @return void
     */
    async calculateRemaining() {
        const Transaction = this.model('Transaction');
        const Case = this.model('Case');

        const remaining = {
            referenceModel: 'Case',
            reference: this.id,
            client: this.client,
            type: 'RECEIVEABLE',
            paidAt: null,
        }

        const _case = await Case.findById(this.id).populate([
            { path: "transactions" },
        ]);

        const totalPaid = await _case.getTotalPaid();

        if (totalPaid < _case.price) {
            let transaction = await Transaction.findOne(remaining);

            transaction = transaction || new Transaction(remaining);

            transaction.amount = _case.price - totalPaid;

            if (transaction.isNew) {
                transaction.createdAt = new Date();
            }

            await transaction.save();
        }

        if (totalPaid === _case.price) {
            await Transaction.deleteMany(remaining);
        }
    }

    /**
     * Settle the _case
     * 
     * @return void
     */
    async settle() {
        try {
            const Transaction = this.model('Transaction');

            await Transaction.updateMany(
                {
                    referenceModel: 'Case',
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
     * Check if _case is settled
     */
    async isSettled() {
        try {
            const Transaction = this.model('Transaction');

            const unpaids = await Transaction.count({
                referenceModel: 'Case',
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
     * Get _case total paid
     */
    async getTotalPaid() {
        try {
            const Transaction = this.model('Transaction');

            const transactions = await Transaction.find({
                referenceModel: 'Case',
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
     * Get _case remaining
     */
    async getRemaining() {
        try {
            const totalPaid = await this.getTotalPaid();

            const Case = this.model('Case');
            const self = await Case
                .findById(this.id)

            return self.price - totalPaid;
        } catch (error) {
            throw error;
        }
    }

    //
}

module.exports = Case;