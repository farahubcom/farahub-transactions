const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;


const ContractSchema = new Schema({
    //
}, { timestamps: true });

ContractSchema.plugin(mongooseLeanVirtuals);

module.exports = ContractSchema;