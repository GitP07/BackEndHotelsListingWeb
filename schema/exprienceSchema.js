const mongoose = require('mongoose');
const schema = mongoose.Schema;

const exprienceSchema = new schema({
    exp_title: String,
    exp_descr: String,
    exp_startDate:String,
    exp_endDate:String,
    exp_location:String,
    exp_photo:String,
    exp_price:Number,
    review_id:Number,
    host_id:Number
});

module.exports = mongoose.model('exprienceModel', exprienceSchema, 'Exprience');