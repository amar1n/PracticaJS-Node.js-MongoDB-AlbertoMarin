'use strict';

var debug = require('debug')('nodepop:usuarios');

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Usuario = mongoose.model('Usuario');

var jwt = require('jsonwebtoken');
var config = require('../../../local_config');

var bcrypt = require('bcrypt-nodejs');

var translator = require('../../../lib/myi18n.js');

/**
 * @api {get} /usuarios
 * @apiDescription Obtener el listado de usuarios
 * @apiParam {String} [lang] Idioma para mensaje de error. Puede ser uno de los siguientes valores... 'es', 'en'
 * @apiExample Ejemplo de uso:
 * http://localhost:3000/api/v1/usuarios
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "data": [
 *      {
 *        "_id": "572be6089eddc28b5708405b",
 *        "nombre": "Alberto",
 *        "email": "alberto@gmail.com"
 *      },
 *      {
 *        "_id": "572be6089eddc28b5708405c",
 *        "nombre": "Susana",
 *        "email": "susana@gmail.com"
 *      }
 *    ]
 *  }
 * @apiErrorExample
 * HTTP/1.1 404 Bad Request
 *  {
 *    "success": false,
 *    "error": "Recurso no encontrado"
 *  }
 */
router.get('/', function (req, res) {
    Usuario.find().select({_id: 1, nombre: 1, email: 1}).exec(function (err, rows) {
        if (err) {
            debug(config.errors.error500, 'GET/', err);
            return res.status(500).json({success: false, error: translator(req, config.errors.error500)});
        }

        return res.status(200).json({success: true, data: rows});
    });
});

/**
 * @api {post} /usuarios
 * @apiDescription Añadir un usuario
 * @apiParam {String} nombre Nombre del usuario
 * @apiParam {String} email Email del usuario
 * @apiParam {String} clave Clave de acceso del usuario
 * @apiParam {String} [lang] Idioma para mensaje de error. Puede ser uno de los siguientes valores... 'es', 'en'
 * @apiExample Ejemplo de uso:
 * endpoint: http://localhost:3000/api/v1/usuarios
 *
 * body:
 * {
 *   "nombre": "Susana"
 *   "email": "susana@gmail.com"
 *   "clave": "1234"
 * }
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "data": {
 *      "__v": 0,
 *      "nombre": "Susana",
 *      "email": "susanagmail.com",
 *      "_id": "572e2b5aff1a74713815e6e2"
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
    var usuario = new Usuario(req.body);

    // Validaciones del modelo
    var errors = usuario.validateSync();
    if (errors) {
        debug(config.errors.error400, 'POST/', errors);
        return res.status(400).json({success: false, error: translator(req, config.errors.error400)});
    }

    usuario.clave = bcrypt.hashSync(usuario.clave);
    usuario.save(function (err, obj) {
        if (err) {
            debug(config.errors.error500, 'POST/', err);
            return res.status(500).json({success: false, error: translator(req, config.errors.error500)});
        }
        obj = obj.toObject();
        delete (obj.clave);
        return res.status(200).json({success: true, data: obj});
    });
});

/**
 * @api {delete} /usuarios
 * @apiDescription Borrar un usuario
 * @apiParam {Integer} id Código del usuario
 * @apiParam {String} [lang] Idioma para mensaje de error. Puede ser uno de los siguientes valores... 'es', 'en'
 * @apiExample Ejemplo de uso:
 * http://localhost:3000/api/v1/usuarios?id=572e2b5aff1a74713815e6e2
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *  {
 *    "success": true
 *  }
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 *  {
 *    "success": false,
 *    "error": "Petición errónea"
 *  }
 */
router.delete('/', function (req, res) {
    var id = req.query.id;

    Usuario.remove({_id: id}).exec(function (err) {
        if (err) {
            debug(config.errors.error500, 'DELETE/', err);
            return res.status(500).json({success: false, error: translator(req, config.errors.error500)});
        }
        return res.status(200).json({success: true});
    });
});

/**
 * @api {post} /usuarios/authenticate
 * @apiDescription Autenticar a un usuario
 * @apiParam {String} email Email del usuario
 * @apiParam {String} clave Clave de acceso del usuario
 * @apiParam {String} [lang] Idioma para mensaje de error. Puede ser uno de los siguientes valores... 'es', 'en'
 * @apiExample Ejemplo de uso:
 * endpoint: http://localhost:3000/api/v1/usuarios/authenticate
 *
 * body:
 * {
 *   "email": "susana@gmail.com"
 *   "clave": "1234"
 * }
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MmJlNjA4OWVkZGMyOGI1NzA4NDA1YiIsImlhdCI6MTQ2MjU2MTM0MSwiZXhwIjoxNDYyNTY0OTQxfQ.Ph9lW4KFFJSL_MlXMR-eQBwgtxWsChE3w_GuR54sRBo"
 *  }
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 *  {
 *    "success": false,
 *    "error": "Petición errónea"
 *  }
 */
router.post('/authenticate', function (req, res) {
    var email = req.body.email;
    var clave = req.body.clave;

    if (typeof email === 'undefined' || typeof clave === 'undefined') {
        debug(config.errors.error400, 'POST/authenticate', 'Credentials required');
        return res.status(400).json({success: false, error: translator(req, config.errors.error400)});
    }

    Usuario.findOneByEmail(email, function (err, user) {
        if (err) {
            debug(config.errors.error500, 'POST/authenticate', err);
            return res.status(500).json({success: false, error: translator(req, config.errors.error500)});
        }
        if (!user) {
            debug(config.errors.error404, 'POST/authenticate', 'User not found');
            return res.status(404).json({success: false, error: translator(req, config.errors.error404)});
        }
        var hash = bcrypt.hashSync(clave);
        if (bcrypt.compareSync(user.clave, hash)) {
            debug(config.errors.error401, 'POST/authenticate', 'Invalid password');
            return res.status(401).json({success: false, error: translator(req, config.errors.error401)});
        }
        var token = jwt.sign({id: user._id}, config.jwt.secret, {expiresIn: config.jwt.expires});

        return res.status(200).json({success: true, data: token});
    });

});

// --------------------------------------
// --------------------------------------
module.exports = router;