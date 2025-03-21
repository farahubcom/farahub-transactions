const mongoose = require("mongoose");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const Transaction = require("../models/Transaction");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;


const TransactionSchema = new Schema({
    client: { type: ObjectId, ref: 'Person', required: true },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: [
            Transaction.TYPE_RECEIVEABLE,
            Transaction.TYPE_PAYABLE
        ],
        required: true
    },
    reference: { type: ObjectId, refPath: 'referenceModel' },
    referenceModel: String,
    note: String,
    paidAt: Date
}, {

    /**
     * Name of the collection
     * 
     * @var string
     */
    collection: "transactions:transactions",
});

TransactionSchema.plugin(mongooseLeanVirtuals);

module.exports = TransactionSchema;