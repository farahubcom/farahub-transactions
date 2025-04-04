const mongoose = require("mongoose");
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { Schema } = mongoose;


const PersonSchema = new Schema({
    //
}, {

    /**
     * Name of the collection
     * 
     * @var string
     */
    collection: "people:people",
    
    /**
     * Enable collection timestamps
     * 
     * @var bool
     */
    timestamps: true, 
});


PersonSchema.plugin(mongooseLeanVirtuals);

module.exports = PersonSchema;