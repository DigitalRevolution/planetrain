var express = require('express');
var router = express.Router();
var api = require('../server/api');
var controller = require('../controller/controller');
var api_controller = require('../controller/api_controller');


/* GET home page. */
router.get('/', controller.homePage);
router.post('/results', controller.interiorPage);
router.get('/api/tripdata', api_controller.listTrips);

module.exports = router;
