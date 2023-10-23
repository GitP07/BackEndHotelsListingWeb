const mongoose = require('mongoose');
const schema = mongoose.Schema;

const hotelRoomSchema = new schema({
    room_type: String,
    room_capacity: Number,
    room_price: Number,
    room_availability:Boolean,
    hotel_id:Number
});

module.exports = mongoose.model('hotelRoomModel', hotelRoomSchema, 'Hotel Room');