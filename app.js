// Logic vars
var Truco = require('Truco');
var Jugador = require('Jugador');
var jugadoresEsperando = [];
var jugadoresJugando = [];
var partidas = [];
// Initial vars
var express = require('express');
var app = express();
// Connection vars
var serv = require('http').Server(app);
var root = '/client';
var io;
var SOCKET_LIST = [];

configurarApp();
abrirServidor(2000);

io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    var unJugador = new Jugador.crear(socket.id);
    jugadoresEsperando.push(unJugador);

    console.log("Jugador " + jugadoresEsperando.length + " conectado");

    if (jugadoresEsperando.length > 1) {

        var cantJugadores = 2;
        var jugadoresPartida = jugadoresEsperando.splice(0, cantJugadores);
        
        empezarPartida(jugadoresPartida);
    }

    socket.on("disconnect",function() {
        // Si el jugador que se desconecto estaba en medio de una partida ->
        // Le aviso a todos los jugadores de esa partida que el jugador abandono
        if (jugadoresJugando[socket.id]) {
            var partida = jugadoresJugando[socket.id].partida;
            var jugadoresPartida = partida.getJugadores();
            var data = {
                mensaje: "Otro jugador ha abandonado la partida"
            }
            for (var i = 0; i < jugadoresPartida.length; i++) {
                var id = jugadoresPartida[i].id;
                SOCKET_LIST[id].emit('mensajeCentro',data);
            }
        }
        delete SOCKET_LIST[socket.id];
    });
});

function empezarPartida(jugadoresPartida) {
    var id, cartas;

    partidaTruco = new Truco.crear(jugadoresPartida);

    // Le asigno a todos los jugadores, la partida en la que estaran
    for (var i = 0; i < jugadoresPartida.length; i++) {
        var unJugador = jugadoresPartida[i];
        unJugador.partida = partidaTruco;
        jugadoresJugando[unJugador.id] = unJugador;
    }
    
    partidaTruco.nuevaPartida();

    // Renderizo las cartas
    for (var i = 0; i < jugadoresPartida.length; i++) {
        cartas = jugadoresPartida[i].cartas;
        id = jugadoresPartida[i].id;
        SOCKET_LIST[id].emit('recibirMisCartas',cartas);
    }
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