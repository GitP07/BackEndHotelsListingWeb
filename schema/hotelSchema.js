const mongoose = require('mongoose');
const schema = mongoose.Schema;

const hotelSchema = new schema({

    hotel_rating: Number,
    hotel_name: String,
    hotel_address: String,
    hotel_room: String,
    room_price:Number,
    hotel_descr:String,
    hotel_contact:Number,
    hotel_checkin:String,
    hotel_checkout:String,
    offer_price:Number,
    review_count:Number,
    photo_count:Number,
    nearby_count:Number,
    hotel_facilities:Array,
    hotel_amenities:Array,
    is_available:Boolean
})

module.exports = mongoose.model('hotelModel1', hotelSchema,'Hotel')