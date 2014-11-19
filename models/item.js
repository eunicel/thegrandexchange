/* Item Model */
var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
var utils = require('../utils');
var Transaction = require('../models/user').Transaction;
var User = require('../models/user').User;

// Offer schema
var offerSchema = mongoose.Schema({
  postedBy: {type: String, ref: 'User'},
  item: {
    type : mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  postedAt: Date,
  price: Number,
  type: String
});

var Offer = mongoose.model('Offer', offerSchema);

// item schema
var itemSchema = mongoose.Schema({
  name: String,
  description: String,
  offers: [{
    type : mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  }]
});

// GET - returns all items
itemSchema.statics.getItems = function(callback) {
  Item.find()
  .populate('offers')
  .exec(function(err, items) {
    utils.handleError(err);
    callback(items);
  });
};

// POST - create new item
itemSchema.statics.createItem = function(name, description, callback) {
  var item = new Item({
    name: name,
    description: description,
    offers: []
  });
  item.save(function(err, item) {
    callback(item);
  });
};

// GET - get item by id
itemSchema.statics.getItemById = function(item_id, callback) {
  Item.findOne({_id:item_id})
  .lean()
  .populate({ path: 'offers' })
  .exec(function(err, item) {
    utils.handleError(err);
    var options = {
    path: 'offers.postedBy',
    model: 'User'
    };
    Offer.populate(item, options, function(err, itemwithoffers) {
      utils.handleError(err);
      callback(itemwithoffers);
    });
  });
};

// GET - get offers of item
itemSchema.statics.getItemOffers = function(item_id, callback) {
  Item.findOne({_id:item_id})
  .lean()
  .populate({ path: 'offers' })
  .exec(function(err, item) {
    utils.handleError(err);
    var options = {
    path: 'offers.postedBy',
    model: 'User'
    };
    Offer.populate(item, options, function(err, itemwithoffers) {
      utils.handleError(err);
      callback(itemwithoffers.offers);
    });
  });
};

// POST - create offer for item
// Check for offer matches and create Transactions
itemSchema.statics.createOffer = function(item_id, offerData, callback) {
  // offerData may need to be augmented with item_id and user_id
  console.log(offerData);
  offerData.postedBy = ObjectId(offerData.postedBy);
  var offer = new Offer(offerData);
  offer.save(function(err, offer){
    utils.handleError(err);
  });

  //offer matching
  // buy: match with LOWEST sell offer
  // sell: match with HIGHEST buy offer where sell < buy
  if (offer.type === "buy") {
    Item.findOne({_id: item_id})
    .populate({
      path: 'offers',
      match: { type: "sell"},
    })
    .exec(function(err, item) {
      utils.handleError(err);
      var minSell = undefined;
      for (var i = 0; i<item.offers.length; i++) {
        if (item.offers[i].price <= offer.price ) { // possible match
          if (minSell === undefined || item.offers[i].price < minSell) {
            minSell = item.offers[i];
          }
        }
      }
      if (!minSell) { // no matching offers; store offer for User and Item
        Item.update({_id: item_id}, {
          $addToSet: {
            offers: offer
          }
        }, function(err, numaffected, doc) {
        });
        User.update({_id: offerData.postedBy}, {
          $addToSet: {
            offers: offer
          }
        }, function(err, numaffected, doc) {
        });
        callback("No match");
      }
      else { // matching offers: create new transaction with seller price (automatically stored under users), delete other offer from other user and from item
        Transaction.createTransaction(offer, minSell, minSell.price, function(transaction) {
          Item.removeOfferFromItemAndUser(item_id, minSell._id, function(offer){});
          callback(transaction);
        });
      }
    });
  }
  else { // sell offer
    Item.findOne({_id: item_id})
    .populate({
      path: 'offers',
      match: { type: "buy"},
    })
    .exec(function(err, item) {
      utils.handleError(err);
      var maxBuy = undefined;
      for (var i = 0; i < item.offers.length; i++) {
        if (item.offers[i].price >= offer.price ) { // possible match
          if (maxBuy === undefined || item.offers[i].price > maxBuy) {
            maxBuy = item.offers[i];
          }
        }
      }
      if (! maxBuy) { // no matching offers; store offer for User and Item
        Item.update({_id: item_id}, {
          $addToSet: {
            offers: offer
          }
        }, function(err, numaffected, doc) {
        });
        User.update({_id: offerData.postedBy}, {
          $addToSet: {
            offers: offer
          }
        }, function(err, numaffected, doc) {
        });
        callback("No match");
      }
      else { // matching offers: create new transaction with seller price (automatically stored under users), delete other offer from other user and from item
        Transaction.createTransaction(maxBuy, offer, offer.price, function(transaction) {
          Item.removeOfferFromItemAndUser(item_id, maxBuy._id, function(offer){});
          callback(transaction);
        });
      }
    });
  }
};

// GET - get offer by id
itemSchema.statics.getOfferById = function(item_id, offer_id, callback) {
  Offer.findOne({_id:offer_id})
  .populate('postedBy')
  .populate('item')
  .exec(function(err, offer){
    utils.handleError(err);
    if (offer) {
      callback(offer);
    }
    else {
      callback("Failed to find offer with given id.");
    }
  });
};

// Helper function to remove offer from Item and User
itemSchema.statics.removeOfferFromItemAndUser = function(item_id, offer_id, callback) {
  Item.findOne({ _id: item_id}, function(err, item) {
    utils.handleError(err);
    item.offers.remove(offer_id);
    item.save(function(err, item){
      utils.handleError(err);
    });
    Offer.findOne({_id: offer_id}, function(err, offer) {
      utils.handleError(err);
      User.findOne({_id: offer.postedBy}, function(err, user) {
        utils.handleError(err);
        user.offers.remove(offer_id);
        user.save(function(err, user){
          utils.handleError(err);
        });
        callback(offer);
      });
    });
  });
};

// DELETE - delete offer
itemSchema.statics.deleteOffer = function(item_id, offer_id, callback) {
  Offer.findOneAndRemove({_id:offer_id}, function(err, offer) {
    utils.handleError(err);
    callback(offer);
  });
};

// create model
var Item = mongoose.model('Item', itemSchema);

// export
module.exports = {
  Offer: Offer,
  Item: Item
};
