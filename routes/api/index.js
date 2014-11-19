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

router.use('/sessions', sessions);

router.use(utils.loggedIn);

router.use('/users', users);
router.use('/items', items);

module.exports = router;