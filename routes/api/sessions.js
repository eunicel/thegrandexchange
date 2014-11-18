var express = require('express');
var User = require('../../models/user');

var Router = function(passport) {
  var router = express.Router();

  router.post('/', passport.authenticate('local'), function(request, response) {
    response.json({success: true});
  });

  return router;
}

module.exports = Router;
