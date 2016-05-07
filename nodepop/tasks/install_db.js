'use strict';

var conn = new Mongo("localhost");
var db = conn.getDB("nodepop");

db.dropDatabase();

db.createCollection("usuarios");
var user = {
    'nombre': 'Alberto',
    'email': 'alberto@gmail.com',
    'clave': '$2a$10$ojVD7NDSj9oXTePp9zAHKOiXiayADXaan/t.UD79/Xss3eM0b74Dq'
};
db.usuarios.save(user);
user = {
    'nombre': 'Susana',
    'email': 'susana@gmail.com',
    'clave': '$2a$10$ojVD7NDSj9oXTePp9zAHKOiXiayADXaan/t.UD79/Xss3eM0b74Dq'
};
db.usuarios.save(user);
db.usuarios.createIndex({email: 1}, {unique: true});

db.createCollection("anuncios");
var anuncio = {
    'nombre': 'Fusion Brunotti Twintip Board 2016',
    'venta': true,
    'precio': 979.95,
    'foto': 'images/anuncios/brunotti_fusion.jpg',
    'tags': ['lifestyle']
};
db.anuncios.save(anuncio);

anuncio = {
    'nombre': 'Youri Pro Brunotti Twintip Board 2016',
    'venta': true,
    'precio': 779.95,
    'foto': 'images/anuncios/brunotti_youri_pro.jpg',
    'tags': ['lifestyle']
};
db.anuncios.save(anuncio);

anuncio = {
    'nombre': 'Brutus Brunotti KiteWave Board 2016',
    'venta': true,
    'precio': 649.00,
    'foto': 'images/anuncios/brunotti_butus.jpg',
    'tags': ['lifestyle']
};
db.anuncios.save(anuncio);

anuncio = {
    'nombre': 'Boosted Dual+',
    'venta': true,
    'precio': 1499.00,
    'foto': 'images/anuncios/boosted-dualplus-1_large.jpg',
    'tags': ['lifestyle', 'mobile']
};
db.anuncios.save(anuncio);
