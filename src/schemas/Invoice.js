const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;


const InvoiceSchema = new Schema({
    //
}, {

    /**
     * Name of the collection
     * 
     * @var string
     */
    collection: "invoices:invoices",

    /**
     * Enable collection timestamps
     * 
     * @var bool
     */
    timestamps: true,
});


InvoiceSchema.plugin(mongooseLeanVirtuals);

module.exports = InvoiceSchema;