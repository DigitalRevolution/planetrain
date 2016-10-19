'use strict';

var mongoose = require('mongoose');
var async = require('async');
var _ = require('lodash');

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

    // Find the Stop Name //
    retrieveStopName: function(stop_id, cb){
        Stop
            .find({stop_id: stop_id}, cb)
    },

    // Build the homepage timetable //
    buildCompleteTimeTable: function(route_id, service_id, direction_id, cb) {

        var timeTable = {
            listOfTripIds: [],
            stopTimes: []
        };

        async.series([
            getTripsOnRoute,
            getStopTimesForTrips
        ], function (e) {
            if (e) {
                cb(e, null);
            } else {
                //console.log('sending timeTable to controller');
                cb(null, timeTable.stopTimes);
            }
        });

        function retrieveTimesByTrip(trip_id, cb){
            StopTime
                .find({trip_id: trip_id}, cb)
        }

        function getTripsOnRoute(cb) {
            //this function returns an array of trip IDs
            Trip
                .find({route_id: route_id, service_id: service_id, direction_id: direction_id})
                .select('trip_id')
                .exec(function (err, trips) {
                    trips.forEach(function (trip) {
                        timeTable.listOfTripIds.push(trip.trip_id);
                    });
                    //console.log('Getting Trip_id for all trips on Route...');
                    cb(null, timeTable);
                });
        }

        //this function builds a multidimensional array of every stop time for each tripID
        function getStopTimesForTrips(cb) {
            //console.log('Building multidimensional StopTimes Array...');
            var promises = timeTable.listOfTripIds.map(function (id) {
                return new Promise(function (resolve, reject) {
                    retrieveTimesByTrip(id, function (err, st) {
                        if (err) reject(err);
                        var tempArray = [];
                        st.map(function (sts) {
                            tempArray.push(sts.arrival_time);
                        });
                        timeTable.stopTimes.push(tempArray);
                        resolve(timeTable);
                    })
                });
            });

            Promise.all(promises)
                .then(function () {
                    //console.log('Finished building multidimensional StopTimes Array');
                })
                .then(function () {
                    timeTable.stopTimes.sort();
                    cb(null, timeTable);
                });
        }
    },

    // Retrieve Stops on A Route -- Shout out to Brendan Nee (https://github.com/brendannee/node-gtfs) //
    getStopsByRoute: function(agency_key, route_id, direction_id, cb) {
        if (_.isFunction(direction_id)) {
            cb = direction_id;
            direction_id = null;
        }

        var longestTrip = {};
        var stops = {};
        var trip_ids = {};
        var direction_ids = [];

        async.series([
            getTrips,
            getStopTimes,
            getStops
        ], function(e) {
            // transform results based on whether direction_id was
            // - specified (return stops for a direction)
            // - or not specified (return stops for all directions)
            var results = [];
            if (direction_id !== null && direction_id !== undefined) {
                results = stops[direction_id] || [];
            } else {
                _.each(stops, function(stops, direction_id) {
                    results.push({
                        direction_id: direction_id,
                        stops: stops || []
                    });
                });
            }
            cb(e, results);
        });

        function getTrips(cb) {
            var query = {
                agency_key: agency_key,
                route_id: route_id
            };
            if (direction_id !== null && direction_id !== undefined) {
                query.direction_id = direction_id;
            } // else match all direction_ids

            Trip.find(query).exec(function(err, trips){
                if (!trips || trips.length == 0) {
                    return cb(new Error('Invalid agency_key or route_id'), 'trips');
                }

                trips.forEach(function(trip){
                    if (direction_ids.indexOf(trip.direction_id) < 0) {
                        direction_ids.push(trip.direction_id);
                    }
                    if (!trip_ids[trip.direction_id]) {
                        trip_ids[trip.direction_id] = [];
                    }
                    trip_ids[trip.direction_id].push(trip.trip_id);
                });
                cb();
            });
        }

        function getStopTimes(cb) {
            async.forEach(
                direction_ids,
                function(direction_id, cb) {
                    if (!trip_ids[direction_id]) {
                        return cb();
                    }

                    async.forEach(
                        trip_ids[direction_id],
                        function(trip_id, cb) {
                            StopTime.find({
                                    agency_key: agency_key,
                                    trip_id: trip_id
                                },
                                null, {
                                    sort: 'stop_sequence'
                                },
                                function(e, stopTimes) {
                                    //compare to longest trip for given direction_id to see if trip length is longest for given direction
                                    if (!longestTrip[direction_id]) longestTrip[direction_id] = [];
                                    if (stopTimes.length && stopTimes.length > longestTrip[direction_id].length) {
                                        longestTrip[direction_id] = stopTimes;
                                    }
                                    cb();
                                });
                        }.bind(direction_id),
                        function() {
                            cb();
                        }
                    );
                },
                function() {
                    cb(null, 'times');
                }
            );
        }

        function getStops(cb) {
            async.forEach(
                direction_ids,
                function(direction_id, cb) {
                    if (!longestTrip[direction_id]) return cb();
                    async.forEachSeries(
                        longestTrip[direction_id],
                        function(stopTime, cb) {
                            Stop.findOne({
                                    agency_key: agency_key,
                                    stop_id: stopTime.stop_id
                                },
                                function(e, stop) {
                                    if (!stops[direction_id]) stops[direction_id] = [];
                                    stops[direction_id].push(stop);
                                    cb();
                                });
                        }.bind(direction_id),
                        function(e) {
                            cb(e);
                        }
                    );
                },
                function(e) {
                    if (e) {
                        cb(new Error('No stops found'), 'stops');
                    } else {
                        cb(null, 'stops');
                    }
                });
        }
    },

    // Build Custom TimeTable Based on User Inputs
    buildTimeTable: function(from, to, day, direction, cb) {
        console.log('buildTimeTable has been called, api 234');
        // fix the 2 track issues
        if (from === '34668' || from === '34667') {
            from = {$gt: '34666', $lt: '34669'};
        }
        if (to === '34668' || to === '34667') {
            to = {$gt: '34666', $lt: '34669'};
        }

        var tripList = [];
        var times = {
            fromList: [],
            toList: [],
            timesArray: []
        };

        // Solve these problems in the correct order :O
        async.series([
            getTripsByRoute,
            getFromStoptimesByTrip,
            getToStoptimesByTrip,
            buildArray
        ], function (e) {
            if (e) {
                cb(e, null);
            } else {
                console.log('DB API sending trips to controller');
                cb(null, times);
            }
        });

        // First we build an array of trip_ids on Route 'A'
        function getTripsByRoute(cb) {
            Trip
                .find({route_id: 'A', direction_id: direction, service_id: day})
                .select('trip_id')
                .exec(function (err, trips) {
                    trips.forEach(function (trip) {
                        tripList.push(trip.trip_id);
                    });
                    cb(null, tripList);
                });
        }

        // Second we need to return all of the stoptimes for every trip that goes through the selected stop on the route
        function getFromStoptimesByTrip(cb) {
            StopTime
                .find({stop_id: from})
                .where('trip_id').in(tripList)
                .exec(function (err, fromTimes) {
                    fromTimes.sort();
                    times.fromList = fromTimes;
                    cb(null, times.fromList);
                });
        }

        function getToStoptimesByTrip(cb) {
            StopTime
                .find({stop_id: to})
                .where('trip_id').in(tripList)
                .exec(function (err, toTimes) {
                    toTimes.sort();
                    times.toList = toTimes;
                    cb(null, times.toList);
                });
        }

        function buildArray(cb) {
            console.log('DB API has started building timesArray');
            for (var i = 0; i < times.toList.length; i++) {
                times.timesArray[i] = { fromTime: times.fromList[i].departure_time,
                    toTime: times.toList[i].arrival_time
                };
            }
            times.timesArray.reverse();
            console.log('timesArray built successfully');
            cb(null, times.timesArray);
        }
    }
};

