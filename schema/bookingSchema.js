
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const bookingSchema = new schema({
    hotel_id:Number,
    checkIn_date:String,
    checkOut_date:String,
    numbetOf_guest:Number,
    hotel_price:Number
})

module.exports = mongoose.model('bookingModel', bookingSchema, 'Hotel Booking');

