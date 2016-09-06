var express = require('express');
var UUID = require('node-uuid');
var app = express();

//Static resources server
app.use(express.static(__dirname));

var server = app.listen(8082, function () {
	var port = server.address().port;
	console.log('\t Server running at port %s', port);
});

var io = require('socket.io')(server);
 
function GameServer(){
	this.players = [];
	this.ball = null;
	this.lobby = false;
}

GameServer.prototype = {

	checkAvail: function(){
		if (this.players.length == 0) {
			this.lobby = false;
			return true;
		} else if (this.players.length == 1) {
			this.lobby = true;
			return true;
		} else {
			return false;
		}
	}
}


var game = new GameServer();

/* Connection events */

io.on('connection', function(client) {
	client.userid = UUID();

    console.log('\t User connected, id: ' + client.userid);

    client.emit('onconnected', {id:client.userid,
    							avail:game.checkAvail(),
    							lobby:game.lobby)}

	client.on('disconnect', function () {
        console.log('\t User disconnected, id: ' + client.userid);
    });
});