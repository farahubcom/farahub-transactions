const sumBy = require("lodash/sumBy");


class Person {

    /**
     * Get client total dept
     * 
     * @return integer
     */
    async getTotalDept() {

        const Transaction = this.model('Transaction');

        const transactions = await Transaction.find({
            client: this.id,
            type: "RECEIVEABLE",
            paidAt: null
        });

        return sumBy(transactions, 'amount');
    }

    /**
     * Get client total credit
     * 
     * @return void
     */
    async getTotalCredit() {

        const Transaction = this.model('Transaction');

        const transactions = await Transaction.find({
            client: this.id,
            type: "PAYABLE",
            paidAt: null
        });

        return sumBy(transactions, 'amount');
    }

    /**
     * Settle the client
     * 
     * @return void
     */
    async settle() {
        try {
            const Transaction = this.model('Transaction');

            await Transaction.updateMany(
                { 'client': this.id, paidAt: null },
                { paidAt: new Date() }
            );
        } catch (error) {
            throw error;
        }
    }

    //
}

module.exports = Person;