const { Controller } = require('@farahub/framework/foundation');
const { Doc, Auth, Workspace, Injection } = require('@farahub/framework/facades');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;


class InvoicesController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Invoices';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/invoices/:invoiceId/trasactions',
            handler: 'trasactions',
        },
        {
            type: 'api',
            method: 'get',
            path: '/invoices/:invoiceId/isSettled',
            handler: 'isSettled',
        },
        {
            type: 'api',
            method: 'get',
            path: '/invoices/:invoiceId/totalPaid',
            handler: 'totalPaid',
        },
        {
            type: 'api',
            method: 'get',
            path: '/invoices/:invoiceId/remaining',
            handler: 'remaining',
        },
        {
            type: 'api',
            method: 'post',
            path: '/invoices/:invoiceId/settle',
            handler: 'settle',
        },
        {
            type: 'api',
            method: 'post',
            path: '/invoices/:invoiceId/payments',
            handler: 'addPayment',
        },
    ]

    /**
     * Get a list of all invoice transactions
     * 
     * @return void
     */
    trasactions() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'invoices.transactions'),
            async function (req, res, next) {
                try {
                    const { invoiceId } = req.params;

                    const Transaction = req.wsConnection.model('Transaction');

                    const args = req.query;

                    let search = {
                        referenceModel: 'Invoice',
                        reference: ObjectId(invoiceId)
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
     * Get invoice settled status
     * 
     * @return void
     */
    isSettled() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'invoices.isSettled'),
            async function (req, res, next) {
                try {
                    const { invoiceId } = req.params;

                    const Invoice = req.wsConnection.model('Invoice');

                    const invoice = await Doc.resolve(invoiceId, Invoice);

                    const isSettled = await invoice.isSettled();

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
            Injection.register(this.module, 'invoices.totalPaid'),
            async function (req, res, next) {
                try {
                    const { invoiceId } = req.params;

                    const Invoice = req.wsConnection.model('Invoice');

                    const invoice = await Doc.resolve(invoiceId, Invoice);

                    const totalPaid = await invoice.getTotalPaid();

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
            Injection.register(this.module, 'invoices.remaining'),
            async function (req, res, next) {
                try {
                    const { invoiceId } = req.params;

                    const Invoice = req.wsConnection.model('Invoice');

                    const invoice = await Doc.resolve(invoiceId, Invoice);

                    const remaining = await invoice.getRemaining();

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
            Injection.register(this.module, 'invoices.settle'),
            async function (req, res, next) {
                try {
                    const { invoiceId } = req.params;

                    const Invoice = req.wsConnection.model('Invoice');

                    const invoice = await Doc.resolve(invoiceId, Invoice);

                    await invoice.settle();

                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Add new payment for the invoice
     * 
     * @return void
     */
    addPayment() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'invoices.addPayment'),
            async function (req, res, next) {
                try {
                    const { invoiceId } = req.params;

                    const data = req.body;

                    const Invoice = req.wsConnection.model('Invoice');

                    const invoice = await Invoice
                        .findById(ObjectId(invoiceId))
                        .populate([
                            { path: "items" }
                        ]);

                    const remaining = await invoice.getRemaining();

                    if (data.amount > remaining) {
                        return res.json({ ok: false, error: 'amount is more than invoice remaining' });
                    }

                    const Transaction = req.wsConnection.model('Transaction');
                    const transaction = await Transaction.createOrUpdate({
                        client: invoice.client,
                        amount: data.amount,
                        type: Transaction.TYPE_RECEIVEABLE,
                        reference: invoice.id,
                        referenceModel: 'Invoice'
                    });

                    await transaction.markPaid();

                    await invoice.calculateRemaining();

                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = InvoicesController;