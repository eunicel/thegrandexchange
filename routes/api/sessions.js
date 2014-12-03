var express = require('express');
var User = require('../../models/user');

var Router = function(passport) {
  var router = express.Router();

  // POST /sessions
  // Attempt to login
  router.post('/', passport.authenticate('local'), function(request, response) {
    if (!request.user.activated) {
      // Logout, since we are incorrectly authenticated by Passport
      request.logout();
      response.json({
        success: false
      });
    } else {
      // Successful login
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
