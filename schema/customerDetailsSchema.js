const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const schema = mongoose.Schema;

const customerDetailsSchema = new schema({
    customer_id:Number,
    first_name:String,
    last_name:String,
    customer_email:String,
    customer_pass:String,
    created_at: {
        type: Date,
        default: Date.now
    },
    customer_ph:Number
});

customerDetailsSchema.pre("save", async function() {
    this.customer_pass = await bcrypt.hash(this.customer_pass, 12)

});

module.exports = mongoose.model('customerDetailsModel', customerDetailsSchema, 'Customer Details');