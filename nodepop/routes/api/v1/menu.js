'use strict';

var debug = require('debug')('nodepop:menu');

var express = require('express');
var router = express.Router();

/**
 * @api {get} /menu
 * @apiDescription Obtener el listado de platos
 * @apiParam {String} [lang] Idioma para mensaje de error. Puede ser uno de los siguientes valores... 'es', 'en'
 * @apiExample Ejemplo de uso:
 * http://nodepop.zampateste.com/api/v1/menu
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
    return res.status(200).json({success: true, data: "AMG!!!"});
});

// --------------------------------------
// --------------------------------------
module.exports = router;