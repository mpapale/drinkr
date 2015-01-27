var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CacheSchema = new Schema({
    name: String,
    cache: {}
});

module.exports = mongoose.model('Cache', CacheSchema);