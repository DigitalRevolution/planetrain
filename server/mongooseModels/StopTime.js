var mongoose = require('mongoose');

var StopTime = mongoose.model('StopTime', new mongoose.Schema({
  agency_key: {
    type: String,
    index: true
  },
  trip_id: {
    type: String,
    index: true
  },
  arrival_time: {
    type: String
  },
  departure_time: {
    type: String,
    index: true
  },
  stop_id: String,
  stop_sequence: {
    type: Number,
    index: true
  },
  stop_headsign: String,
  pickup_type: {
    type: Number,
    index: true,
    min: 0,
    max: 3
  },
  drop_off_type: {
    type: Number,
    index: true,
    min: 0,
    max: 3
  },
  shape_dist_traveled: Number,
  timepoint: {
    type: Number,
    min: 0,
    max: 1
  }
}));
