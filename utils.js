var loggedIn = function(request, response, next) {
  if (request.user) {
    next();
  }
  else {
    response.status(401).send('Not Authorized');
  }
}

var handleError = function(err) {
	if (err) {
  	throw err;
	}
}

module.exports = {
  loggedIn: loggedIn,
  handleError: handleError
}