var express = require('express');
var router = express.Router();
var User = require('../../models/user').User;
var Transaction = require('../../models/user').Transaction;
var utils = require('../../utils');

var api_user = require('../../config/secrets').api_user;
var api_key = require('../../config/secrets').api_key;
var sendgrid  = require('sendgrid')(api_user, api_key);

// Helper function to send email with activation code
var sendActivationCode = function(email, user_id) {
  console.log('sending activation code');
  var activationCodeEmail = {
    to      : email,
    from    : "thegrandexchange@mit.edu",
    subject : "Your Account Activation Code",
    text    : "Your Activation Code is:  " + user_id
  }
  sendgrid.send(activationCodeEmail, function(err, json) {
    if (err) { console.error(err); }
  });
}

/* POST /users
 * create new user
 * firstName, lastName, email, and password cannot be empty
 */
router.post('/', function(req, res) {
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;
  var password = req.body.password;
  // first part of email only contain letters and numbers, and must be at least 1 character long
  // email must end with @mit.edu, @csail.mit.edu, or @media.mit.edu
  var mitEmailRegex = /^[a-zA-Z0-9]*[a-zA-Z]+[a-zA-Z0-9]*@mit.edu$/;
  var csailRegex = /^[a-zA-Z0-9]*[a-zA-Z]+[a-zA-Z0-9]*@csail.mit.edu$/;
  var mediaRegex = /^[a-zA-Z0-9]*[a-zA-Z]+[a-zA-Z0-9]*@media.mit.edu$/;

  if(!firstName || !lastName || !email || !password) {
    res.json({message: 'All fields are required.', success: false});
  } else {
    if (!mitEmailRegex.test(email) && !csailRegex.test(email) && !mediaRegex.test(email)) {
      res.json({message: 'Valid MIT email address required.', success: false});
    }
    else {
      User.userExists(email, function(exists) {
        if (exists) {
          res.json({message: 'User with that email exists.', success: false});
        } else {
          User.createUser(firstName, lastName, email, password, function(user) {
            //send email with activation code (user id)
            sendActivationCode(email, user._id);
            return res.json({success: true});
          });
        }
      });
    }
  }
});

// Send an email with activation code to user with user_email
router.post('/:user_email/send', function(req, res) {
  var email = req.param('user_email');
  User.userExists(email, function(exists) {
    if (exists) {
      User.getUserByEmail(email, function(err, user) {
        sendActivationCode(email, user._id);
      });
      return res.json({success: true});
    } else {
      res.json({message: 'User with that email does not exist.', success: false});
    }
  });
});

// GET /users/:user_id
// Get user with user_id
router.get('/:user_id', utils.loggedIn, function(req, res) {
  var user_id = req.param('user_id');
  User.getUserById(user_id, function(user) {
    if (user) {
      res.json({user: user, success: true});
    } else {
      res.json({message: 'User does not exist.', success: false});
    }
  });
});

// PUT /users/:user_id/verification
// Verify user account with user_id
router.put('/:user_id/verification', function(req, res) {
  var user_id = req.param('user_id');
  User.activate(user_id, function(user, msg) {
    if (user) {
      res.json({user: user, message:null, success: true});
    } else {
      res.json({message: msg, success: false});
    }
  });
});

// GET /users/:user_id/transactions
// Get all transactions of user with user_id
router.get('/:user_id/transactions', utils.loggedIn, function(req, res) {
  var user_id = req.param('user_id');
  User.getUserTransactions(user_id, function(transactions) {
    if (transactions) {
      res.json({transactions: transactions, success: true});
    } else {
      res.json({success: false});
    }
  });
});

// GET /users/:user_id/transactions/:transaction_id
// Get transaction with transaction_id, only if user is involved in transaction.
router.get('/:user_id/transactions/:transaction_id', utils.loggedIn, function(req, res) {
  var user_id = req.param('user_id');
  var transaction_id = req.param('transaction_id');
  Transaction.getTransactionById(user_id, transaction_id, function(transaction) {
    res.json({transaction: transaction, success: true});
  });
});

// POST /users/:user_id/transactions/:transaction_id
// Rate and review transaction with transaction_id with user user_id, only if
// user is user_id
router.post('/:user_id/transactions/:transaction_id', utils.loggedIn, function(req, res) {
  var user_id = req.param('user_id');

  if (user_id !== req.user._id.toString()) {
    res.json({message: "Unauthorized", success: false});
  } else {
    var transaction_id = req.param('transaction_id');
    var review = {
      text: req.body.text,
      score: req.body.score
    };
    Transaction.addTransactionReview(user_id, transaction_id, review, function(transaction) {
      res.json({transaction: transaction, success: true});
    });
  }
});

// GET /users/:user_id/offers
// Get all offers for a user
router.get('/:user_id/offers', utils.loggedIn, function(req, res) {
  var user_id = req.param('user_id');
  User.getOffers(user_id, function(offers) {
    if (offers) {
      res.json({offers: offers, success: true});
    } else {
      res.json({success: false});
    }
  });
});

module.exports = router;
