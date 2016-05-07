'use strict';

var debug = require('debug')('nodepop:connectMongoose');
var mongoose = require('mongoose');
var conn = mongoose.connection;

// Handlers de eventos de conexion
conn.on('error', console.log.bind(console, 'connection error!'));
conn.once('open', function () {
    debug('Connected to nodepop-mongodb!');
});

// Conectar a la base de datos
mongoose.connect('mongodb://localhost:27017/nodepop');