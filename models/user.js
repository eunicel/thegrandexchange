var mongoose = require('mongoose');
var utils = require('../utils');

var userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  reputation: Number,
  offers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  }],
  reviews: [{
    text: String,
    score: Number
  }],
  transactions: [{
    type : mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
});

userSchema.statics.userExists = function(email, callback) {
  User.find({email: email}, function(err, users) {
    callback(users.length > 0);
  });
};

// /users/ POST
// Create a new user
userSchema.statics.createUser = function(firstName, lastName, email, password, callback) {
  User.find({email: email}, function(err, users) {
    user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      reputation: 0,
      offers: [],
      reviews: [],
      transactions: [],
    });
    user.save(function(err, user){
      utils.handleError(err);
      callback(user);
    });
  });
};

// /users/user_id GET
// Get user by id
userSchema.statics.getUserById = function(user_id, callback) {
  User.findOne({_id: user_id})
  .populate('offers transactions')
  .exec(function(err, user) {
    utils.handleError(err);
    callback(user);
  });
};

// Here, two arguments are passed to callback: err, user in that order.
userSchema.statics.getUserByEmail = function(email, callback) {
  User.findOne({email: email}, callback);
};

// /users/user_id/transactions GET
// Get all transactions of a user
userSchema.statics.getUserTransactions = function(user_id, callback) {
  User.findOne({_id: user_id})
  .lean()
  .populate({ path: 'transactions' })
  .exec(function(err, user) {
    var options = {
      path: 'transactions.buyOffer transactions.sellOffer',
      model: 'Offer'
    };
    //populate user.transactions with buyOffer, sellOffer
    Transaction.populate(user, options, function(err, withpopoffers){
      utils.handleError(err);
      var options = {
        path: 'transactions.buyOffer.postedBy transactions.sellOffer.postedBy',
        model: 'User'
      }
      //populate user.transactions buyOffer, sellOffer with postedBy
      Transaction.populate(withpopoffers, options, function(err, withpostedat) {
        utils.handleError(err);
        var options = {
          path: 'transactions.item',
          model: 'Item'
        }
        //populate user.transactions with items
        Transaction.populate(withpostedat, options, function(err, withitem) {
          utils.handleError(err);
          callback(withitem.transactions);
        });
      });
    });
  });
};

// POST /users/user_id/reviews
// add new review for user with specified user_id
userSchema.statics.addReview = function(user_id, review, callback) {
  User.findOne({_id: user_id}, function(err, user) {
    utils.handleError(err);
    user.reviews.push(review);
    user.reputation += review.score;
    user.save();
    callback(user);
  });
};

// GET /users/user_id/offers
// get all offers for user with specified user_id
userSchema.statics.getOffers = function(user_id, callback) {
  User.findOne({_id: user_id})
  .populate('offers')
  .exec(function(err, user) {
    utils.handleError(err);
    callback(user.offers);
  });
};

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
transactionSchema.statics.createTransaction = function(buyOffer, sellOffer, item_id, price, callback) {
  transaction = new Transaction({
    buyOffer: buyOffer._id,
    sellOffer: sellOffer._id,
    buyerRated: false,
    sellerRated: false,
    item: item_id,
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
  .populate('buyOffer')
  .populate('sellOffer')
  .exec(function(err, transaction) {
    utils.handleError(err);
    if (transaction.buyOffer.postedBy.toString() === userid && !transaction.buyerRated) {
      transaction.buyerRated = true;
      transaction.save();
      User.addReview(userid, review, callback);
    } else if (transaction.sellOffer.postedBy.toString() === userid && !transaction.sellerRated) {
      transaction.sellerRated = true;
      transaction.save();
      User.addReview(userid, review, callback);
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
var User = mongoose.model('User', userSchema);
module.exports = {
  User: User,
  Transaction: Transaction
};
