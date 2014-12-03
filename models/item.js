/* Item Model */
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var utils = require('../utils');
var Transaction = require('../models/user').Transaction;
var User = require('../models/user').User;

var api_user = require('../config/secrets').api_user;
var api_key = require('../config/secrets').api_key;
var sendgrid  = require('sendgrid')(api_user, api_key);


// Send email notifications to buyer and seller of the matched offers
var emailTransactionNotification = function(buyer_email, seller_email, item_name, price) {
  var emailToBuyer = {
    to      : buyer_email,
    from    : "thegrandexchange@mit.edu",
    subject : "Your Buy Offer was Matched!",
    text    : "Your offer to buy " + item_name + " was matched with " + seller_email + " for $" + price +
              ". \nDon't forget to review your transaction! \n\n The Grand Exchange"
  }
  var emailToSeller = {
    to      : seller_email,
    from    : "thegrandexchange@mit.edu",
    subject : "Your Sell Offer was Matched!",
    text    : "Your offer to sell " + item_name + " was matched with " + buyer_email + " for $" + price +
              ". \nDon't forget to review your transaction! \n\n The Grand Exchange"
  }
  sendgrid.send(emailToBuyer, function(err, json) {
    if (err) { console.error(err); }
  });
  sendgrid.send(emailToSeller, function(err, json) {
    if (err) { console.error(err); }
  });
}


// Offer schema
var offerSchema = mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  item: {type : String, ref: 'Item'},
  postedAt: Date,
  price: Number,
  type: String,
  minReputation: Number
});

var Offer = mongoose.model('Offer', offerSchema);

// Item schema
var itemSchema = mongoose.Schema({
  name: String,
  description: String,
  offers: [{
    type : mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  }],
  flags: Array
});

// Get all Items
itemSchema.statics.getItems = function(callback) {
  Item.find()
  .populate('offers')
  .exec(function(err, items) {
    utils.handleError(err);
    callback(items);
  });
};

// Create a new Item
itemSchema.statics.createItem = function(name, description, callback) {
  var item = new Item({
    name: name,
    description: description,
    offers: [],
    flags: []
  });
  item.save(function(err, item) {
    callback(item);
  });
};

// Get an item with a specific item ID
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

// Get all the offers of a specific item with item ID
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

// Create an offer for a specific item
// Checks for offers that may match.
// Buy offers are matched with the lowest sell offer where sell price < buy price
// Sell offers are matched with the highest buy offer where sell price < buy price
// If no match is found:
//      the new Offer is added to the User and Item
// If a match is found:
//      a new Transaction is created
//      the offers are removed from users and the Item
//      the new Transaction is added to the users
//      email notifications are sent to the users of the transaction
itemSchema.statics.createOffer = function(item_id, offerData, callback) {
  var offer = new Offer(offerData);

  // Offer matching
  // buy: match with LOWEST sell offer
  // sell: match with HIGHEST buy offer where sell < buy
  if (offer.type === "buy") {
    Item.findOne({_id: item_id}) //populate item with offers
    .populate({
      path: 'offers',
      match: { type: "sell"},
    })
    .exec(function(err, itemwithoutuser) {
      utils.handleError(err);
      var options = {
        path: 'offers.postedBy',
        model: 'User'
      }
      Item.populate(itemwithoutuser, options, function(err, item) {
        utils.handleError(err);
        var minSell = undefined;
        for (var i = 0; i<item.offers.length; i++) { // check each sell offer of the item
          if (item.offers[i].price <= offer.price) { // matchable price
            if (item.offers[i].postedBy._id.toString() === offer.postedBy.toString()) { // BAD: a previous offer by the same user has a matchable price!
              callback(null, "You cannot post an offer that would match your own offer");
              return;
            }
            if (item.offers[i].postedBy.reputation >= offer.minReputation) { // matchable reputation
              if (minSell === undefined || item.offers[i].price < minSell) { // keep track of the best price
                minSell = item.offers[i];
              }
            }
          }
        }
        //store only valid new offers (where user's previous offers would not match this new offer)
        offer.save(function(err, offer){
          utils.handleError(err);
        });

        if (!minSell) { // no match; store offer for User and Item
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
          callback(null, "No match");
        }
        else { // matching offers: create new transaction with seller price (automatically stored under users), delete other offer from other user and from item
          Transaction.createTransaction(offer, minSell, item_id, minSell.price, function(transaction) {
            Item.removeOfferFromItemAndUser(item_id, minSell._id, function(offer){});
            User.findOne({_id:offer.postedBy}, function(err, buyer) {
              //send email notifications out for the new transaction
              emailTransactionNotification(buyer.email, minSell.postedBy.email, item.name, minSell.price);
            });
            callback(transaction, null);
          });
        }
      });
    });
  }
  else { // sell offer
    Item.findOne({_id: item_id})
    .populate({
      path: 'offers',
      match: { type: "buy"},
    })
    .exec(function(err, itemwithoutuser) {
      utils.handleError(err);
      var options = {
        path: 'offers.postedBy',
        model: 'User'
      }
      Item.populate(itemwithoutuser, options, function(err, item) {
        utils.handleError(err);
        var maxBuy = undefined;
        for (var i = 0; i < item.offers.length; i++) { // check each buy offer of the item
          if (item.offers[i].price >= offer.price) { // matchable price
            if (item.offers[i].postedBy._id.toString() === offer.postedBy.toString()) { // BAD: a previous offer by the same user has a matchable price!
              callback(null, "You cannot post an offer that would match your own offer");
              return;
            }
            if (item.offers[i].postedBy.reputation >= offer.minReputation) { // matchable reputation
              if (maxBuy === undefined || item.offers[i].price > maxBuy) { // keep track of the best price
                maxBuy = item.offers[i];
              }
            }
          }
        }
        //store only valid new offers (where user's previous offers would not match this new offer)
        offer.save(function(err, offer){
          utils.handleError(err);
        });

        if (! maxBuy) { // no match; store offer for User and Item
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
          callback(null, "No match");
        }
        else { // matching offers: create new transaction with seller price (automatically stored under users), delete other offer from other user and from item
          Transaction.createTransaction(maxBuy, offer, item_id, maxBuy.price, function(transaction) {
            Item.removeOfferFromItemAndUser(item_id, maxBuy._id, function(offer){});
            User.findOne({_id:offer.postedBy}, function(err, seller) {
              //send email notifications out for the new transaction
              emailTransactionNotification(maxBuy.postedBy.email, seller.email, item.name, maxBuy.price);
            });
            callback(transaction, null);
          });
        }
      });
    });
  }
};

