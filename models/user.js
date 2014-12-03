var mongoose = require('mongoose');
var utils = require('../utils');

// User schema
var userSchema = mongoose.Schema({
  activated: Boolean,
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

// Activate a user's account by taking in the user ID
userSchema.statics.activate = function(user_id, callback) {
  if (mongoose.Types.ObjectId.isValid(user_id)) {
      User.findOne({_id:user_id}, function(err, user) {
      utils.handleError(err);
      if (!user) {
        callback(null, "Incorrect Activation Code");
      }
      else {
        user.activated = true;
        user.save(function(err, user) {
          utils.handleError(err);
          callback(user, null);
        });
      }
    });
  }
  else {
    callback(null, "Incorrect Activation Code");
  }
};

// Check if a user exists
userSchema.statics.userExists = function(email, callback) {
  User.find({email: email}, function(err, users) {
    utils.handleError(err);
    callback(users.length > 0);
  });
};

// Create a new user
// New user accounts are initially not activated
// A new user has an initial reputation of 5. After that, the reputation is the average score of a user's reviews
userSchema.statics.createUser = function(firstName, lastName, email, password, callback) {
  user = new User({
    activated: false,
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    reputation: 5, //initial reputation is 5
    offers: [],
    reviews: [],
    transactions: [],
  });
  user.save(function(err, user){
    utils.handleError(err);
    callback(user);
  });
};

// Get a user with a specific user ID
userSchema.statics.getUserById = function(user_id, callback) {
  User.findOne({_id: user_id})
  .populate('offers transactions')
  .exec(function(err, user) {
    utils.handleError(err);
    callback(user);
  });
};

// Get a user with a specific email address
// Here, two arguments are passed to callback: err, user in that order.
userSchema.statics.getUserByEmail = function(email, callback) {
  User.findOne({email: email}, callback);
};

// Get all transactions (populated with item, buyOffer, sellOffer and their postedBy) of a user
userSchema.statics.getUserTransactions = function(user_id, callback) {
  User.findOne({_id: user_id})
  .lean()
  .populate({ path: 'transactions' })
  .exec(function(err, user) {
    utils.handleError(err);
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

// Add a new review for user with specified user_id
// Updates the user's reputation, which is the average of all the user's review scores
userSchema.statics.addReview = function(user_id, review, callback) {
  User.findOne({_id: user_id}, function(err, user) {
    utils.handleError(err);
    user.reviews.push(review);
    var totalscore = 0
    for (var i=0; i<user.reviews.length; i++) {
      totalscore += parseInt(user.reviews[i].score);
    }
    user.reputation = totalscore/user.reviews.length;
    user.save();
    callback(user);
  });
};

// Get all offers for user with specified user_id
userSchema.statics.getOffers = function(user_id, callback) {
  User.findOne({_id: user_id})
  .populate('offers')
  .exec(function(err, user) {
    utils.handleError(err);
    callback(user.offers);
  });
};

// Transaction schema
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

// Create a new transaction and add the transaction to user's transactions
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

// Get a transaction with a specific transaction ID
transactionSchema.statics.getTransactionById = function(user_id, transaction_id, callback) {
  Transaction.findOne({_id:transaction_id})
    .populate('buyOffer sellOffer item')
    .exec(function(err, transaction) {
      utils.handleError(err);
      if (transaction.buyOffer.postedBy.toString() === user_id || transaction.sellOffer.postedBy.toString() === user_id) {
        callback(transaction);
      }
      else {
        callback("You are not authorized to view this transaction");
      }
    });
};

// Add a review to a transaction
// This will also add the review to the other user involved in the transaction, and thus affect their reputation
transactionSchema.statics.addTransactionReview = function(userid, transactionid, review, callback) {
  Transaction.findOne({_id:transactionid})
  .populate('buyOffer')
  .populate('sellOffer')
  .exec(function(err, transaction) {
    utils.handleError(err);
    if (transaction.buyOffer.postedBy.toString() === userid && !transaction.buyerRated) {
      transaction.buyerRated = true;
      transaction.save();
      User.findOne({_id: transaction.sellOffer.postedBy}, function(err, user) {
        User.addReview(user._id, review, function() {
          callback(transaction);
        });
      });
    } else if (transaction.sellOffer.postedBy.toString() === userid && !transaction.sellerRated) {
      transaction.sellerRated = true;
      transaction.save();
      User.findOne({_id: transaction.buyOffer.postedBy}, function(err, user) {
        User.addReview(user._id, review, function() {
          callback(transaction);
        });
      });
    } else {
      callback("You're not authorized to review this transaction, or you already reviewed it.");
    }
  });
};

// create model
var Transaction = mongoose.model('Transaction', transactionSchema);
var User = mongoose.model('User', userSchema);

// export
module.exports = {
  User: User,
  Transaction: Transaction
};
