var express = require('express');
var router = express.Router();
var passport = require('passport');

var users = require('./users');
var items = require('./items');
var sessions = require('./sessions')(passport);

var LocalStrategy = require('passport-local').Strategy;

var User = require('../../models/user');
require('../../config/passport')(passport, User, LocalStrategy);

router.use(passport.initialize());
router.use(passport.session());

router.use('/users', users);
router.use('/items', items);
router.use('/sessions', sessions);

module.exports = router;