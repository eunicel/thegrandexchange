/* Item Model */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var utils = require('../utils');

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
  Item.find({}, function(err, items) {
    utils.handleError(err);
    callback(items);
  });
}

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
}

// GET - get item by id
itemSchema.statics.getItemById = function(item_id, callback) {
  Item.findOne({_id: item_id}, function(err, item) {
      utils.handleError(err);
      callback(item);
    });
}

// GET - get offers of item
itemSchema.statics.getItemOffers = function(item_id, callback) {
 Item.findOne({_id:item_id}, function(err, item) {
    utils.handleError(err);
    var offers = item.offers;
    callback(offers);
  });
}

// POST - create offer for item
itemSchema.statics.createOffer = function(item_id, offerData, callback) {
  // offerData may need to be augmented with item_id and user_id
  var offer = new Offer(offerData);
  
  Item.update({_id: item_id}, {
    $addToSet: {
      offers: offer
    }
  });
  User.update({_id: offerData.user_id}, {
    $addToSet: {
      offers: offer
    }
  });
}

// GET - get offer by id
itemSchema.statics.getOfferById = function(item_id, offer_id, callback) {
  Item({_id:item_id}, function(err, item){
    utils.handleError(err);
    for (offer in item.offers) {
      if (offer_id === offer._id) {
        callback(offer);
      }
    }
    callback("Failed to find offer with given id.");
  });
}

// DELETE - delete offer
itemSchema.statics.deleteOffer = function(item_id, offer_id, callback) {
  Item.findOne({_id:item_id}, function(err, item) {
    utils.handleError(err);
    for (offer in item.offers) {
      if (offer_id === offer._id) {
        var index = item.offers.indexOf(offer_id);
        item.offers.splice(index, 1);
        item.save(function(err, offer){
          utils.handleError(err);
          callback(offer);
        });
      }
    }
    callback("Failed to find offer to delete.");
  });
}

// create model
var Offer = mongoose.model('Offer', offerSchema);
var Item = mongoose.model('Item', itemSchema);

// export
module.exports = {
  Offer: Offer,
  Item: Item
}
