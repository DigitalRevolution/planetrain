var express = require('express');
var router = express.Router();
var api = require('../server/api');
var controller = require('../controller/controller');

/* GET home page. */
router.get('/', controller.homePage);

module.exports = router;
