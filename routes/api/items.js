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
  }
  else if (isNaN(req.body.price)) {
    res.json({message: "You must enter a price", success: false});
  }
  else if (req.body.price < 0) {
    res.json({message: "Price cannot be negative", success: false});
  }
  else if (isNaN(req.body.minReputation)) {
    res.json({message: "You must enter a minimum reputation between 1 and 5", success: false});
  }
  else if (req.body.minReputation < 0 || req.body.minReputation > 5) {
    res.json({message: "Minimum reputation must be between 1 and 5", success: false});
  }

  else {

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
        item: item.name,
        // minReputation: 3
        minReputation: req.body.minReputation
      };
      Item.createOffer(item_id, offer, function(transaction, message) {
        if(transaction !== null) {
          res.json({transaction: transaction, message: message, success: true});
        } else {
          res.json({message: message, success: false});
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

router.post('/:item_id/flags', function(req, res) {
  var item_id = req.param('item_id');
  Item.getItemById(item_id, function(item) {
    if(item !== null){
      Item.flag(req.user._id, item_id, function(item) {
        res.json({item: item, success: true});
      });
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
