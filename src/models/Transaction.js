const pick = require("lodash/pick");
const isNil = require("lodash/isNil");
const mongoose = require("mongoose");
const { Doc } = require('@farahub/framework/facades');

const { ObjectId } = mongoose.Types;


class Transaction {

    /**
     * Type constants
     * 
     * @var string
     */
    static TYPE_RECEIVEABLE = 'receiveable';
    static TYPE_PAYABLE = 'payable';

    /**
     * Create new or update an existing transaction
     * 
     * @param {Object} data 
     * @param {ObjectId} transactionId 
     * @param {{inject: func, connection: mongoose.Connection}}
     * @returns {Transaction}
     */
    static async createOrUpdate(data, transactionId, { inject, connection }) {
        try {
            const Transaction = this.model('Transaction');

            const transaction = transactionId ? await Transaction.findById(ObjectId(transactionId)) : new Transaction();

            if (transaction.isNew) {

                // assign client
                const Person = this.model('Person');
                const client = await Doc.resolve(data.client, Person);
                transaction.client = client.id;

                // assign type
                transaction.type = data.type;
            }

            // assign fields
            Object.keys(
                pick(data, [
                    'amount',
                    'reference',
                    'referenceModel',
                    'note'
                ])
            ).forEach(key => {
                transaction[key] = data[key];
            });

            // inject preSave hook
            await inject('preSave', { transaction, data });

            // save transaction
            await transaction.save();

            // inject postSave hook
            await inject('postSave', { transaction, data })

            // return modified transaction
            return transaction;
        } catch (error) {
            throw error;
        }
    }

    /**
     * set paid date of the transaction
     * 
     * @returns {void}
     */
    async markPaid() {
        try {

            this.paidAt = new Date();

            await this.save();

        } catch (error) {
            throw error;
        }
    }

    /**
     * Check if transaction is paid
     * 
     * @returns {bool}
     */
    get isPaid() {
        return !isNil(this.paidAt);
    }

    //
}

module.exports = Transaction;