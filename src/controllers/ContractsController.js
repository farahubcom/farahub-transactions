const { Controller } = require('@farahub/framework/foundation');
const { Doc } = require('@farahub/framework/facades');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;


class ContractsController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Contracts';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/contract/:contractId/trasactions',
            handler: 'trasactions',
        },
        {
            type: 'api',
            method: 'get',
            path: '/contract/:contractId/isSettled',
            handler: 'isSettled',
        },
        {
            type: 'api',
            method: 'get',
            path: '/contract/:contractId/totalPaid',
            handler: 'totalPaid',
        },
        {
            type: 'api',
            method: 'get',
            path: '/contract/:contractId/remaining',
            handler: 'remaining',
        },
        {
            type: 'api',
            method: 'post',
            path: '/contract/:contractId/settle',
            handler: 'settle',
        },
        {
            type: 'api',
            method: 'post',
            path: '/contract/:contractId/payments',
            handler: 'addPayment',
        },
    ]

    /**
     * Get a list of all contract transactions
     * 
     * @return void
     */
    trasactions(socket) {
        return async function (req, res, next) {
            try {
                const { contractId } = req.params;

                const Transaction = req.wsConnection.model('Transaction');

                const args = req.query;

                let search = {
                    referenceModel: 'Contract',
                    reference: ObjectId(contractId)
                };

                const sort = args && args.sort ? args.sort : "-createdAt"

                const query = Transaction.find(search)
                    .populate([
                        { path: 'client' }
                    ]);

                query.sort(sort)

                const total = await Transaction.find(search).count();

                if (args && args.page > -1) {
                    const perPage = args.perPage || 25;
                    query.skip(args.page * perPage)
                        .limit(perPage)
                }

                const data = await query.lean({ virtuals: true });

                return res.json({ ok: true, data, total });
            } catch (error) {
                next(error);
            }
        }
    }

    /**
     * Get contract settled status
     * 
     * @return void
     */
    isSettled(socket) {
        return async function (req, res, next) {
            try {
                const { contractId } = req.params;

                const Contract = req.wsConnection.model('Contract');

                const contract = await Doc.resolve(contractId, Contract);

                const isSettled = await contract.isSettled();

                return res.json({ ok: true, isSettled })
            } catch (error) {
                next(error);
            }
        }
    }

    /**
     * Get contract total paid
     * 
     * @return void
     */
    totalPaid(socket) {
        return async function (req, res, next) {
            try {
                const { contractId } = req.params;

                const Contract = req.wsConnection.model('Contract');

                const contract = await Doc.resolve(contractId, Contract);

                const totalPaid = await contract.getTotalPaid();

                return res.json({ ok: true, totalPaid })
            } catch (error) {
                next(error);
            }
        }
    }

    /**
     * Get contract remaining
     * 
     * @return void
     */
    remaining(socket) {
        return async function (req, res, next) {
            try {
                const { contractId } = req.params;

                const Contract = req.wsConnection.model('Contract');

                const contract = await Doc.resolve(contractId, Contract);

                const remaining = await contract.getRemaining();

                return res.json({ ok: true, remaining })
            } catch (error) {
                next(error);
            }
        }
    }

    /**
     * Settle the contract
     * 
     * @return void
     */
    settle(socket) {
        return async function (req, res, next) {
            try {
                const { contractId } = req.params;

                const Contract = req.wsConnection.model('Contract');

                const contract = await Doc.resolve(contractId, Contract);

                await contract.settle();

                return res.json({ ok: true })
            } catch (error) {
                next(error);
            }
        }
    }

    /**
     * Add new payment for the contract
     * 
     * @return void
     */
    addPayment(socket) {
        return async function (req, res, next) {
            try {
                const { contractId } = req.params;

                const data = req.body;

                const Contract = req.wsConnection.model('Contract');

                const contract = await Contract
                    .findById(ObjectId(contractId))
                    .populate([
                        { path: "transactions" },
                    ]);

                if (data.amount > contract.remaining) {
                    return res.json({ ok: false, error: 'amount is more than contract remaining' });
                }

                // const Client = req.wsConnection.model('Person');
                // const client = await Doc.resolve(contract.client, Client);

                const Transaction = req.wsConnection.model('Transaction');
                const transaction = await Transaction.createOrUpdate({
                    client: contract.client,
                    amount: data.amount,
                    type: 'RECEIVEABLE',
                    reference: contract.id,
                    referenceModel: 'Contract'
                });

                await transaction.markPaid();

                await contract.calculateRemaining();

                return res.json({ ok: true })
            } catch (error) {
                next(error);
            }
        }
    }

    //
}

module.exports = ContractsController;