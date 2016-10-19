'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash'),
    api = require('../server/api');

module.exports.listTrips = function(req, res){

    var route_id = req.query.route_id || 'A';
    var service_id = req.query.service_id || 'MT';
    var direction_id = req.query.direction_id || 0;

    var stopTimes;
    var stopNames = [];
    // Create array of titles for timetable
    var retreiveNames = new Promise(function(resolve, reject){
        api.getStopsByRoute('denverRTD', route_id, direction_id, function(err, names){
            if(err){
                console.log(err);
                reject(err);
            } else {
                names.forEach(function(name){
                    stopNames.push(name.stop_name);
                });
                resolve(stopNames);
            }
        });
    });

    var buildTimeTable = new Promise(function(resolve, reject){
        api.buildCompleteTimeTable(route_id, service_id, direction_id, function(err, timeTable) {
            if(err){
                console.log(err);
                reject(err);
            } else {
                stopTimes = timeTable;
                resolve(stopTimes);
            }
        });
    });

    Promise.all([retreiveNames, buildTimeTable])
        .then(function(someData){
            console.log('sending results');
            res.send(someData);
        })
        .catch(function(err){
            console.log('Something went wrong... Here\'s what we know: ' + err);
        });
};