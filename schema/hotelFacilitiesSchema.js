
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const hotelFacilitiesSchema = new schema({
    facilities_id: String,
    facilities_name:String,
    icon_path: String,
   
});

module.exports = mongoose.model('hotelFacilitiesModel', hotelFacilitiesSchema, 'Hotel facilities');