const mongoose = require('mongoose');
const schema = mongoose.Schema;

const checkInOutSchema = new schema({
    checkIn_date: String,
    checkOut_date: String,
    numberOf_guest:Number,
    location:String
});

module.exports = mongoose.model('checkInOutModel', checkInOutSchema, 'CheckIn CheckOut');