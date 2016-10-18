'use strict';

var mongoose = require('mongoose');
var async = require('async');

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

var output = {
    east: {
        stops: [],
        tripIds: [],
        times: []
    },
    west: {
        stops: [],
        tripIds: [],
        times: []
    }
};

module.exports = {
    //** Build the homepage timetable **//

    buildFullTimeTable: function(req, res){

        function buildArrivalArray(direction, trip_id){
            return new Promise(function(resolve, reject){
                StopTime
                    .find({trip_id:trip_id})
                    .exec(function(err, data){ // each trip has 8 stoptimes
                        var arr = []; // create a temporary array to hold the stoptimes.arrival_time
                        for(var i=0; i<data.length; i++){ // loop through stoptime objects
                            arr.push(data[i].arrival_time) // and add arrival time to the array
                        }
                        if(direction == 'east') { // add east to east
                            output.east.times.push(arr);
                        } else {
                            output.west.times.push(arr); // otherwise it must be west.
                        }
                    });
                resolve(output);
            })
        }

        Trip
            .find({route_id: 'A', service_id:'MT'})
            .exec(function(err, data){
                data.forEach(function(trip){ // for each of the 144 trips
                    if(trip.direction_id === 0){
                        buildArrivalArray('east', trip.trip_id);
                    } else {
                        buildArrivalArray('west', trip.trip_id);
                    }
                });
                output.east.times.sort();
                output.west.times.sort();
                res.send(output);

            });
    }


};

