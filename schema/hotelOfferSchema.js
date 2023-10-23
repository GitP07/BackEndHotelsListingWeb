
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const hotelOfferSchema = new schema({
    offer_id: Number,
    offer_type: String,
    offer_descr: String
});

module.exports = mongoose.model('hotelOfferModel', hotelOfferSchema, 'Hotel Offer');
