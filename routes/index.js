var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/test', function(request, response) {
  response.sendFile(path.join(__dirname, '../public/test/testing.html'));
});

/* GET home page. */
router.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
