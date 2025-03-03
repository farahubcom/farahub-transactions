const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;


const InvoiceSchema = new Schema({
    //
}, { timestamps: true });


InvoiceSchema.plugin(mongooseLeanVirtuals);

module.exports = InvoiceSchema;