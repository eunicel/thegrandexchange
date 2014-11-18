/* Transaction Model */
var mongoose = require('mongoose');
var utils = require('../utils');
var User = require('../models/user');

var transactionSchema = mongoose.Schema({
  buyOffer : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Offer'
  },
  sellOffer : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Offer'
  },
  buyerRated: Boolean,
  sellerRated: Boolean,
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  price: Number
});

// /users/user_id/transactions POST
// Create a new transaction, add transaction to user's transactions
transactionSchema.statics.createTransaction = function(buyOffer, sellOffer, price, callback) {
  transaction = new Transaction({
    buyOffer: buyOffer._id,
    sellOffer: sellOffer._id,
    buyerRated: false,
    sellerRated: false,
    item: buyOffer.item,
    price: price
  });
  transaction.save(function(err, transaction) {
    callback(transaction);
  });

  User.update({_id: buyOffer.postedBy}, {
    $addToSet: {
      transactions: transaction
    }
  }, function(err, numaffected, doc) {
  });

  User.update({_id: sellOffer.postedBy}, {
    $addToSet: {
      transactions: transaction
    }
  }, function(err, numaffected, doc) {
  });
};

// /users/user_id/transactions/transaction_id GET
// Get transaction by id
transactionSchema.statics.getTransactionById = function(user_id, transaction_id, callback) {
  Transaction.findOne({_id:transaction_id})
    .populate('buyOffer sellOffer item')
    // .populate('buyOffer.postedBy sellOffer.postedBy')
    .exec(function(err, transaction) {
      utils.handleError(err);
      if (transaction.buyOffer.postedBy === user_id || transaction.sellOffer.postedBy === user_id) {
        callback(transaction);
      }
      else {
        callback("You are not authorized to view this transaction");
      }
    });
};

// /users/user_id/transactions/transaction_id PUT
// Add a review to a transaction
// TODO: (Bug) you can review yourself
transactionSchema.statics.addTransactionReview = function(userid, transactionid, review, callback) {
  Transaction.findOne({_id:transactionid})
  .populate('buyOffer', 'postedBy')
  .populate('sellOffer', 'postedBy')
  .exec(function(err, transaction) {
    utils.handleError(err);
    if (transaction.buyOffer.postedBy === userid && !transaction.buyerRated) {
      User.findOne({_id: userid}).exec(function(err, user) {
        user.addReview(review);
      });
      transaction.buyerRated = true;
      transaction.save();
    } else if (transaction.sellOffer.postedBy === userid && !transaction.sellerRated) {
      User.findOne({_id: userid}).exec(function(err, user) {
        user.addReview(review);
      });
      transaction.sellerRated = true;
      transaction.save();
    } else {
      callback("You're not authorized to review this transaction, or you already reviewed it.");
    }
  });
};

// POST
// Rate a transaction: Changes reputation of other user in transaction
// transactionSchema.statics.addTransactionReview = function(reviewerid, transactionid, rating, callback) {
// }

var Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;