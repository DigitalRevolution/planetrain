var express = require('express');
var router = express.Router();
var api = require('../server/api');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Plane Train Application' });
});

module.exports = router;
