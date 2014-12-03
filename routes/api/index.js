var express = require('express');
var router = express.Router();
var passport = require('passport');

var users = require('./users');
var items = require('./items');
var sessions = require('./sessions')(passport);
var utils = require('../../utils');

var LocalStrategy = require('passport-local').Strategy;

var User = require('../../models/user').User;
require('../../config/passport')(passport, User, LocalStrategy);

router.use(passport.initialize());
router.use(passport.session());

// Passport authentication (login)
router.use('/sessions', sessions);

// User-related actions
router.use('/users', users);
// Item-related actions
router.use('/items', items);

module.exports = router;