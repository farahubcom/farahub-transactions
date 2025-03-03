const { Doc } = require('@farahub/framework/facades');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;


const hooks = {
    'Invoices': {
        'main.createOrUpdate.postSave': async ({ invoice, data, invoiceId, connection }) => {
            if (!data.id) {

                const Client = connection.model('Person');
                const client = await Doc.resolve(invoice.client, Client);
                const deposit = data.deposit ? Number(data.deposit) : 0;

                if (deposit > 0) {
                    const transaction = await client.addTransaction({
                        amount: deposit,
                        type: 'RECEIVEABLE',
                        createdAt: invoice.createdAt,
                        referenceModel: 'Invoice',
                        reference: invoice.id
                    });

                    await transaction.markPaid();
                }
            }

            await invoice.calculateRemaining();
        },
        'main.createOrUpdate.validator': () => {
            return {
                'deposit': 'numeric'
            }
        },
        'main.delete.preDelete': async ({ invoiceId, connection }) => {
            
            // remove all related transactions
            await connection.model('Transaction').deleteMany({
                referenceModel: 'Invoice',
                reference: ObjectId(invoiceId),
            });
        },
    },
    'Contract': {
        'contracts.createOrUpdate.postSave': async ({ contract, data, contractId, connection }) => {
            if (!data.id) {

                const Client = connection.model('Person');
                const client = await Doc.resolve(contract.client, Client);
                const deposit = data.deposit ? Number(data.deposit) : 0;

                if (deposit > 0) {
                    const transaction = await client.addTransaction({
                        amount: deposit,
                        type: 'RECEIVEABLE',
                        createdAt: contract.createdAt,
                        referenceModel: 'Contract',
                        reference: contract.id
                    });

                    await transaction.markPaid();
                }
            }

            await contract.calculateRemaining();
        },
        'contracts.createOrUpdate.validator': () => {
            return {
                'deposit': 'numeric'
            }
        },
        'contracts.delete.preDelete': async ({ contractId, connection }) => {
            
            // remove all related transactions
            await connection.model('Transaction').deleteMany({
                referenceModel: 'Contract',
                reference: ObjectId(contractId),
            });
        },
    },
}

module.exports = hooks;