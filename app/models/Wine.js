var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WineSchema = new Schema({
	name: String,
	producer: String,
	regionOrAppellation: String,
	grapeVarieties: [ { species: String, percentage: { type: Number, min: 0, max: 100 } }],
	vintage: Number,
	alcohol: { type: Number, min: 0, max: 100 },
	price: { type: Number, min: 0}
});

module.exports = mongoose.model('Wine', WineSchema);