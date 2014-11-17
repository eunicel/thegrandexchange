var express = require('express');
var router = express.Router();
var Item = require('../models/item');
var Offer = require('../models/offer');
var utils = require('../utils');

// GET /items
// get all items
router.get('/', function(req, res) {
  Item.getItems(function(items) {
    res.json({items: items});
  });
});

// POST /items
// create items
router.post('/', function(req, res) {
  var name = req.body.name;
  var description = req.body.description;
  Item.createItem(name, description, function(item) {
    res.json({item: item});
  });
});

// GET /items/:item_id - get item with item_id
router.get('/:item_id', function(req, res) {
  var item_id = req.param('item_id');
  Item.getItemById(item_id, function(item) {
    res.json({item: item});
  });
});

// GET /items/:item_id/offers/:offer_id
// get offer with offer_id
router.get('/:item_id/offers/:offer_id', function(req, res) {
  var offer_id = req.param('offer_id');
  Offer.getOfferById(offer_id, function(offer) {
    res.json({offer: offer});
  });
});

// POST /items/item_id/offers/offer_id
// create new offer
router.post('/:item_id/offers', function(req, res) {
  var item_id = req.param('item_id');

  Item.getItemById({_id: item_id}, function(item){
    var offers = item.offers;
    var id = offers[offers.length-1]._id+1;
    var offer = {
      _id: id,
      postedBy: req.body.postedBy,
      postedAt: req.body.postedAt,
      price: req.body.price,
      type: req.body.type
    }
    Item.createOffer(item_id, offer, function(offer) {
      res.json({offer: offer});
    });
  });

});

// GET /items/:item_id/offers/:offer_id
router.get('/:item_id/offers/_offer_id', function(req, res) {
  var item_id = req.param('item_id');
  var offer_id = req.param('offer_id');
  Item.getOfferById(item_id, offer_id, function(offer){
    res.json({offer: offer});
  });
});


// DELETE /items/:item_id/offers/:offer_id
// delete offer
router.delete('/:item_id/offers/:offer_id', function(req, res){
  var offer_id = req.param('offer_id');
  var item_id = req.param('item_id');
  Item.deleteOffer(item_id, offer_id, function(offer) {
    res.json({offer: offer});
  });
});

module.exports = router;
