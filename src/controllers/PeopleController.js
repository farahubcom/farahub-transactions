const { Controller } = require('@farahub/framework/foundation');
const { Doc, Auth, Workspace, Injection } = require('@farahub/framework/facades');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;


class PeopleController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'People';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/people/:personId/trasactions',
            handler: 'trasactions',
        },
        {
            type: 'api',
            method: 'get',
            path: '/people/:personId/totalDept',
            handler: 'totalDept',
        },
        {
            type: 'api',
            method: 'get',
            path: '/people/:personId/totalCredit',
            handler: 'totalCredit',
        },
        {
            type: 'api',
            method: 'get',
            path: '/people/:personId/totalBalance',
            handler: 'totalBalance',
        },
        {
            type: 'api',
            method: 'post',
            path: '/people/:personId/settle',
            handler: 'settle',
        },
    ]

    /**
     * Get a list of all person transactions
     * 
     * @return void
     */
    trasactions() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'people.transactions'),
            // Validator.validate(),
            async function (req, res, next) {
                try {
                    const { personId } = req.params;

                    const Transaction = req.wsConnection.model('Transaction');

                    const args = req.query;

                    let search = {
                        person: ObjectId(personId)
                    };

                    const sort = args && args.sort ? args.sort : "-createdAt"

                    const query = Transaction.find(search)
                        .populate([
                            { path: "reference" }
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
     * Get person total dept
     * 
     * @return void
     */
    totalDept() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'people.totalDept'),
            // Validator.validate(),
            async function (req, res, next) {
                try {
                    const { personId } = req.params;

                    const Person = req.wsConnection.model('Person');

                    const person = await Doc.resolve(personId, Person);
                    const totalDept = await person.getTotalDept();

                    return res.json({ ok: true, totalDept });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get person total credit
     * 
     * @return void
     */
    totalCredit() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'people.totalCredit'),
            // Validator.validate(),
            async function (req, res, next) {
                try {
                    const { personId } = req.params;

                    const Person = req.wsConnection.model('Person');

                    const person = await Doc.resolve(personId, Person);
                    const totalCredit = await person.getTotalCredit();

                    return res.json({ ok: true, totalCredit });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get person total credit
     * 
     * @return void
     */
    totalBalance() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'people.totalBalance'),
            // Validator.validate(),
            async function (req, res, next) {
                try {
                    const { personId } = req.params;

                    const Person = req.wsConnection.model('Person');

                    const person = await Doc.resolve(personId, Person);

                    const totalDept = await person.getTotalDept();
                    const totalCredit = await person.getTotalCredit();

                    const totalBalance = totalDept - totalCredit;

                    return res.json({ ok: true, totalBalance });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Settle the person
     * 
     * @return void
     */
    settle() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'people.settle'),
            // Validator.validate(),
            async function (req, res, next) {
                try {
                    const { personId } = req.params;

                    const Person = req.wsConnection.model('Person');

                    const person = await Doc.resolve(personId, Person);

                    await person.settle();

                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = PeopleController;