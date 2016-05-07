'use strict';

var debug = require('debug')('nodepop:myi18n');

var translate = function (req, message) {
    var lang = req.query.lang;
    if (typeof lang !== 'undefined') {
        var aux = req.i18n.setLocale(lang);
        if (lang !== aux) {
            req.i18n.setLocale('es');
        }
    } else {
        req.i18n.setLocale('es');
    }
    var tranlation = req.i18n.__(message);
    debug('lang', lang, 'x', req.i18n.getLocale(), 'message', message, 'translation', tranlation);
    return tranlation;
};

module.exports = translate;