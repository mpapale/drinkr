var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
    picture: { type: String, default: '' },
    favoriteWines: [{ type: String, ref: 'Wine' }],
    notes: { type: String, default: '' }
});

module.exports = mongoose.model('User', UserSchema);