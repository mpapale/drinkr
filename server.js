var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var request = require('request');
var _ = require('underscore');

var WineModel = require('./app/models/Wine');
var BottleModel = require('./app/models/Bottle');
var UserModel = require('./app/models/User');
var WineTastingModel = require('./app/models/WineTasting');
var CacheModel = require('./app/models/Cache');


// Configure bodyParser so we can get POST data...
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Set up mongo
mongoose.connect('mongodb://localhost:27017');

var UNKNOWN_COUNTRY = 'unknown';


// Set up routes
var restRouter = express.Router();
var port = process.env.PORT || 8080;
var googleApiKey = process.env.GOOGLE_API_KEY;

if (_.isUndefined(googleApiKey)) {
	console.error("GOOGLE_API_KEY environment variable must be defined");
	process.exit();
}

// Catch-all logging function
restRouter.use(function(req, res, next) {
	console.log('restRouter got hit');
	next();
});

// Hello world (stat) response
restRouter.get('/', function(req, res) {
	res.json({ message: 'this is an api' });
});

var serializeWine = function(wine, req) {
	wine.name = req.body.name;
	wine.producer = req.body.producer;
	wine.description = req.body.description;
	wine.picture = req.body.picture;
	wine.regionOrAppellation = req.body.regionOrAppellation;
	wine.grapeVarieties = req.body.grapeVarieties;
	wine.vintage = +req.body.vintage;
	wine.alcohol = +req.body.alcohol;
	wine.notes = req.body.notes;
};
var serializeBottle = function(bottle, req) {
	console.dir(req.body)
	bottle.picture = req.body.picture;
	bottle.description = req.body.description;
	bottle.owners = req.body.owners;
	bottle.wine = req.body.wine;
	bottle.volume = +req.body.volume;
	bottle.price = +req.body.price;
	bottle.notes = req.body.notes;
};
var serializeUser = function(user, req) {
	user.name = req.body.name;
	user.picture = req.body.picture;
	user.notes = req.body.notes;
};
var serializeWineTasting = function(wineTasting, req) {
	var body = req.body;
	wineTasting.taster = body.taster;
	wineTasting.wine = body.wine;
	wineTasting.date = _.isString(body.date) ? Date.parse(body.date) : new Date(body.date);
	wineTasting.location = body.location;
	wineTasting.tastingPartners = body.tastingPartners;
	wineTasting.picture = body.picture;
	wineTasting.color = body.color;
	wineTasting.colorDepth = body.colorDepth;
	wineTasting.colorHue = body.colorHue;
	wineTasting.clarity = body.clarity;
	wineTasting.aromaIntensity = body.aromaIntensity;
	wineTasting.development = body.development;
	wineTasting.aromas = body.aromas;
	wineTasting.sweetness = body.sweetness;
	wineTasting.body = body.body;
	wineTasting.acidity = body.acidity;
	wineTasting.tanninLevel = body.tanninLevel || '';
	wineTasting.tanninType = body.tanninType || '';
	wineTasting.balance = body.balance;
	wineTasting.excess = body.excess;
	wineTasting.flavorIntensity = body.flavorIntensity;
	wineTasting.flavors = body.flavors;
	wineTasting.finish = body.finish;
	wineTasting.conclusion = body.conclusion;
	wineTasting.style = body.style;
	wineTasting.rating = +body.rating;
	wineTasting.food = body.food || '';
	wineTasting.foodPairingMatch = body.foodPairingMatch || '';
	wineTasting.notes = body.notes || '';
};



