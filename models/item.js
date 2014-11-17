/* Item Model */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var utils = require('../utils');

// item schema
var itemSchema = mongoose.Schema({
  name: String,
  description: String,
  offers: [{
    _id: Number,
    postedBy: {type: String, ref: 'User'},
    postedAt: Date,
    price: Number,
    type: String
  }];
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
  item.save(function(err, item){
    callback(item);
  });
}

// GET - get item by id
itemSchema.statics.getItemById = function(item_id, callback) {
  Item.findOne({_id:item_id}, function(err, item) {
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
itemSchema.statics.createOffer = function(item_id, offer, callback) {
  Item.findOne({_id:item_id}, function(err, item){
    utils.handleError(err);
      item.offers.push(offer);
      item.save(function(err){
        utils.handleError(err);
        callback(offer);
      });
  });
}

// GET - get offer by id
itemSchema.statics.getOfferById = function(item_id, offer_id, callback) {
  Item({_id:item_id}, function(err, item){
    utils.handleError(err);
    for(offer in item.offers){
      if(offer_id === offer._id){
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
    for(offer in item.offers){
      if(offer_id === offer._id){
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
var Item = mongoose.model('Item', itemSchema);

// export
module.exports = Item;
