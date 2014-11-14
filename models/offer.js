/* Offer Model */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// offer schema
var offerSchema = mongoose.Schema({
  postedBy: {type: ObjectId, ref: 'User'},
  postedAt: Date,
  price: Number,
  type: String
});

// POST - create new offer
offerSchema.statics.createOffer = function(postedBy, postedAt, price, type, callback) {
  var offer = new Offer({
    postedBy: postedBy,
    postedAt: postedAt,
    price: price,
    type: type
  });
  offer.save(function(err, offer) {
    callback(offer);
  });
}

// GET - get offer by id
offerSchema.statics.getOfferById = function(offer_id, callback) {
  Offer.findOne({_id:offer_id}, function(err, offer) {
    if (err) {
      throw err;
    } else {
      callback(offer);
    }
  });
}

// DELETE - delete offer
offerSchema.statics.deleteOffer = function(offer_id, callback) {
  Offer.findOneAndRemove({_id:offer_id}, function(err, offer) {
    if (err) {
      throw err;
    } else {
      callback(offer);
    }
  });
}

// create model
var Offer = mongoose.model('Offer', offerSchema);

// export
module.exports = Offer;


