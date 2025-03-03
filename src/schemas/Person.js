const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;


const PersonSchema = new Schema({
    //
}, { timestamps: true });


PersonSchema.plugin(mongooseLeanVirtuals);

module.exports = PersonSchema;