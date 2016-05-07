'use strict';

var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// AMG: Internacionalización
var i18n = require('i18n-2');
i18n.expressBind(app, {
    locales: ['es', 'en']
});

// AMG: Conexion a la BBDD
require('connectMongoose.js');

// AMG: Modelos
require('./models/Usuarios');
require('./models/Anuncios');
require('./models/PushTokens');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));

// AMG: Rutas del API
app.use('/api/v1/usuarios', require('./routes/api/v1/usuarios'));
app.use('/api/v1/anuncios', require('./routes/api/v1/anuncios'));
app.use('/api/v1/pushtokens', require('./routes/api/v1/pushTokens'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;