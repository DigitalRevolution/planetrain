# planetrain
Project #2 - GTFS Offline First Transit App

## Overview

In 2016, Denver Regional Transportation District (RTD) opened a new railway to facilitate transportation between Union Station and Denver International Airport (DIA). RTD Plane Train is an offline first navigation app which utilizes GTFS data to showcase proficiencies in the following technologies:

-Indexed DB
-Service Workers
-Cache Storage
-Promise API
-Mongo DB
-Express


## Installation

This project is built on Nodejs, Expressjs, and MongoDB. Information about installing these dependencies is available here: 

Node: https://nodejs.org/en/

Express: http://expressjs.com/

MongoDB: https://www.mongodb.com/

To install this app locally, navigate to your chosen directory and run the following: 

`git clone https://github.com/DigitalRevolution/planetrain.git`

`cd planetrain/ && npm install;`

The a mongodump database backup is included in this repository at  planetrain/server/gtfsmin

For more information about using mongodump to backup and migrate mongodb databases, see: https://docs.mongodb.com/manual/reference/program/mongodump/

`mongorestore [insert the path to your application here]/planetrain/server/gtfsmin --db gtfsmin`

For more information about mongorestore, see: https://docs.mongodb.com/manual/reference/program/mongorestore/

## API Reference

This project includes two public API endpoints. These endpoints each return JSON objects which include stopnames and a multidimensional arrays of stoptimes for individual trips. 

EastBound API endpoint: https://planetrain.herokuapp.com/api/tripdata?direction_id=0

WestBound API endpoint: https://planetrain.herokuapp.com/api/tripdata?direction_id=1
