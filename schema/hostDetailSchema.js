const mongoose = require('mongoose');
const schema = mongoose.Schema;

const hostDetailSchema = new schema({
    host_id:Number,
    user_id:Number
});

module.exports = mongoose.model('hostDetailModel', hostDetailSchema, 'Host Detail');