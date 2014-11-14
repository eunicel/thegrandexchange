var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Transaction = require('../models/transaction');
var utils = require('../utils');

// POST /users - create new user
router.post('/', function(req, res) {
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var email = req.body.email;
  var password = req.body.password;
  User.createUser(firstName, lastName, email, password, function(user) {
    res.json({user: user});
  });
});

// GET /users/:user_id - get user with user_id
router.get('/:user_id', function(req, res) {
  var user_id = req.param('user_id');
  User.getUserById(user_id, function(user) {
    res.json({user: user});
  });
});

// GET /users/:user_id/transactions - get all transactions of user with user_id
router.get('/:user_id/transactions', function(req, res) {
  var user_id = req.param('user_id');
  User.getUserTransactions(user_id, function(transactions) {
    res.json({transactions: transactions});
  });
});

// GET /users/:user_id/transactions/:transaction_id - get transaction with transaction_id
router.get('/:user_id/transactions/:transaction_id', function(req, res) {
  var user_id = req.param('user_id');
  var transaction_id = req.param('transaction_id');
  Transaction.getTransactionById(user_id, transaction_id, function(transaction) {
    res.json({transaction: transaction});
  });
});

// POST /users/:user_id/transactions/:transaction_id - add review to transaction with transaction_id
router.post('/:user_id/transactions/:transaction_id', function(req, res) {
  var user_id = req.param('user_id');
  var transaction_id = req.param('transaction_id');
  var review = req.body.review;
  Transaction.addTransactionReview(user_id, transaction_id, review, function(transaction) {
    res.json({transaction: transaction});
  });
});

// POST /users/:user_id/transactions/:transaction_id - rate transaction (not implemented for MVP)



module.exports = router;
