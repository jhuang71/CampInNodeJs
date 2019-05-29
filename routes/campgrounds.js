var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');

router.get('/', function(req, res) {
	// get all campgrounds from campground db
	Campground.find({}, function(err, allCampgrounds) {
		if (err) {
			console.log(err);
		} else {
			res.render('campgrounds/index', { campgrounds: allCampgrounds, currentUser: req.user });
		}
	});
});

// create - add new campground
router.post('/', middleware.isLoggedIn, function(req, res) {
	// get data from form and add to campground array
	var name = req.body.name;
	var imageURL = req.body.image;
	var price = req.body.price;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = { name: name, image: imageURL, price: price, description: description, author: author };
	// create a new campground and save to database
	Campground.create(newCampground, function(err, campground) {
		if (err) {
			console.log(err);
		} else {
			// redirect back to campgrounds page
			res.redirect('/campgrounds');
		}
	});
});

router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('campgrounds/new');
});

// RESTful - Show
router.get('/:id', function(req, res) {
	//find the campground with provided ID
	Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash('error', 'Campground not found');
			res.redirect('back');
		} else {
			res.render('campgrounds/show', { campground: foundCampground });
		}
	});
	//render show template with that campground
});

// Edit campground route
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		res.render('campgrounds/edit', { campground: foundCampground });
	});
});

// Update campground route
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	// find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
	// redirect somewhere(show page)
});

// Destory campground route
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			req.flash('success', 'Campground successfully deleted');
			res.redirect('/campgrounds');
		}
	});
});

module.exports = router;
