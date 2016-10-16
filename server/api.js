'use strict';

var mongoose = require('mongoose');
var db;

// securely connect to the correct database
if(process.env.NODE_ENV === 'production'){
    db = mongoose.connect(process.env.MONGO_URI, function(err){if(err){throw err}});
    console.log('connected to production database');
} else {
    db = mongoose.connect('mongodb://localhost/gtfsmin', function(err){if(err){throw err}});
    console.log('connected to staging database');
}

require('./mongooseModels/Agency');
require('./mongooseModels/Route');
require('./mongooseModels/Stop');
require('./mongooseModels/StopTime');
require('./mongooseModels/Trip');

var Agency = db.model('Agency');
var Route = db.model('Route');
var Stop = db.model('Stop');
var StopTime = db.model('StopTime');
var Trip = db.model('Trip');

module.exports = {

    test: function(req, res){
        Agency
            .find({},function(err, data){
                res.send(data);
            })
    }


};

