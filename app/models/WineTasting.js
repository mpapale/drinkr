var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var colors = ['red','white','rose','orange'];
var colorDepths = ['watery', 'pale', 'medium', 'deep', 'dark'];
var colorHues = [
	// whites:
	'greenish', 'yellow', 'straw yellow', 'gold', 'amber',
	// reds:
	'purplish', 'ruby', 'red', 'garnet', 'brick', 'brown',
	// rose
	'pink', 'salmon', 'orange', 'copper'
];
var clarities = ['clear', 'slight haze', 'cloudy'];
var aromaIntensities = ['low','moderate','aromatic','powerful'];
var developments = ['youthful','some age','aged'];
var sweetnesses = ['bone dry','dry','off dry','medium sweet','sweet','very sweet'];
var bodies = ['very light','light','medium','medium-full','full-bodied','heavy'];
var acidities = ['tart','crisp','smooth','flabby'];
var tanninLevels = ['','low','medium','high'];
var tanninTypes = ['','soft','round','dry','hard'];
var balances = ['good','fair','unbalanced'];
var excesses = ['alcohol','acid','tannin','sugar'];
var flavorIntensities = ['low','moderate','flavorful','powerful'];
var finishes = ['short','medium','long','v. long'];
var styles = ['traditional','in-between','modern'];
var foodPairingMatches = ['','perfect','good','neutral','bad'];


var WineTastingSchema = new Schema({
	taster: { type: String, ref: 'User' },
	wine: { type: String, ref: 'Wine' },

	date: { type: Date, default: Date.now },
	location: String,
	tastingPartners: [{ type: String, ref: 'User' }],
	picture: { type: String, default: '' },
	
	color: { type: String, enum: colors },
	colorDepth: { type: String, enum: colorDepths },
	colorHue: { type: String, enum: colorHues },
	clarity: { type: String, enum: clarities },

	aromaIntensity: { type: String, enum: aromaIntensities },
	development: { type: String, enum: developments },
	aromas: [String],

	sweetness: { type: String, enum: sweetnesses },
	body: { type: String, enum: bodies },
	acidity: { type: String, enum: acidities },
	tanninLevel: { type: String, enum: tanninLevels },
	tanninType: { type: String, enum: tanninTypes },
	balance: { type: String, enum: balances },
	excess: { type: String, enum: excesses },
	flavorIntensity: { type: String, enum: flavorIntensities },
	flavors: [String],
	finish: { type: String, enum: finishes },

	conclusion: String,
	style: { type: String, enum: styles },
	rating: { type: Number, min: 0, max: 5},

	food: { type: String, default: ''},
	foodPairingMatch: { type: String, enum: foodPairingMatches, default: '' },

	notes: { type: String, default: '' } 
});

module.exports = mongoose.model('WineTasting', WineTastingSchema);