'use strict';

var debug = require('debug')('nodepop:pushTokens');

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var PushToken = mongoose.model('PushToken');

var config = require('../../../local_config');
var translator = require('myi18n');

/**
 * @api {post} /pushtokens
 * @apiDescription Añadir un pushToken
 * @apiParam {String} plataforma Uno de los siguientes valores 'ios', 'android'
 * @apiParam {String} token Token para push notifications
 * @apiParam {String} usuario Usuario asociado
 * @apiExample Ejemplo de uso:
 * endpoint: http://localhost:3000/api/v1/pushtokens
 *
 * body:
 * {
 *   "plataforma": "ios"
 *   "token": "fwfoasidjSDOFjS:EOIFjSDFNsef8935r"
 *   "usuario": "alberto@gmail.com"
 * }
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "data": {
 *      "__v": 0,
 *      "plataforma": "ios",
 *      "usuario": "pepe",
 *      "token": "lago",
 *      "_id": "572e298001722d2038c4be0a"
 *    }
 *  }
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 *  {
 *    "success": false,
 *    "error": "Petición errónea"
 *  }
 */
router.post('/', function (req, res) {
    var pushToken = new PushToken(req.body);

    // Validaciones del modelo
    var errors = pushToken.validateSync();
    if (errors) {
        debug(config.errors.error400, 'POST/', errors);
        return res.status(400).json({success: false, error: translator(req, config.errors.error400)});
    }

    pushToken.save(function (err, obj) {
        if (err) {
            debug(config.errors.error500, 'POST/', err);
            return res.status(500).json({success: false, error: translator(req, config.errors.error500)});
        }
        return res.status(200).json({success: true, data: obj});
    });
});

/**
 * @api {put} /pushtokens
 * @apiDescription Actualizar un pushToken
 * @apiParam {String} plataforma Uno de los siguientes valores 'ios', 'android'
 * @apiParam {String} token Token para push notifications
 * @apiParam {String} usuario Usuario asociado
 * @apiExample Ejemplo de uso:
 * endpoint: http://localhost:3000/api/v1/pushtokens
 *
 * body:
 * {
 *   "plataforma": "ios"
 *   "token": "fwfoasidjSDOFjS:EOIFjSDFNsef8935r"
 *   "usuario": "alberto@gmail.com"
 * }
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "data": {
 *      "__v": 0,
 *      "plataforma": "ios",
 *      "usuario": "pepe",
 *      "token": "lago",
 *      "_id": "572e298001722d2038c4be0a"
 *    }
 *  }
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 *  {
 *    "success": false,
 *    "error": "Petición errónea"
 *  }
 */
router.put('/', function (req, res) {
    var pt = new PushToken(req.body);

    // Validaciones del modelo
    var errors = pt.validateSync();
    if (errors) {
        debug(config.errors.error400, 'PUT/', errors);
        return res.status(400).json({success: false, error: translator(req, config.errors.error400)});
    }

    PushToken.findOneAndUpdate(
        {'plataforma': pt.plataforma, 'usuario': pt.usuario},
        {$set: {'token': pt.token}},
        function (err, pushToken) {
            if (err) {
                debug(config.errors.error500, 'PUT/', err);
                return res.status(500).json({success: false, error: translator(req, config.errors.error500)});
            }
            if (!pushToken) {
                debug(config.errors.error404, 'PUT/', 'PushToken doesnt exist');
                return res.status(404).json({success: false, error: translator(req, config.errors.error404)});
            }
            return res.status(200).json({success: true, data: pushToken});
        }
    );
});

// --------------------------------------
// --------------------------------------
module.exports = router;