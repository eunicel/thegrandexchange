var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  reputation: Number
});

// /users/ POST
// Create a new user
userSchema.statics.createUser = function(firstName, lastName, email, password, callback) {
  user = new User({
    firstName : firstName,
    lastName : lastName,
    email : email,
    password : password,
    reputation = 0
  });
  user.save(function(err, user){
    callback(user);
  });
}

// /users/user_id GET
// Get user by id
userSchema.statics.getUserById = function(userid, callback) {
  User.findOne({_id:userid}, function(err, user) {
    if (err) {
      throw err;
    } else {
      callback(user);
    }
  });
}

// /users/user_id/transactions GET
// Get all transactions of a user
userSchema.statics.getUserTransactions = function(userid, callback) {
  Transaction.find({}).populate('buy').populate('sell').exec(function(err, alltransactions) {
    if (err) {
      throw err;
    } else {
      var usertransactions = [];
      for (t in alltransactions) {
        if (t.buy.postedBy === userid || t.sell.postedBy === userid) {
          usertransactions.push(t);
        }
      }
      callback(usertransactions);
    }
  });
}

var User = mongoose.model('User', userSchema);
module.exports = User;
