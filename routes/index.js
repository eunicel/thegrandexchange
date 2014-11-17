var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
