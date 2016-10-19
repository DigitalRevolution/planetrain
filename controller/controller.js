'use strict';

var api = require('../server/api');

function selectDay(day){
    if(day == 'SA'){
        day = 'Saturday';
    } else if (day == 'SU'){
        day = 'Sunday';
    } else {
        day = 'Weekdays';
    }
    return day;
}

module.exports = {

    homePage: function (req, res) {

        var agency_key = 'denverRTD';
        var route_id = 'A';
        var direction_id = 0;

        var timeTables = {
            eastTimes:[],
            westTimes:[],
            eastNames:[],
            westNames:[]
        };

        var eastTime = new Promise(function(resolve, reject) {
            api.buildCompleteTimeTable('A', 'MT', 0, function (err, data) {
                if(err) reject(err);
                timeTables.eastTimes = data;
                resolve();
            });
        });

        var westTime = new Promise(function(resolve, reject) {
            api.buildCompleteTimeTable('A', 'MT', 1, function (err, data) {
                if(err) reject(err);
                timeTables.westTimes = data;
                resolve();
            });
        });

        var eastName = new Promise(function(resolve, reject){
            api.getStopsByRoute('denverRTD', 'A', 0, function(err, data){
                if(err) reject(err);
                timeTables.eastNames = data;
                resolve();
            });
        });

        var westName = new Promise(function(resolve, reject){
            api.getStopsByRoute('denverRTD', 'A', 1, function(err, data){
                if(err) reject(err);
                timeTables.westNames = data;
                resolve();
            })
        });

        Promise.all([eastTime, westTime, eastName, westName])
            .then(function(){
                res.render('home', {
                    stopsW: timeTables.westNames,
                    stopsE: timeTables.eastNames,
                    stopTimes: timeTables.eastTimes,
                    stopNames: timeTables.eastNames,
                    title: 'Plane Train, Baby!'
                });
                //res.send(timeTables);
            }).catch(function(err){
                console.log('OH SHIT!: ', err);
            })
    },

    interiorPage: function(req, res){

        console.log('interior page build initiated, controller.js 69');
        // retrieve the inputs from the form on the home page
        var from = req.body.departure_stop || 34476;
        var to = req.body.arrival_stop || 34475;
        var day = req.body.travel_date;
        var direction = req.body.direction_id;

        console.log('to and from have been set, controller.js 76')
        console.log('The direction_id is set to: ', direction);

        // retrieve the stop name
        var startName;
        var endName;
        api.retrieveStopName(from, function(err, stop){
            startName = stop[0].stop_name;
        });
        api.retrieveStopName(to, function(err, stop){
            endName = stop[0].stop_name;
        });

        // pull the data from the DB, and render the view
        api.buildTimeTable(from, to, day, direction, function (err, trips) {
            if (err) {
                console.log(err);
            } else {
                day = selectDay(day);
                console.log('home_controller is bulding view');
                res.render('search', {
                    title: 'Time Table',
                    trips: trips.timesArray,
                    pointA: startName,
                    pointB: endName,
                    day: day
                });
            }
        });

    }
};