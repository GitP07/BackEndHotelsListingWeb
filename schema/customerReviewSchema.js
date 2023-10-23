
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const customerReviewSchema = new schema({
    customer_id:Number,
    hotel_id:Number,
    customer_review:String,
    customer_rating:String,
    review_date:String
})

module.exports = mongoose.model('customerReviewModel', customerReviewSchema, 'Customer Review');