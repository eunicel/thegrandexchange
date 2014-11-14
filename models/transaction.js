/* Transaction Model */
var mongoose = require('mongoose');

var transactionSchema = mongoose.Schema({
  buy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Offer'
  },
  sell : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Offer'
  },
  reviews: [String]
});

// /users/user_id/transactions POST
// Create a new transaction initially without reviews
transactionSchema.statics.createTransaction = function(buy, sell, callback) {
  transaction = new Transaction({
    buy : buy,
    sell : sell,
    reviews = []
  });
  transaction.save(function(err, transaction){
    callback(transaction);
  });
}

// /users/user_id/transactions/transaction_id GET
// Get transaction by id
transactionSchema.statics.getTransactionById = function(userid, transactionid, callback) {
  Transaction.findOne({_id:transactionid}).populate('buy').populate('sell').exec(function (err, poptransaction) {
    if (err) {
      throw err;
    }
    else {
      if (poptransaction.buy.postedBy === userid || poptransaction.sell.postedBy === userid) {
        callback(transaction);
      }
      else {
        callback("You are not authorized to view this transaction");
      }
    }
  });
}

// /users/user_id/transactions/transaction_id PUT
// Add a review to a transaction
transactionSchema.statics.addTransactionReview = function(userid, transactionid, review, callback) {
  Transaction.findOne({_id:transactionid}).populate('buy').populate('sell').exec(function (err, poptransaction) {
    if (err) {
      throw err;
    }
    else {
      if (poptransaction.buy.postedBy === userid || poptransaction.sell.postedBy === userid) {
        Transaction.update( {_id:transactionid}, {$addToSet: {reviews : review}}, function (err, numberAffected, transaction){
          if (err) {
            throw err;
          } else {
            callback(transaction);
          }
        });
      }
    }
  });
}

// POST
// Rate a transaction: Changes reputation of other user in transaction
// transactionSchema.statics.addTransactionReview = function(reviewerid, transactionid, rating, callback) {
// }

var Transaction = mongoose.model('Transaction', transactionSchema);
exports.Transaction = Transaction;