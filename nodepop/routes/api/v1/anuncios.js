'use strict';

var debug = require('debug')('nodepop:anuncios');

var config = require('../../../local_config');

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Anuncio = mongoose.model('Anuncio');

var jwtAuth = require('jwtAuth.js');
router.use(jwtAuth());

var translator = require('myi18n');

/**
 * @api {get} /anuncios
 * @apiDescription Obtener el listado de anuncios
 * @apiParam {String} [tag] Clasificación del artículo anunciado. Puede ser uno o varios (separados por coma) de los siguientes valores... 'work', 'lifestyle', 'motor', 'mobile'
 * @apiParam {String} [venta] Tipo de anuncio. Puede ser 'true' (para venta) o 'false' (para compra)
 * @apiParam {String} [nombre] Nombre de artículo, que empiece por el dato buscado en el parámetro nombre.
 * @apiParam {String} [precio] Rango de precio (precio min. y precio max.)
 * @apiParam {Integer} [start] A partir de qué artículo realizar la consulta
 * @apiParam {Integer} [limit] Límite de anuncios a devolver
 * @apiParam {String} [sort] Criterio de ordenación. Puede ser uno o varios (separados por coma) de los siguientes valores... 'nombre', 'venta', 'precio', 'tags'
 * @apiParam {String} [lang] Idioma para mensaje de error. Puede ser uno de los siguientes valores... 'es', 'en'
 * @apiHeader {String} x-access-token Token JWT de autenticación obtenido previamente
 * @apiExample Ejemplo de uso:
 * http://localhost:3000/api/v1/anuncios?tag=lifestyle&venta=true&nombre=youri&precio=0-5000­&start=0&limit=2&sort=precio
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "572be6089eddc28b5708405f",
 *       "nombre": "Brutus Brunotti KiteWave Board 2016",
 *       "venta": true,
 *       "precio": 649,
 *       "foto": "http://localhost:3000/images/anuncios/brunotti_butus.jpg",
 *       "tags": [
 *         "lifestyle"
 *       ]
 *     }
 *     ]
 * }
 * @apiErrorExample
 * HTTP/1.1 404 Bad Request
 *  {
 *    "success": false,
 *    "error": "Recurso no encontrado"
 *  }
 */
