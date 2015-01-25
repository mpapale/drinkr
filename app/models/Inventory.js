var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InventorySchema = new Schema({
    name: String,
    picture: { type: String, default: '' },
    description: { type: String, default: '' },
    // optional
    location: String,
    owners: [{ type: String, ref: 'User' }],
    bottles: [ { 
        // Wine ID ref
        wine: { type: String, ref: 'Wine'}, 
        // Number of bottles of this volume
        quantity: { type: Number, min: 1 },
        // Volume in ML
        volume: { type: Number, min: 1 }
    } ],

    notes: { type: String, default: '' }
});

module.exports = mongoose.model('Inventory', InventorySchema);