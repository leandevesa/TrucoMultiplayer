// Logic vars
var Truco = require('Truco');
var nrJugadores = 0;
var partidaTruco;
// Initial vars
var express = require('express');
var app = express();
// Connection vars
var serv = require('http').Server(app);
var root = '/client';
var io;
var SOCKET_LIST = [];
var JUGADORES = [];

configurarApp();
abrirServidor(2000);

io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    nrJugadores++;
    JUGADORES[nrJugadores] = socket;

    console.log("Jugador " + nrJugadores + " conectado");

    if (nrJugadores == 2) {
        empezarPartida();
    } else {
        var data = {
            mensaje: 'Esperando al otro jugador...'
        }
        socket.emit('mensajeCentro',data);
    }

    socket.on("disconnect",function() {
        nrJugadores--;

    console.log("Jugador " + nrJugadores + " conectado");
        delete SOCKET_LIST[socket.id];
    });
});

function empezarPartida() {
    partidaTruco = new Truco.crear();
    partidaTruco.empezar();

    var cartas = partidaTruco.getCartasJugador1();

    console.log(' ');
    console.log('Cartas jugador 1:')
    for (var i = 0; i < cartas.length; i++) {
        console.log(cartas[i].numero + ' ' + cartas[i].palo);
    }
    enviarMisCartas(1, cartas);
    cartas = partidaTruco.getCartasJugador2();
    console.log(' ');
    console.log('Cartas jugador 2:')
    for (var i = 0; i < cartas.length; i++) {
        console.log(cartas[i].numero + ' ' + cartas[i].palo);
    }
    enviarMisCartas(2, cartas);
}

function enviarMisCartas(numeroJugador, cartas) {
    var socket = JUGADORES[numeroJugador];
    socket.emit('recibirMisCartas',cartas);
}

function configurarApp() {
    app.get('/', function(req, res) {
        res.sendFile(__dirname + root + '/index.html');
    });
    app.use(root,express.static(__dirname + root));
    app.use('/js',express.static(__dirname +  root + '/js'));
    app.use('/img',express.static(__dirname +  root + '/img'));
}

function abrirServidor(puerto) {
    serv.listen(puerto);
    console.log("Server started on: " + puerto);
    io = require('socket.io')(serv,{});
}