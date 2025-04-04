const { Controller } = require('@farahub/framework/foundation');
const isValid = require('date-fns/isValid');
const fromUnixTime = require('date-fns/fromUnixTime');
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");
const { Workspace, Auth } = require('@farahub/framework/facades');


class ReportsController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Reports';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/reports/income-expense',
            handler: 'incomeExpense',
        },
    ]

    /**
     * Get a list of all contract transactions
     * 
     * @return void
     */
    incomeExpense() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            async (req, res, next) => {
                try {
                    const Transaction = req.wsConnection.model('Transaction');

                    const args = req.query;

                    let matchStage = {};

                    // Date range filtering
                    if (args && args.fromDate && isValid(fromUnixTime(args.fromDate))) {
                        matchStage.paidAt = {
                            ...matchStage.paidAt,
                            $gte: startOfDay(fromUnixTime(args.fromDate))
                        };
                    }

                    if (args && args.toDate && isValid(fromUnixTime(args.toDate))) {
                        matchStage.paidAt = {
                            ...matchStage.paidAt,
                            $lt: endOfDay(fromUnixTime(args.toDate))
                        };
                    }

                    // Group by transaction type to get totals
                    const report = await Transaction.aggregate([
                        { $match: matchStage },
                        {
                            $group: {
                                _id: "$type",
                                totalAmount: { $sum: "$amount" },
                                count: { $sum: 1 }
                            }
                        }
                    ]);

                    // Format the response
                    const result = {
                        income: 0,
                        expense: 0,
                        net: 0
                    };

                    report.forEach(item => {
                        if (item._id === Transaction.TYPE_RECEIVEABLE) {
                            result.income = item.totalAmount;
                        } else if (item._id === Transaction.TYPE_PAYABLE) {
                            result.expense = item.totalAmount;
                        }
                    });

                    result.net = result.income - result.expense;

                    return res.json({ ok: true, ...result });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = ReportsController;