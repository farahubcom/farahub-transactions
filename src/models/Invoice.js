const sumBy = require("lodash/sumBy");


class Invoice {

    /**
     * Calculate invoice remaining
     * 
     * @return void
     */
    async calculateRemaining() {
        const Transaction = this.model('Transaction');
        const Invoice = this.model('Invoice');

        const remaining = {
            referenceModel: 'Invoice',
            reference: this.id,
            client: this.customer,
            type: Transaction.TYPE_RECEIVEABLE,
            paidAt: null,
        }

        const invoice = await Invoice.findById(this.id).populate([
            // { path: "transactions" },
            { path: "items" },
        ]);

        const totalPaid = await invoice.getTotalPaid();

        if (totalPaid < invoice.total) {
            let transaction = await Transaction.findOne(remaining);

            transaction = transaction || new Transaction(remaining);

            transaction.amount = invoice.total - totalPaid;

            if (transaction.isNew) {
                transaction.createdAt = new Date();
            }

            await transaction.save();
        }

        if (totalPaid === invoice.total) {
            await Transaction.deleteMany(remaining);
        }
    }

    /**
     * Settle the invoice
     * 
     * @return void
     */
    async settle() {
        try {
            const Transaction = this.model('Transaction');

            await Transaction.updateMany(
                {
                    referenceModel: 'Invoice',
                    reference: this.id,
                    client: this.customer,
                    type: Transaction.TYPE_RECEIVEABLE,
                    paidAt: null
                },
                { paidAt: new Date() }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if invoice is settled
     */
    async isSettled() {
        try {
            const totalPaid = await this.getTotalPaid();
            return this.total < totalPaid;
            // const Transaction = this.model('Transaction');

            // const unpaids = await Transaction.count({
            //     referenceModel: 'Invoice',
            //     reference: this.id,
            //     client: this.customer,
            //     type: Transaction.TYPE_RECEIVEABLE,
            //     paidAt: null
            // });

            // return unpaids < 1;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get invoice total paid
     */
    async getTotalPaid() {
        try {
            const Transaction = this.model('Transaction');

            const transactions = await Transaction.find({
                referenceModel: 'Invoice',
                reference: this.id,
                client: this.customer,
                type: Transaction.TYPE_RECEIVEABLE,
                paidAt: { $ne: null }
            });

            return sumBy(transactions, 'amount');
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get invoice remaining
     */
    async getRemaining() {
        try {
            const totalPaid = await this.getTotalPaid();

            const Invoice = this.model('Invoice');
            const self = await Invoice
                .findById(this.id)
                .populate([
                    { path: 'items' }
                ])

            return self.total - totalPaid;
        } catch (error) {
            throw error;
        }
    }

    //
}

module.exports = Invoice;