'use strict';
// SERVICE WORKER STUFF //

// handle service worker registration
function registerServiceWorker(path) {
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.register(path).then(function () {
        console.log('Service Worker has been successfully registered!');
    }).catch(function () {
        console.log('Service Worker Registration failed!');
    });
}
// register service worker
registerServiceWorker('/sw.js');

// INDEX DB STUFF //
var east = {
    stopNames: [],
    stopTimes: []
};
var west = {
    stopNames: [],
    stopTimes: []
};
var db;
var currentVersion = 1;


function fetchData(cb) {
    var eastPromise = new Promise(function(resolve, reject){
        fetch('http://planetrain.herokuapp.com/api/tripdata?direction_id=0')
            .then(function (data) {
                return data.json();
            })
            .catch(function (err) {
                readAll('eastTimes');
                reject(err);
            })
            .then(function (json) {
                json[0].forEach(function (stopName) {
                    east.stopNames.push(stopName);
                });
                json[1].forEach(function (stopTime) {
                    east.stopTimes.push(stopTime);
                });
            })
            .then(function () {
                resolve(east);
            })
            .catch(function (err) {
                reject(err);
            });
    });

    var westPromise = new Promise(function(resolve, reject){
        fetch('http://planetrain.herokuapp.com/api/tripdata?direction_id=1')
            .then(function (data) {
                return data.json();
            })
            .catch(function (err) {
                console.log(err);
            })
            .then(function (json) {
                json[0].forEach(function (stopName) {
                    west.stopNames.push(stopName);
                });
                json[1].forEach(function (stopTime) {
                    west.stopTimes.push(stopTime);
                });
            })
            .then(function () {
                resolve(west);
            })
            .catch(function (err) {
                readAll('westTimes');
                reject(err);
            });
    });

    Promise.all([eastPromise,westPromise])
        .then(cb);

}

function buildIndexDb(){
    var request = window.indexedDB.open('gtfs', currentVersion);

    // open a database and start the transaction
    request.onerror = function(event){
        console.log('error: ');
    };

    request.onsuccess = function(event){
        db = request.result;
        console.log('success: ' + db);
    };

    request.onupgradeneeded = function(event){
        east.stopTimes.sort();
        west.stopTimes.sort();
        var db = event.target.result;
        db.createObjectStore('eastNames', {autoIncrement:true}).add(east.stopNames);
        db.createObjectStore('westNames', {autoIncrement:true}).add(west.stopNames);
        var ebt = db.createObjectStore('eastTimes', {autoIncrement: true});
        east.stopTimes.forEach(function(times){
            ebt.add(times);
        });
        var wbt = db.createObjectStore('westTimes', {autoIncrement: true});
        west.stopTimes.forEach(function(times){
            wbt.add(times);
        });
    }
}

if(!window.indexedDB){
    console.log(new Error, 'IndexedDB does not work on this browser, failing over to cache');
} else if(!navigator.onLine){
    console.log('Browser offline -- not refreshing indexDB ');
} else {
    fetchData(buildIndexDb);
}

function readOne(store) {
    return new Promise(function(resolve, reject){
        var transaction = db.transaction([store]);
        var objectStore = transaction.objectStore(store);
        var request = objectStore.get(1);
        request.onerror = function(e) {
            console.log("Unable to retrieve data from database!");
        };
        request.onsuccess = function(event) {
            if(request.result) {
                resolve(request.result);
            } else {
                console.log('header promise failed');
                reject();
            }
        };
    });
}


function readAll(store) {
    return new Promise(function (resolve, reject) {
        if (!request) {
            var request = window.indexedDB.open('gtfs', currentVersion);
            // open a database and start the transaction
            request.onerror = function (event) {
                console.log('error: ');
            };
            request.onsuccess = function (event) {
                db = request.result;
                console.log('configured local db: ' + db);
            };
        }

        var objectStore = db.transaction(store).objectStore(store);
        var output = [];
        objectStore.openCursor()
            .onsuccess = function(e) {
            var cursor = e.target.result;
            if (cursor) {
                output.push(cursor.value);
                cursor.continue();
            }
        };
        arrayTester();
        function arrayTester(){
            if(output.length > 71) {
                resolve(output);
            } else {
                setTimeout(function(){
                    arrayTester();
                },25);
            }
        }
    });
}

// VIEW STUFF //

function retreiveTimes(input){
    readAll(input).then(function(data){
        var output = '';
        data.forEach(function(set){
            output += '<tr>';
            set.forEach(function(stopTime){
                output += '<td>';
                output += stopTime;
                output += '</td>';
            });
            output += '</tr>'
        });
        $('.main-time-table > tbody').append(output);
    });
}

function buildTheHeader(input){
    readOne(input).then(function(names){
        var output = '';
        names.forEach(function(name){
            output += '<th>';
            output += name;
            output += '</th>';
        });
        $('.main-time-table > tbody').html(output);
    })
}

function eastBound(){
    buildTheHeader('eastNames');
    retreiveTimes('eastTimes');
    $('.westbound-form').css('display','none');
    $('.eastbound-form').css('display', 'block');
}
function westBound(){
    buildTheHeader('westNames');
    retreiveTimes('westTimes');
    $('.westbound-form').css('display','block');
    $('.eastbound-form').css('display', 'none');
}