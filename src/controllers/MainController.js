const { Controller } = require('@farahub/framework/foundation');
const { Doc, Auth, Workspace, Injection, Validator } = require('@farahub/framework/facades');
const mongoose = require('mongoose');
const { upperFirst, camelCase } = require('lodash');


const { ObjectId } = mongoose.Types;


class MainController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Main';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'post',
            path: '/transactions',
            handler: 'createOrUpdate',
        },
        {
            type: 'api',
            method: 'post',
            path: '/transactions/:transactionId/markPaid',
            handler: 'markPaid',
        },

        // per model
        {
            type: 'api',
            method: 'get',
            path: '/:model/:modelId/trasactions',
            handler: 'list',
        },
        {
            type: 'api',
            method: 'get',
            path: '/:model/:modelId/isSettled',
            handler: 'isSettled',
        },
        {
            type: 'api',
            method: 'get',
            path: '/:model/:modelId/totalPaid',
            handler: 'totalPaid',
        },
        {
            type: 'api',
            method: 'get',
            path: '/:model/:modelId/remaining',
            handler: 'remaining',
        },
        {
            type: 'api',
            method: 'post',
            path: '/:model/:modelId/settle',
            handler: 'settle',
        },
        {
            type: 'api',
            method: 'post',
            path: '/:model/:modelId/payments',
            handler: 'addPayment',
        },

        //
    ]

    /**
     * Create new or update an existing transaction
     * 
     * @return void
     */
    createOrUpdate() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.createOrUpdate'),
            // Validator.validate(),
            async function (req, res, next) {
                try {
                    // const validator = new Validator(req.body, {
                    //     'client': 'required',
                    //     'amount': 'required|numeric',
                    //     'type': 'required|in:RECEIVEABLE,PAYABLE',
                    //     'note': 'string',
                    // });

                    // if (validator.fails()) {
                    //     return res.status(422).json({
                    //         ok: false,
                    //         status: 422,
                    //         message: 'Unprocessable Entity',
                    //         errors: validator.errors.all()
                    //     })
                    // }

                    const Transaction = req.wsConnection.model('Transaction');

                    const transaction = await Transaction.createOrUpdate(req.body);

                    return res.json({ ok: true, transaction: transaction.toObject() })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Settle the transaction
     * 
     * @return void
     */
    markPaid() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.markPaid'),
            // Validator.validate(),
            async function (req, res, next) {
                try {
                    const { transactionId } = req.params;

                    const Transaction = req.wsConnection.model('Transaction');
                    const transaction = await Transaction.findById(
                        ObjectId(transactionId)
                    )

                    await transaction.markPaid();

                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get a list of all model transactions
     * 
     * @return void
     */
    list() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.list'),
            async function (req, res, next) {
                try {
                    const { model, modelId } = req.params;

                    const Transaction = req.wsConnection.model('Transaction');

                    const args = req.query;

                    let search = {
                        referenceModel: upperFirst(camelCase(model)),
                        reference: modelId
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
        ]
    }

    /**
     * Get model settled status
     * 
     * @return void
     */
    isSettled() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.isSettled'),
            async function (req, res, next) {
                try {
                    const { model, modelId } = req.params;

                    const ModelClass = req.wsConnection.model(upperFirst(camelCase(model)))

                    const document = await Doc.resolve(modelId, ModelClass);

                    const isSettled = await document.isSettled();

                    return res.json({ ok: true, isSettled })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get invoice total paid
     * 
     * @return void
     */
    totalPaid() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.totalPaid'),
            async function (req, res, next) {
                try {
                    const { model, modelId } = req.params;

                    const ModelClass = req.wsConnection.model(upperFirst(camelCase(model)))

                    const document = await Doc.resolve(modelId, ModelClass);

                    const totalPaid = await document.getTotalPaid();

                    return res.json({ ok: true, totalPaid })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get invoice remaining
     * 
     * @return void
     */
    remaining() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.remaining'),
            async function (req, res, next) {
                try {
                    const { model, modelId } = req.params;

                    const ModelClass = req.wsConnection.model(upperFirst(camelCase(model)))

                    const document = await Doc.resolve(modelId, ModelClass);

                    const remaining = await document.getRemaining();

                    return res.json({ ok: true, remaining })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Settle the invoice
     * 
     * @return void
     */
    settle() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.settle'),
            async function (req, res, next) {
                try {
                    const { model, modelId } = req.params;

                    const document = await Doc.resolve(modelId, model);

                    await document.settle();

                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Add new payment for the model
     * 
     * @return void
     */
    addPayment() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.addPayment'),
            async function (req, res, next) {
                try {
                    // const validator = new Validator(req.body, {
                    //     'amount': 'required|numeric',
                    // });

                    // if (validator.fails()) {
                    //     return res.status(422).json({
                    //         ok: false,
                    //         status: 422,
                    //         message: 'Unprocessable Entity',
                    //         errors: validator.errors.all()
                    //     })
                    // }

                    const { model, modelId } = req.params;

                    const data = req.body;

                    const Model = req.wsConnection.model(model);

                    const document = await Model
                        .findById(modelId)
                        .populate([
                            { path: "transactions" },
                            { path: "items" }
                        ]);

                    if (data.amount > document.remaining) {
                        return res.json({ ok: false, error: 'amount is more than invoice remaining' });
                    }

                    // const Client = req.wsConnection.model('Person');
                    // const client = await Doc.resolve(invoice.client, Client);

                    const Transaction = req.wsConnection.model('Transaction');
                    const transaction = await Transaction.createOrUpdate({
                        client: document.client,
                        amount: data.amount,
                        type: 'RECEIVEABLE',
                        reference: document.id,
                        referenceModel: model
                    });

                    await transaction.markPaid();

                    await document.calculateRemaining();

                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = MainController;