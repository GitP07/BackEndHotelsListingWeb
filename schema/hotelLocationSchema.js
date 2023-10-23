const mongoose = require('mongoose');
const schema = mongoose.Schema;

const hotelLocationSchema = new schema({
    hotel_id: Number,
    latitude:Number,
    longitude:Number

})

module.exports = mongoose.model('hotelLocationModel', hotelLocationSchema, 'Hotel Location');