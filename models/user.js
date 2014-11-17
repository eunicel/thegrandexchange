var mongoose = require('mongoose');
var utils = require('../utils');

var userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  reputation: Number,
  reviews: []
});

// /users/ POST
// Create a new user
userSchema.statics.createUser = function(firstName, lastName, email, password, callback) {
  user = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    reputation: 0,
    reviews: []
  });
  user.save(function(err, user){
    utils.handleError(err);
    callback(user);
  });
}

// /users/user_id GET
// Get user by id
userSchema.statics.getUserById = function(user_id, callback) {
  User.findOne({_id: user_id}, function(err, user) {
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
  Transaction.find({})
    .populate('buyer')
    .populate('seller')
    .exec(function(err, all_transactions) {
      utils.handleError(err);
      var user_transactions = [];
      for (t in all_transactions) {
        if (t.buyer.postedBy._id === user_id || t.seller.postedBy._id === user_id) {
          user_transactions.push(t);
        }
      }
      callback(user_transactions);
  });
}

// POST /users/user_id/reviews
// add new review for user with specified user_id
userSchema.statics.addReview = function(user_id, review, callback) {
  User.find({id: user_id}, function(err, user) {
    utils.handleError(err);
    user.reviews.push(review);
  });
}

// GET /users/user_id/reviews
// get all reviews for user with specified user_id
userSchema.statics.getReviews = function(user_id, callback) {
  User.find({id: user_id}, function(err, user) {
    utils.handleError(err);
    callback(user.reviews);
  });
}

var User = mongoose.model('User', userSchema);
module.exports = User;
