'use strict';

var mongoose = require('mongoose');
var NODE_ENV;
var db;

if(NODE_ENV === 'production'){
    db = mongoose.connect(MONGO_URI);
    console.log('connected to production database')
} else {
    db = mongoose.connect('mongodb://localhost/gtfsmin');
    console.log('connected to local database')
}


//require('./mongooseModels/Agency');
//require('./mongooseModels/Route');
//require('./mongooseModels/Stop');
//require('./mongooseModels/StopTime');
//require('./mongooseModels/Trip');
//
//var Agency = db.model('Agency');
//var Route = db.model('Route');
//var Stop = db.model('Stop');
//var StopTime = db.model('StopTime');
//var Trip = db.model('Trip');

//mongodb://gtfsapplication:EVL#2d=E!r;h7RFXd:H-R`@ds017070.mlab.com:17070/gtfs

