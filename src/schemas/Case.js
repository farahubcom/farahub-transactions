const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;


const CaseSchema = new Schema({
    //
}, { timestamps: true });

CaseSchema.plugin(mongooseLeanVirtuals);

module.exports = CaseSchema;