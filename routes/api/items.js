var express = require('express');
var router = express.Router();
var Item = require('../../models/item').Item;
var Offer = require('../../models/item').Offer;
var utils = require('../../utils');

// GET /items
// Get all items
router.get('/', utils.loggedIn, function(req, res) {
  Item.getItems(function(items) {
    if(items && items.length > 0) {
      res.json({items: items, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// POST /items
// Create an item
router.post('/', utils.loggedIn, function(req, res) {
  var name = req.body.name;
  var description = req.body.description;

  if(name === '' || description === ''){
    return res.json({error: 'All fields are required.', success: false});
  }

  Item.createItem(name, description, function(item) {
    if (item) {
      res.json({item: item, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// GET /items/:item_id
// Get an item with id item_id
router.get('/:item_id', utils.loggedIn, function(req, res) {
  var item_id = req.param('item_id');
  Item.getItemById(item_id, function(item) {
    if (item) {
      res.json({item: item, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// GET /items/:item_id/offers
// Get offers for item with id item_id
router.get('/:item_id/offers', utils.loggedIn, function(req, res) {
  var item_id = req.param('item_id');
  Item.getItemById(item_id, function(item) {
    if (item) {
      res.json({offers: item.offers, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// POST /items/:item_id/offers
// Create offers for item with id item_id
router.post('/:item_id/offers', utils.loggedIn, function(req, res) {
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
  else if (isNaN(req.body.minReputation) || req.body.minReputation === '') {
    res.json({message: "You must enter a minimum reputation between 1 and 5", success: false});
  }
  else if (req.body.minReputation < 0 || req.body.minReputation > 5) {
    res.json({message: "Minimum reputation must be between 1 and 5", success: false});
  }
  else {
    Item.getItemById(item_id, function(item){
      var offers = item.offers;
      var newDate = new Date(parseInt(req.body.postedAt));
      var offer = {
        postedBy: req.body.postedBy,
        postedAt: newDate,
        price: req.body.price,
        type: req.body.type,
        item: item.name,
        minReputation: req.body.minReputation
      };
      Item.createOffer(item_id, offer, function(transaction, message) {
        if (transaction) {
          res.json({transaction: transaction, message: message, success: true});
        } else {
          res.json({message: message, success: false});
        }
      });
    });
  }
});

// GET /items/:item_id/offers/:offer_id
// Get offer with id offer_id for item with id item_id
router.get('/:item_id/offers/:offer_id', utils.loggedIn, function(req, res) {
  var item_id = req.param('item_id');
  var offer_id = req.param('offer_id');
  Item.getOfferById(item_id, offer_id, function(offer){
    if (offer) {
      res.json({offer: offer, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// POST /items/:item_id/flags
// Flag item with id item_id as inappropriate
router.post('/:item_id/flags', utils.loggedIn, function(req, res) {
  var item_id = req.param('item_id');
  Item.getItemById(item_id, function(item) {
    if (item) {
      Item.flag(req.user._id, item_id, function(item) {
        res.json({item: item, success: true});
      });
    } else {
      res.json({success: false});
    }
  });
});


// DELETE /items/:item_id/offers/:offer_id
// Delete offer with id offer_id from item with id item_id
router.delete('/:item_id/offers/:offer_id', utils.loggedIn, function(req, res){
  var offer_id = req.param('offer_id');
  var item_id = req.param('item_id');
  Item.deleteOffer(req.user._id, item_id, offer_id, function(offer) {
    if (offer) {
      res.json({offer: offer, success: true});
    } else {
      res.json({success: false});
    }
  });
});

module.exports = router;
