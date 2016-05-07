'use strict';

var debug = require('debug')('nodepop:Anuncios');

var mongoose = require('mongoose');

var anuncioSchema = mongoose.Schema({
    nombre: {type: String, required: true},
    venta: {type: Boolean, required: true},
    precio: {type: Number, required: true},
    foto: String,
    tags: [String]
});

anuncioSchema.statics.deleteAll = function (callback) {
    debug('anuncioSchema.statics.deleteAll');
    Anuncio.remove({}, function (err) {
        if (err) {
            return callback(err);
        } else {
            return callback(null);
        }
    });
};

anuncioSchema.statics.list = function (filter, start, limit, sort, callback) {
    debug('anuncioSchema.statics.list', 'filter', filter, 'start', start, 'limit', limit, 'sort', sort);
    var query = Anuncio.find(filter);
    query.skip(start);
    query.limit(limit);
    query.sort(sort);
    return query.exec(callback);
};

anuncioSchema.statics.tags = function (callback) {
    debug('anuncioSchema.statics.tags');
    return callback(null, ['work', 'lifestyle', 'motor', 'mobile']);
};

var Anuncio = mongoose.model('Anuncio', anuncioSchema);