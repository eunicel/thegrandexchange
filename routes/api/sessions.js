var express = require('express');
var User = require('../../models/user');

var Router = function(passport) {
  var router = express.Router();

  router.post('/', passport.authenticate('local'), function(request, response) {
    if (!request.user.activated) {
      request.logout();
      response.json({
        success: false
      });
    } else {
      response.json({
        success: true,
        userID: request.user._id,
        firstName: request.user.firstName,
        lastName: request.user.lastName
      });      
    }
  });

  return router;
};

module.exports = Router;
