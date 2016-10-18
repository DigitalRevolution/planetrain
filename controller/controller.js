'use strict';

var api = require('../server/api');

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
                res.send(timeTables);
            }).catch(function(err){
                console.log('OH SHIT!: ', err);
            })
    },

    interiorPage: function(req, res){
        api.buildTimeTable(from, to, day, direction, function(magic){
            // return magic.
        })
    }
};