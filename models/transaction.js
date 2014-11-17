/* Transaction Model */
var mongoose = require('mongoose');
var utils = require('../utils');

var transactionSchema = mongoose.Schema({
  buy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  sell : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  price: Number
});

// /users/user_id/transactions POST
// Create a new transaction initially without reviews
transactionSchema.statics.createTransaction = function(buyer, seller, price, callback) {
  transaction = new Transaction({
    buyer: buy,
    seller: sell,
    price: price
  });
  transaction.save(function(err, transaction) {
    callback(transaction);
  });
}

// /users/user_id/transactions/transaction_id GET
// Get transaction by id
transactionSchema.statics.getTransactionById = function(userid, transactionid, callback) {
  Transaction.findOne({_id:transactionid})
    .populate('buyer')
    .populate('seller')
    .exec(function(err, transaction) {
      utils.handleError(err);
      if (transaction.buyer.postedBy._id === userid || transaction.sell.postedBy._id === userid) {
        callback(transaction);
      }
      else {
        callback("You are not authorized to view this transaction");
      }
    });
}

// /users/user_id/transactions/transaction_id PUT
// Add a review to a transaction
transactionSchema.statics.addTransactionReview = function(userid, transactionid, review, callback) {
  Transaction.findOne({_id:transactionid}).populate('buy').populate('sell').exec(function(err, poptransaction) {
    utils.handleError(err);
    if (poptransaction.buy.postedBy === userid || poptransaction.sell.postedBy === userid) {
      Transaction.update( {_id:transactionid}, {$addToSet: {reviews : review}}, function(err, numberAffected, transaction) {
        utils.handleError(err);
        callback(transaction);
      });
    }
  });
}

// POST
// Rate a transaction: Changes reputation of other user in transaction
// transactionSchema.statics.addTransactionReview = function(reviewerid, transactionid, rating, callback) {
// }

var Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;