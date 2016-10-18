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
    test: function(req, res){},
    //** Build the homepage timetable **//

    buildFullTimeTable: function(req, res){

        function buildArrivalArray(direction, trip_id){
            return new Promise(function(resolve, reject){
                StopTime
                    .find({trip_id:trip_id})
                    .exec(function(err, data){
                        if(direction == 'east') {
                            output.east.times.push(data);
                        } else {
                            output.west.times.push(data);
                        }
                    });
                resolve(output);
            })
        }

        Trip
            .find({route_id: 'A', service_id:'MT'})
            .exec(function(err, data){
                data.forEach(function(trip){
                    if(trip.direction_id === 0){
                        buildArrivalArray('east', trip.trip_id);
                    } else {
                        buildArrivalArray('west', trip.trip_id);
                        //output.west.tripIds.push(trip.trip_id);
                    }
                });
                res.send(output);

                //StopTime
                //    .find({trip_id: {$in:output.east.tripIds}})
                //    .exec(function(err, stopTimes){
                //        stopTimes.forEach(function(time){
                //            output.east.times.push(time);
                //        });
                //
                //        res.send(output.east.times);
                //    });
                //res.send(output.east.time);
            });
    }


};

