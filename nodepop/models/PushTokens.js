'use strict';

var debug = require('debug')('nodepop:PushTokens');

var mongoose = require('mongoose');

var pushTokenSchema = mongoose.Schema({
    plataforma: {type: String, enum: ['ios', 'android'], required: true},
    token: {type: String, required: true},
    usuario: {type: String, required: true}
});
pushTokenSchema.index({plataforma: 1, usuario: 1}, {unique: true});

pushTokenSchema.statics.deleteAll = function (callback) {
    debug('pushTokenSchema.statics.deleteAll');
    PushToken.remove({}, function (err) {
        if (err) {
            return callback(err);
        } else {
            return callback(null);
        }
    });
};

pushTokenSchema.statics.list = function (filter, start, limit, sort, callback) {
    debug('pushTokenSchema.statics.list', 'filter', filter, 'start', start, 'limit', limit, 'sort', sort);
    var query = PushToken.find(filter);
    query.skip(start);
    query.limit(limit);
    query.sort(sort);
    return query.exec(callback);
};

var PushToken = mongoose.model('PushToken', pushTokenSchema);