// Get an offer by its ID
itemSchema.statics.getOfferById = function(item_id, offer_id, callback) {
  Offer.findOne({_id: offer_id})
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

// Delete an offer (must be postedBy the current session user)
itemSchema.statics.deleteOffer = function(userid, item_id, offer_id, callback) {
  Offer.findOne({_id: offer_id}, function(err, offer) {
    if (userid.toString() == offer.postedBy.toString()) {
      Offer.findOneAndRemove({_id: offer_id}, function(err, offer) {
        utils.handleError(err);
        callback(offer);
      });
    } else {
      callback("Must be user who posted offer.");
    }
  })
};

// Flag an Item
// Users may flag any item they find inappropriate. A user may flag each item only once
// Items that receive 3 flags are deleted
itemSchema.statics.flag = function (userid, item_id, callback) {
  Item.findOne({_id: item_id}, function(err, item) {
    utils.handleError(err);
    var alreadyRated = false;
    if(item.flags.length < 2) {
      for (var i = 0; i < item.flags.length; i++){
        if(item.flags[i].toString() === userid.toString()){
          alreadyRated = true;
        }
      }
      if(!alreadyRated) {
        item.flags.push(userid);
      }
      item.save(function(err, item) {
        callback(item);
      });
    }
    else if (item.flags.length === 2) {
      for (var i = 0; i < item.flags.length; i++) {
        if(item.flags[i].toString() === userid.toString()) {
          alreadyRated = true;
        }
      }
      if(!alreadyRated) {
        Item.findOne({_id: item_id}, function(err, item) {
          utils.handleError(err);
          var offers = item.offers;
          for (var i = 0; i < offers.length; i++) {
            Offer.findOneAndRemove({_id: offers[i]}, function(err, offer){
              User.findOne({_id: offer.postedBy}, function(err, user) {
                for (var i = user.offers.length-1; i >= 0; i--){
                  if(user.offers[i] === offer._id){
                    user.offers.splice(1, i);
                  }
                }
                user.save(function(err){});
              })
            });
          }
        });
        Item.findOneAndRemove({_id: item_id}, function(err, item) {
          utils.handleError(err);
          callback(item);
        });
      }
      else {
        callback(item);
      }
    }
  });
}

// Delete an item from the database
itemSchema.statics.deleteItem = function(item_id, callback) {
  Item.findOneAndRemove({_id: item_id}, function(err, item) {
    utils.handleError(err);
    callback(item);
  })
}

// create model
var Item = mongoose.model('Item', itemSchema);

// export
module.exports = {
  Offer: Offer,
  Item: Item
};
