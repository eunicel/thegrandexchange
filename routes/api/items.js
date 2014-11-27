var express = require('express');
var router = express.Router();
var Item = require('../../models/item').Item;
var Offer = require('../../models/item').Offer;
var utils = require('../../utils');

// GET /items
// get all items
router.get('/', function(req, res) {
  Item.getItems(function(items) {
    if(items && items.length > 0) {
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

  if(name === '' || description === ''){
    return res.json({error: 'All fields are required.', success: false});
  }

  Item.createItem(name, description, function(item) {
    if(item !== null) {
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
    if(item !== null) {
      res.json({item: item, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// GET /items/:item_id/offers - get offers of item with item_id
router.get('/:item_id/offers', function(req, res) {
  var item_id = req.param('item_id');
  Item.getItemById(item_id, function(item) {
    if(item !== null){
      res.json({offers: item.offers, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// POST /items/:item_id/offers
// create new offer
router.post('/:item_id/offers', function(req, res) {
  var item_id = req.param('item_id');

  if (req.body.postedBy != req.user._id) {
    res.json({message: "Unauthorized.", success: false});
  } else {

    Item.getItemById(item_id, function(item){
      var offers = item.offers;
      // var id;
      // if(offers.length === 0){
      //   id = 0;
      // } else {
      //   id = offers[offers.length-1]._id+1;
      // }
      var offer = {
        // _id: id,
        postedBy: req.body.postedBy,
        postedAt: req.body.postedAt,
        price: req.body.price,
        type: req.body.type,
        item: item.name
      };
      Item.createOffer(item_id, offer, function(transaction) {
        if(transaction !== null) {
          res.json({transaction: transaction, success: true});
        } else {
          res.json({success: false});
        }
      });
    });
  }
});

// GET /items/:item_id/offers/:offer_id
router.get('/:item_id/offers/:offer_id', function(req, res) {
  var item_id = req.param('item_id');
  var offer_id = req.param('offer_id');
  Item.getOfferById(item_id, offer_id, function(offer){
    if(offer !== null) {
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
  Item.deleteOffer(req.user._id, item_id, offer_id, function(offer) {
    if(offer !== null) {
      res.json({offer: offer, success: true});
    } else {
      res.json({success: false});
    }
  });
});

module.exports = router;