router.get('/', function (req, res) {
    var validReqQuery = ['tag', 'venta', 'nombre', 'precio', 'start', 'limit', 'sort', 'lang'];
    var tag = req.query.tag;
    var venta = req.query.venta;
    var nombre = req.query.nombre;
    var start = parseInt(req.query.start) || 0;
    var limit = parseInt(req.query.limit) || null;
    var sort = req.query.sort || null;
    var precio = req.query.precio;

    // Validamos que no se reciben parámetros...
    if (Object.keys(req.params).length) {
        debug(config.errors.error400, 'GET/', 'Wrong API call (params)', req.params);
        return res.status(400).json({success: false, error: translator(req, config.errors.error400)});
    }

    // Validamos que sólo se reciben los query acordados...
    var queryKeys = Object.keys(req.query);
    for (var j = 0; j < queryKeys.length; j++) {
        if (validReqQuery.indexOf(queryKeys[j]) === -1) {
            debug(config.errors.error400, 'GET/', 'Wrong API call (query)', req.query);
            return res.status(400).json({success: false, error: translator(req, config.errors.error400)});
        }
    }

    var filter = {};

    // Procesamos los tags para meterlos en el filtro...
    if (typeof tag !== 'undefined') {
        var arrayOfTags = [];
        var arrayOfTagsAux = tag.split(',');
        for (var i = 0; i < arrayOfTagsAux.length; ++i) {
            var aTag = arrayOfTagsAux[i].trim();
            if (arrayOfTags.indexOf(aTag) === -1) {
                arrayOfTags.push(aTag);
            }
        }
        if (arrayOfTags.length >= 1) {
            filter.tags = {$in: arrayOfTags};
        }
    }

    // Procesamos el tipo para meterlo en el filtro...
    if (typeof venta !== 'undefined') {
        if (venta === 'true' || venta === 'false') {
            filter.venta = venta;
        }
    }

    // Procesamos el nombre para meterlo en el filtro...
    if (typeof nombre !== 'undefined') {
        filter.nombre = new RegExp('^' + nombre, 'i');
    }

    // Procesamos el precio para meterlo en el filtro...
    if (typeof precio !== 'undefined') {
        var patronRango = '^[0-9]+-[0-9]+$'; // por ejemplo... 10-50
        var arrayRango = precio.match(patronRango);

        var patronQueTenganPrecioMayorQue = '^[0-9]+-$'; // por ejemplo... 10-
        var arrayQueTenganPrecioMayorQue = precio.match(patronQueTenganPrecioMayorQue);

        var patronQueTenganPrecioMenorQue = '^-[0-9]+$'; // por ejemplo... -50
        var arrayQueTenganPrecioMenorQue = precio.match(patronQueTenganPrecioMenorQue);

        var patronQueTenganPrecioIgualQue = '^[0-9]+$'; // por ejemplo... 50
        var arrayQueTenganPrecioIgualQue = precio.match(patronQueTenganPrecioIgualQue);

        var arrayMatch;
        if (arrayRango) {
            arrayMatch = arrayRango[0].split('-');
            filter.precio = {'$gte': parseInt(arrayMatch[0]), '$lte': parseInt(arrayMatch[1])};
        } else if (arrayQueTenganPrecioMayorQue) {
            arrayMatch = arrayQueTenganPrecioMayorQue[0].split('-');
            filter.precio = {'$gte': parseInt(arrayMatch[0])};
        } else if (arrayQueTenganPrecioMenorQue) {
            arrayMatch = arrayQueTenganPrecioMenorQue[0].split('-');
            filter.precio = {'$lte': parseInt(arrayMatch[1])};
        } else if (arrayQueTenganPrecioIgualQue) {
            filter.precio = parseInt(arrayQueTenganPrecioIgualQue[0]);
        }
    }

    if (!Object.keys(filter).length) {
        filter = null;
    }

    // Procesamos el sort para meterlo en la llamada...
    var theSort = {};
    if (sort) {
        var patronOfOneSort = '^-?(nombre|venta|precio|tags)$'; // por ejemplo... -precio
        var arrayOfSorts = [];
        var arrayOfSortsAux = sort.split(',');
        for (var ii = 0; ii < arrayOfSortsAux.length; ++ii) {
            var aSortAux = arrayOfSortsAux[ii].trim();
            var aSort = aSortAux.match(patronOfOneSort);
            if (aSort) {
                if (arrayOfSorts.indexOf(aSort[0]) === -1) {
                    arrayOfSorts.push(aSort[0]);
                }
            } else {
                debug(config.errors.error422, 'GET/', 'Wrong API call (query)', req.query);
                return res.status(422).json({success: false, error: translator(req, config.errors.error422)});
            }
        }
        for (var iii = 0; iii < arrayOfSorts.length; ++iii) {
            if (arrayOfSorts[iii].startsWith('-')) {
                theSort[arrayOfSorts[iii].replace('-', '')] = -1;
            } else {
                theSort[arrayOfSorts[iii]] = 1;
            }
        }
    }

    // Realizamos la búsqueda...
    Anuncio.list(filter, start, limit, theSort, function (err, rows) {
        if (err) {
            debug(config.errors.error500, 'GET/', err);
            return res.status(500).json({success: false, error: translator(req, config.errors.error500)});
        }
        debug('data', rows);
        for (var iv = 0; iv < rows.length; iv++) {
            rows[iv].foto = config.public_url + '/' + rows[iv].foto;
        }
        return res.status(200).json({success: true, data: rows});
    });
});

/**
 * @api {get} /anuncios/tags
 * @apiDescription Obtener el listado de tags
 * @apiParam {String} [lang] Idioma para mensaje de error. Puede ser uno de los siguientes valores... 'es', 'en'
 * @apiExample Ejemplo de uso:
 * http://localhost:3000/api/v1/anuncios/tags
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 *  {
 *    "success": true,
 *    "data": [
 *      "work",
 *      "lifestyle",
 *      "motor",
 *      "mobile"
 *    ]
 *  }
 * @apiErrorExample
 * HTTP/1.1 404 Bad Request
 *  {
 *    "success": false,
 *    "error": "Recurso no encontrado"
 *  }
 */
router.get('/tags', function (req, res) {
    Anuncio.tags(function (err, rows) {
        if (err) {
            debug(config.errors.error500, 'GET/tags', err);
            return res.status(500).json({success: false, error: translator(req, config.errors.error500)});
        }
        debug('data', rows);
        return res.status(200).json({success: true, data: rows});
    });
});

// --------------------------------------
// --------------------------------------
module.exports = router;