// TODO augmenter and populateFields should be enabled on entity GET as well
var makeRestRoutes = function(root, Model, serializer, populateField, augmenter) {
	var massagePopulateField = function() {
		return _.isArray(populateField) ? populateField : [populateField];
	};
	var populateQuery = function(query) {
		if (populateField) {
			var popField = massagePopulateField();
			_.each(popField, function(field) {
				query = query.populate(field);
			});
		}
		return query;
	};
	var populateModel = function(model, cb) {
		if (populateField) {
			var popField = massagePopulateField();
			Model.populate(
				model, 
				_.map(popField, function(f) {
					return { path: f };
				}),
				cb
			);
		} else {
			cb(null, model);
		}
	};

	// Wire up the entities
	// The List endpoint
	restRouter.route('/' + root)
		// _C_reate
		.post(function(req, res) {
			var model = new Model();
			serializer(model, req);
			model.save(function(err, model) {
				if (err) {
					res.status(500).send(err).end();
				}
				populateModel(model, function(err, model) {
					if (err) {
						res.send(err);
						res.status(500).end();
					}

					if (augmenter) {
						augmenter([model], function(err) {
							if (err) {
								res.status(500).send(err).end();
							}
							res.status(201);
							res.json(model);
						});
					} else {
						res.status(201);
						res.json(model);
					}
				});
			});
		})
		//_R_ead
		.get(function(req, res) {
			var query = Model.find();
			query = populateQuery(query);
			query.exec(function(err, models) {
				if (err) {
					res.send(err);
					res.status(500).end();
				}

				if (augmenter) {
					augmenter(models, function(err) {
						if (err) {
							res.status(500).send(err).end();
						}
						res.json(models);
					});
				} else {
					res.json(models);
				}
			});
		})
		.put(function(req, res) {
			res.status(405).end();
		})
		.delete(function(req, res) {
			res.status(405).end();
		});

	// The Entity endpoint
	var validate = function(err, res, object) {
		if (err) {
			if (err.name === 'CastError' &&
				err.type === 'ObjectId') {

				res.status(404).end();
				return false;
			}
			res.status(500);
			res.send(err);
			res.end();
			return false;
		}
		if (object === null) {
			res.status(404).end();
			return false;
		}
		return true;
	};

	restRouter.route('/' + root + '/:id')
		// Read
		.get(function(req, res) {
			var query = Model.findById(req.params.id);
			populateQuery(query);
			query.exec(function(err, model) {
				if (validate(err, res, model)) {
					res.json(model);
				}
			});
		})
		// Update (full only)
		.put(function(req, res) {
			Model.findById(req.params.id, function(err, model) {
				if (validate(err, res, model)) {

					serializer(model, req);

					model.save(function(err, model) {
						if (err) {
							res.send(err);
							res.status(500).end();
						}
						populateModel(model, function(err, model) {
							if (err) {
								res.send(err);
								res.status(500).end();
							}
							res.status(201);
							res.json(model);
						});
					});
				}
			})
		})
		// Delete
		.delete(function(req, res) {
			Model.findOneAndRemove({
				_id: req.params.id
			}, function(err, model) {
				if (validate(err, res, model)) {
					res.json();
				}
			})
		})
		.post(function(req, res) {
			res.status(405).end();
		});
};

var retrieveAddress = function(cache, address, cb) {
	cache.cache = cache.cache || {};

	// TODO expiry
	if (_.has(cache.cache, address)) {
		console.info('found ' + address + ' in cache.');
		cb(null, cache.cache[address]);
	} else {
		request(
			'https://maps.googleapis.com/maps/api/geocode/json?' + 
			'key=' + googleApiKey + '&' + 
			'address=' + encodeURIComponent(address),
			function(err, response, body) {
				if (err) {
					cb(err, UNKNOWN_COUNTRY);
					return
				}
				var respObject = JSON.parse(body),
					country = UNKNOWN_COUNTRY,
					lat = -1,
					lng = -1,
					results = respObject.results[0],
					addressData = (results && results.address_components) || [],
					geometryData = (results && results.geometry) || {},
					locationData = (geometryData && geometryData.location) || {},
					countryData = _.find(addressData, function(datum) {
						return _.contains(datum.types, 'country');
					});

				// Both OK and ZERO_RESULTS are cacheable
				if (respObject.status !== "OK" && respObject.status !== 'ZERO_RESULTS') {
					cb("Google API status = " + respObject.status, UNKNOWN_COUNTRY);
					return;
				}

				if (countryData) {
					country = countryData.long_name; 
				}
				if (locationData) {
					lat = locationData.lat;
					lng = locationData.lng;
				}

				cache.cache[address] = {
					country: country,
					lat: lat,
					lng: lng
				};

				cache.markModified('cache');

				cb(null, cache.cache[address]);
			}
		);
	}
};

var cacheLookup = function(models, cb) {
	var cacheName = "addressCache";
	CacheModel.findOne({ 'name': cacheName }, 'cache', function(err, cache) {
		if (err) {
			cb(err);
			return;
		}
		if (cache === null) {
			cache = new CacheModel();
			cache.name = cacheName;
			cache.cache = {};
		}

		var countdown = models.length;
		if (countdown === 0) {
			cb(null);
		} else {
			_.each(models, function(model) {
				retrieveAddress(
					cache,
					model.wine.regionOrAppellation,
					function(err, addressCache) {
						model.wine.country = addressCache.country;
						model.wine.lat = addressCache.lat;
						model.wine.lng = addressCache.lng;

						if (--countdown === 0) {
							cache.save();
							cb(null);
						}
					}
				);
			});
		}
	});
};

makeRestRoutes('wines', WineModel, serializeWine);
makeRestRoutes(
	'bottles', 
	BottleModel, 
	serializeBottle, 
	['wine','owners'],
	cacheLookup
);
makeRestRoutes('users', UserModel, serializeUser);
makeRestRoutes(
	'wine-tastings', 
	WineTastingModel, 
	serializeWineTasting,
	['wine', 'taster', 'tastingPartners'],
	cacheLookup
);


var viewsRouter = express.Router();
viewsRouter.get('/', function(req, res) {
	res.sendfile('./app/views/index.html');
});

// Final config
app.use('/api', restRouter);
app.use('/views', viewsRouter);
app.use('/static', express.static(__dirname + '/app/static'));
app.listen(port);
console.log('listening on ' + port);