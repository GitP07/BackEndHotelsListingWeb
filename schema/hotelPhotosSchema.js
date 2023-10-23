
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const hotelPhotosSchema = new schema({
    hotel_id: Number,
    image_path: String,
    type: String
});

module.exports = mongoose.model('hotelPhotosModel', hotelPhotosSchema, 'Hotel Photos');