var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var WineModel = require('./app/models/Wine');


// Configure bodyParser so we can get POST data...
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Set up mongo
mongoose.connect('mongodb://localhost:27017');


// Set up routes
var router = express.Router();
var port = process.env.PORT || 8080;

// Catch-all logging function
router.use(function(req, res, next) {
	console.log('router got hit');
	next();
});

// Hello world (stat) response
router.get('/', function(req, res) {
	res.json({ message: 'this is an api' });
});

// Wire up the entities
// The List endpoint
router.route('/wine')
	// _C_reate
	.post(function(req, res) {
		var wine = new WineModel();
		wine.name = req.body.name;

		wine.save(function(err) {
			if (err) {
				res.send(err);
			}
			res.json(wine);
		});
	})
	//_R_ead
	.get(function(req, res) {
		WineModel.find(function(err, wines) {
			if (err) {
				res.send(err);
			}

			res.json(wines);
		})
	});

// The Entity endpoint
var validate = function(err, res, object) {
	if (err) {
		res.status(500);
		res.send(err);
		return false;
	}
	if (typeof object !== 'object' || object === null) {
		res.status(404).send('Not found');
		return false;
	}
	return true;
};

router.route('/wine/:id')
	// Read
	.get(function(req, res) {
		WineModel.findById(req.params.id, function(err, wine) {
			if (validate(err, res, wine)) {
				res.json(wine);
			}
		})
	})
	// Update (full only)
	.put(function(req, res) {
		WineModel.findById(req.params.id, function(err, wine) {
			if (validate(err, res, wine)) {

				wine.name = req.body.name;

				wine.save(function(err) {
					if (err) {
						res.send(err);
					}
					res.json(wine);
				});
			}
		})
	})
	// Delete
	.delete(function(req, res) {
		WineModel.remove({
			_id: req.params.id
		}, function(err, wine) {
			console.log('winebottle is ' + wine)
			if (validate(err, res, wine)) {
				res.json();
			}
		})
	});

// Final config
app.use('/api', router);
app.listen(port);
console.log('listening on ' + port);