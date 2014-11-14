var express = require('express');
var router = express.Router();
var Item = require('../models/item');
var Offer = require('../models/offer');


// GET /items - get all items
router.get('/items', function (req, res){
  Items.getItems(function (items){
    res.json({items:items, session: req.session});
  });
});

// POST /items - create items
router.post('/items', function (req, res){
  var name = req.body.name;
  var description = req.body.description;
  Item.createItem(name, description, function (item){
    res.json({item:item, session:req.session});
  });
});

// GET /items/:item_id - get item with item_id
router.get('/items/:item_id', function (req, res){
  var item_id = req.param('item_id');
  Item.getItemById(item_id, function (item){
    res.json({item:item, session:req.session});
  });
});

// POST /items/:item_id - add offer to item
router.post('/items/:item_id', function (req, res){
  var item_id = req.param('item_id');
  var offer = req.body.offer;
  Item.addOfferToItem(offer, item_id, function (offer){
    res.json({offer:offer, session:req.session});
  });
});

// GET /items/:item_id/offers/:offer_id - get offer with offer_id
router.get('/items/:item_id/offers/:offer_id', function (req, res){
  var offer_id = req.param('offer_id');
  Offer.getOfferById(offer_id, function (offer){
    res.json({offer:offer, session:req.session});
  });
});

// POST /items/item_id/offers/offer_id - create new offer
router.post('/items/:item_id/offers/:offer_id', function (req, res){
  var offer_id = req.param('offer_id');
  var postedBy = req.body.postedBy;
  var postedAt = req.body.postedAt;
  var price = req.body.price;
  var type = req.body.type;
  Offer.createOffer(postedBy, postedAt, price, type, function (offer){
    res.json({offer:offer, session:req.session});
  });
});

// DELETE /items/item_id/offers/offer_id - delete offer
router.delete('/items/:item_id/offers/:offer_id', function (req, res){
  var offer_id = req.param('offer_id');
  Offer.deleteOffer(offer_id, function(offer){
    res.json({offer:offer, session:req.session});
  });
});

