var socket = io.connect();

socket.on('connect', function () {
	console.log('Connecting...');
});

socket.on('onconnected', function(data){
	if (data.avail) {
		console.log('You have joined the game, with id:' +
					data.id);
	} else {
		console.log('Lobby is full. You are an observer with id:' +
					data.id);
	}
});
