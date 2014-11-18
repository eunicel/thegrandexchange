var mongoose = require('mongoose');
var utils = require('../utils');
var Transaction = require('../models/transaction');

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
}

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
}

// /users/user_id GET
// Get user by id
userSchema.statics.getUserById = function(user_id, callback) {
  User.findOne({_id: user_id})
  .populate('offers transactions')
  .exec(function(err, user) {
    utils.handleError(err);
    callback(user);
  });
}

// Here, two arguments are passed to callback: err, user in that order.
userSchema.statics.getUserByEmail = function(email, callback) {
  User.findOne({email: email}, callback);
}

// /users/user_id/transactions GET
// Get all transactions of a user
userSchema.statics.getUserTransactions = function(user_id, callback) {
  User.findOne({_id: user_id})
  .populate('transactions')
  .exec(function(err, user) {
    Transaction.populate(user.transactions, 'buyOffer sellOffer item', function(err, transactions){
      utils.handleError(err);
      callback(transactions);
    });
  });
}

// POST /users/user_id/reviews
// add new review for user with specified user_id
userSchema.statics.addReview = function(user_id, review, callback) {
  User.findOne({_id: user_id}, function(err, user) {
    utils.handleError(err);
    user.reviews.push(review);
    user.reputation.$inc(review.score);
    user.save();
    callback(user);
  });
}

// GET /users/user_id/offers
// get all offers for user with specified user_id
userSchema.statics.getOffers = function(user_id, callback) {
  User.findOne({_id: user_id})
  .populate('offers')
  .exec(function(err, user) {
    console.log(user);
    utils.handleError(err);
    callback(user.offers);
  });
}

// GET /users/user_id/reviews
// get all reviews for user with specified user_id
userSchema.statics.getReviews = function(user_id, callback) {
  User.findOne({_id: user_id}, function(err, user) {
    utils.handleError(err);
    callback(user.reviews);
  });
}

var User = mongoose.model('User', userSchema);
// var Review = mongoose.model('Review', reviewSchema);

// module.exports = {
//   User: User,
//   Review: Review
// };

module.exports = User
// module.exports = Review;
