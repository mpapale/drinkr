var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WineSchema = new Schema({
	name: String,
	producer: String,
    description: { type: String, default: '' },
    picture: { type: String, default: '' },
	regionOrAppellation: String,
    // -1 means unknown %
	grapeVarieties: [ { species: String, percentage: { type: Number, min: -1, max: 100 , default: -1 } }],
	vintage: Number,
	alcohol: { type: Number, min: 0, max: 100 },
	price: { type: Number, min: 0},

    notes: { type: String, default: '' }
});

module.exports = mongoose.model('Wine', WineSchema);