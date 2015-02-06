var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BottleSchema = new Schema ({
    picture: { type: String, default: '' },
    description: { type: String, default: '' },
    owners: [{ type: String, ref: 'User' }],
    wine: { type: String, ref: 'Wine' },
    volume: { type: Number, min: 1 },
    price: { type: Number, min: 0 },

    notes: { type: String, default: '' }
});

module.exports = mongoose.model('Bottle', BottleSchema);