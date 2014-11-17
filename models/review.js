var mongoose = require('mongoose');
var utils = require('../utils');

var reviewSchema = mongoose.Schema({
  text: String,
  score: Number
});

// Create a new Review
reviewSchema.statics.createReview = function(text, score, callback) {
  review = new Review({
    text: text,
    score: score,
  });
  review.save(function(err, review){
    utils.handleError(err);
    callback(review);
  });
}

module.exports = Review;