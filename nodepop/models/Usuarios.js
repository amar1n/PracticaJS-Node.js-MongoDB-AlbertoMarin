'use strict';

var debug = require('debug')('nodepop:Usuarios');

var mongoose = require('mongoose');

var usuarioSchema = mongoose.Schema({
    nombre: {type: String, required: true},
    email: {type: String, required: true, index: {unique: true}},
    clave: {type: String, required: true}
});

usuarioSchema.statics.deleteAll = function (callback) {
    debug('usuarioSchema.statics.deleteAll');
    Usuario.remove({}, function (err) {
        if (err) {
            return callback(err);
        } else {
            return callback(null);
        }
    });
};

usuarioSchema.statics.list = function (filter, start, limit, sort, callback) {
    debug('usuarioSchema.statics.list', 'filter', filter, 'start', start, 'limit', limit, 'sort', sort);
    var query = Usuario.find(filter);
    query.skip(start);
    query.limit(limit);
    query.sort(sort);
    return query.exec(callback);
};

usuarioSchema.statics.findOneByEmail = function (email, callback) {
    debug('usuarioSchema.statics.findOneByEmail', 'email', email);
    var query = Usuario.findOne({email: email});
    return query.exec(callback);
};

var Usuario = mongoose.model('Usuario', usuarioSchema);