'use strict';

var mongoose = require('mongoose');
var db;

if(process.NODE_ENV === 'production'){
    db = mongoose.connect(process.MONGO_URI);
    console.log('connected to production database');
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



