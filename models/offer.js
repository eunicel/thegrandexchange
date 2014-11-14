/* Offer Model */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var utils = require('../utils');
var Item = require('../models/item');

// offer schema
var offerSchema = mongoose.Schema({
  postedBy: {type: String, ref: 'User'},
  postedAt: Date,
  price: Number,
  type: String
});

// POST - create new offer
offerSchema.statics.createOffer = function(item_id, postedBy, postedAt, price, type, callback) {
  var offer = new Offer({
    postedBy: postedBy,
    postedAt: postedAt,
    price: price,
    type: type
  });

  offer.save(function(err, offer) {
    utils.handleError(err);
    Item.findOne({_id:item_id})
    .populate('offers')
    .exec(function(err, item) {
      utils.handleError(err);
      item.offers.push(offer);
      item.save(function(err, item) {
        callback(item);
      });
    });
  });
}

// GET - get offer by id
offerSchema.statics.getOfferById = function(offer_id, callback) {
  Offer.findOne({_id:offer_id}, function(err, offer) {
    utils.handleError(err);
    callback(offer);
  });
}

// DELETE - delete offer
offerSchema.statics.deleteOffer = function(item_id, offer_id, callback) {
  Offer.findOneAndRemove({_id:offer_id}, function(err, offer) {
    utils.handleError(err);
    Item.findOne({_id:item_id},function(err, item){
      utils.handleError(err);
      item.offers.remove(offer_id);
      callback(offer);
    });
  });
}

// create model
var Offer = mongoose.model('Offer', offerSchema);

// export
module.exports = Offer;


