var express = require('express');
var router = express.Router();
var api = require('../server/api');

/* GET home page. */
router.get('/', api.buildFullTimeTable);

module.exports = router;
