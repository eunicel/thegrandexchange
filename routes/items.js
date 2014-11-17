var express = require('express');
var router = express.Router();
var Item = require('../models/item');
// var Offer = require('../models/offer');
var utils = require('../utils');

// GET /items
// get all items
router.get('/', function(req, res) {
  Item.getItems(function(items) {
    if(items != null){
      res.json({items: items, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// POST /items
// create items
router.post('/', function(req, res) {
  var name = req.body.name;
  var description = req.body.description;
  Item.createItem(name, description, function(item) {
    if(item != null){
      res.json({item: item, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// GET /items/:item_id - get item with item_id
router.get('/:item_id', function(req, res) {
  var item_id = req.param('item_id');
  Item.getItemById(item_id, function(item) {
    if(item != null){
      res.json({item: item, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// GET /items/:item_id/offers/:offer_id
// get offer with offer_id
router.get('/:item_id/offers/:offer_id', function(req, res) {
  var offer_id = req.param('offer_id');
  Offer.getOfferById(offer_id, function(offer) {
    if(offer != null){
      res.json({offer: offer, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// POST /items/:item_id/offers/offer_id
// create new offer
router.post('/:item_id/offers', function(req, res) {
  var item_id = req.param('item_id');

  Item.getItemById({_id: item_id}, function(item){
    var offers = item.offers;
    var id;
    if(offers.length === 0){
      id = 0;
    } else {
      offers[offers.length-1]._id+1;
    }
    var offer = {
      _id: id,
      postedBy: req.body.postedBy,
      postedAt: req.body.postedAt,
      price: req.body.price,
      type: req.body.type
    }
    Item.createOffer(item_id, offer, function(offer) {
      if(offer != null){
        res.json({offer: offer, success: true});
      } else {
        res.json({success: false});
      }
    });
  });

});

// GET /items/:item_id/offers/:offer_id
router.get('/:item_id/offers/_offer_id', function(req, res) {
  var item_id = req.param('item_id');
  var offer_id = req.param('offer_id');
  Item.getOfferById(item_id, offer_id, function(offer){
    if(offer != null){
      res.json({offer: offer, success: true});
    } else {
      res.json({success: false});
    }
  });
});


// DELETE /items/:item_id/offers/:offer_id
// delete offer
router.delete('/:item_id/offers/:offer_id', function(req, res){
  var offer_id = req.param('offer_id');
  var item_id = req.param('item_id');
  Item.deleteOffer(item_id, offer_id, function(offer) {
    if(offer != null){
      res.json({offer: offer, success: true});
    } else {
      res.json({success: false});
    }
  });
});

module.exports = router;
