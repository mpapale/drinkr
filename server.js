var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var WineModel = require('./app/models/Wine');
var InventoryModel = require('./app/models/Inventory');
var UserModel = require('./app/models/User');
var WineTastingModel = require('./app/models/WineTasting');


// Configure bodyParser so we can get POST data...
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Set up mongo
mongoose.connect('mongodb://localhost:27017');


// Set up routes
var restRouter = express.Router();
var port = process.env.PORT || 8080;

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
	wine.regionOrAppellation = req.body.regionOrAppellation;
	// What is the best way to do this? What does backbone do?
	wine.grapeVarieties = JSON.parse(req.body.grapeVarieties);
	wine.vintage = +req.body.vintage;
	wine.alcohol = +req.body.alcohol;
	wine.price = +req.body.price;
};
var serializeInventory = function(inventory, req) {
	inventory.name = req.body.name;
	inventory.location = req.body.location;
	inventory.owners = JSON.parse(req.body.owners);
	inventory.bottles = JSON.parse(req.body.bottles);
};
var serializeUser = function(user, req) {
	user.name = req.body.name;
};
var serializeWineTasting = function(wineTasting, req) {
	var body = req.body;
	wineTasting.taster = body.taster;
	wineTasting.wine = body.wine;
	wineTasting.date = Date.parse(body.date);
	wineTasting.location = body.location;
	wineTasting.tastingPartners = JSON.parse(body.tastingPartners);
	wineTasting.color = body.color;
	wineTasting.colorDepth = body.colorDepth;
	wineTasting.colorHue = body.colorHue;
	wineTasting.clarity = body.clarity;
	wineTasting.aromaIntensity = body.aromaIntensity;
	wineTasting.development = body.development;
	wineTasting.aromas = JSON.parse(body.aromas);
	wineTasting.sweetness = body.sweetness;
	wineTasting.body = body.body;
	wineTasting.acidity = body.acidity;
	wineTasting.tanninLevel = body.tanninLevel || '';
	wineTasting.tanninType = body.tanninType || '';
	wineTasting.balance = body.balance;
	wineTasting.excess = body.excess;
	wineTasting.flavorIntensity = body.flavorIntensity;
	wineTasting.flavors = JSON.parse(body.flavors);
	wineTasting.finish = body.finish;
	wineTasting.conclusion = body.conclusion;
	wineTasting.style = body.style;
	wineTasting.rating = +body.rating;
	wineTasting.food = body.food || '';
	wineTasting.foodPairingMatch = body.foodPairingMatch || '';
	wineTasting.sideNotes = body.sideNotes || '';
};



var makeRestRoutes = function(root, Model, serializer, populateField) {

	// Wire up the entities
	// The List endpoint
	restRouter.route('/' + root)
		// _C_reate
		.post(function(req, res) {
			var model = new Model();
			serializer(model, req);
			model.save(function(err) {
				if (err) {
					res.send(err);
					res.status(500).end();
				}
				res.status(201);
				res.json(model);
			});
		})
		//_R_ead
		.get(function(req, res) {
			var models = Model.find();
			if (populateField) {
				models = models.populate(populateField);
			}
			models.exec(function(err, models) {
				if (err) {
					res.send(err);
					res.status(500).end();
				}

				res.json(models);
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
			Model.findById(req.params.id, function(err, model) {
				if (validate(err, res, model)) {
					res.json(model);
				}
			})
		})
		// Update (full only)
		.put(function(req, res) {
			Model.findById(req.params.id, function(err, model) {
				if (validate(err, res, model)) {

					serializer(model, req);

					model.save(function(err) {
						if (err) {
							res.send(err);
						}
						res.json(model);
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
					console.log('model is ' + model)
					res.json();
				}
			})
		})
		.post(function(req, res) {
			res.status(405).end();
		});
};

makeRestRoutes('wines', WineModel, serializeWine);
makeRestRoutes('inventories', InventoryModel, serializeInventory, 'bottles.wine');
makeRestRoutes('users', UserModel, serializeUser);
makeRestRoutes('wine-tastings', WineTastingModel, serializeWineTasting);


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