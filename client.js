var canvas = document.getElementById('canvasHB');
var ctx = canvas.getContext('2d');

// Controls are up, down, left, right.
var p1_ctrls = new Array(87,83,65,68);
var p2_ctrls = new Array(38,40,37,39);
var observer;
var p_name = '';

var keyDown = function(e,p) {
	if(e.keyCode == p.ctrls[0]) {
        p.upPress = true;
    }
    else if(e.keyCode == p.ctrls[1]) {
        if (p.kick_timeout) {
        	p.downPress = true;
        	p.kick_timeout = false;
        	setTimeout(function(){
        		p.kick_timeout=true;
        	}, 100);
       	}
    } 
    else if(e.keyCode == p.ctrls[2]) {
        p.leftPress = true;
    }
    else if(e.keyCode == p.ctrls[3]) {
        p.rightPress = true;
    }
}

var keyUp = function(e,p) {
	if(e.keyCode == p.ctrls[0]) {
        p.upPress = false;
    }
    else if(e.keyCode == p.ctrls[1]) {
        p.downPress = false;
    } 
    else if(e.keyCode == p.ctrls[2]) {
        p.leftPress = false;
    }
    else if(e.keyCode == p.ctrls[3]) {
        p.rightPress = false;
    }
}


var p_no;
var p1 = {
	pos: {x:0,y:0},
	headSize : 40,
	goalPost: {pos:{x:0,y:0},
				w:40*4,
				h:40*9},
	upPress: false,
	downPress: false,
	leftPress: false,
	rightPress: false,
	ctrls: [],
	colour: 'red',
	kick_timeout : true
};
var p2 = {
	pos: {x:0,y:0},
	headSize : 40,
	goalPost: {pos:{x:0,y:0},
				w:40*4,
				h:40*9},
	upPress: false,
	downPress: false,
	leftPress: false,
	rightPress: false,
	ctrls: [],
	colour: 'blue',
	kick_timeout: true
};
var players=[p1,p2];
var ball = {
	pos: {x:0,y:0},
	size: 20
};


var text;
var score_p1;
var score_p2;
var scored;


var drawPlayer = function (item) {
	ctx.beginPath();
	ctx.font = "45px Arial";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText(item.p_name,
				item.pos.x,
				item.pos.y - item.headSize*1.2);

	ctx.arc(item.pos.x, 
			item.pos.y, 
			item.headSize, 
			0, Math.PI*2);
	ctx.rect(item.pos.x-item.headSize*0.5, 
			item.pos.y+item.headSize*0.6, 
			item.headSize, 
			item.headSize*1.8)
	ctx.rect(item.pos.x-item.headSize*0.2, 
			item.pos.y+item.headSize*2.4, 
			item.headSize*0.4, 
			item.headSize)
	ctx.arc(item.pos.x, 
			item.pos.y+item.headSize*3.4, 
			item.headSize*0.3, 
			0, Math.PI*2);
	if (item.kick) {
		var that = item;
		if (item.p_no == 0) {
			var dir = 0;
		} else if (item.p_no == 1){
			var dir = item.headSize*1.4;
		}
		ctx.rect(item.pos.x-dir, 
			item.pos.y+item.headSize*3.1, 
			item.headSize*1.4, 
			item.headSize*0.6)
	}

	ctx.fillStyle = item.colour;
	ctx.fill();
	ctx.closePath();

	drawGoalPost(item.goalPost);
}

var drawGoalPost = function (item) {
	ctx.beginPath();
	ctx.rect(item.pos.x,
			item.pos.y,
			item.w,
			item.h);
	ctx.strokeStyle = '#000000';
	ctx.lineWidth = 8;

	ctx.stroke();
	ctx.closePath();
}


var drawBall = function (item) {
	ctx.beginPath();
	ctx.arc(item.pos.x, 
			item.pos.y, 
			item.size, 
			0, Math.PI*2);
	ctx.fillStyle = '#000000';
	ctx.fill();
	ctx.closePath();
}


var drawScore = function () {
	ctx.font = "60px Comic Sans MS";
	ctx.fillStyle = "grey";
	ctx.textAlign = "center";
	ctx.fillText(text, canvas.width/2, canvas.height/4);
	ctx.fillText(score_p1.toString()+'-'+score_p2.toString(),
				canvas.width/2, canvas.height/3);
}


var update = function(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	drawBall(ball);
	for (var i=0; i<players.length; i++) {
		drawPlayer(players[i]);
	}
}


//setInterval(update,1000/60);
function repeat() {
	//console.log(p1.pos.x)
  	update()
  	if (scored) {
		drawScore();
		
	}
  	requestAnimationFrame(repeat);
}
repeat()


var socket = io.connect();

socket.on('connect', function () {
	console.log('Connecting...');
});

socket.on('onconnected', function(data){
	if (data.avail) {
		console.log('You have joined the game, with id:' +
					data.id);
		syncClient(data.game);
		p_no = data.p_no;
		players[p_no].p_no = p_no;
	} else {
		console.log('Lobby is full. You are an observer with id:' +
					data.id);
	}
	
	

	if (data.p_no == 0) {
		observer = false;
		console.log('You are now Player 1.');
		p_name = prompt('You are now Player 1 (Red). ' +
			'Move using the WASD keys, where A is left, '+
			'D is right, W is jump, and D is kick. ' +
			'Enter your desired username below.', 'Rick');
		socket.emit('p_name_update', {p_name : p_name,
									p_no : data.p_no});
		document.addEventListener("keydown", 
				function(e){keyDown(e,p1);}, false);
		document.addEventListener("keyup", 
				function(e){keyUp(e,p1);}, false);
	} else if (data.p_no == 1) {
		observer = false;
		console.log('You are now Player 2.');
		p_name = prompt('You are now Player 2 (Blue). '+
			'Move using the arrow keys, '+
			'where up is jump, and down is kick. '+
			'Enter your desired username below.', 'Morty');
		socket.emit('p_name_update', {p_name : p_name,
									p_no : data.p_no});
		document.addEventListener("keydown", 
				function(e){keyDown(e,p2);}, false);
		document.addEventListener("keyup", 
				function(e){keyUp(e,p2);}, false);
	} else if (data.p_no == 2) {
		observer = true;
		console.log('You are now an observer.');
		alert('You are now an observer. When someone leaves, ' +
			'refresh page to join game.');
	}
});


socket.on('p_disconnect', function(server) {
	if (server.p_no == 0) {
		alert('Player 1 has disconnected.');
	} else if (server.p_no == 1) {
		alert('Player 2 has disconnected.');
	}
});

socket.on('sync', function(server){
	syncClient(server);
});


var syncClient = function(server){
	for (var i=0; i < players.length; i++) {
		var p = players[i];
		p.pos.x = server.players[i].pos.x;
		p.pos.y = server.players[i].pos.y;
		p.goalPost.pos.x = server.players[i].goalPost.pos.x;
		p.goalPost.pos.y = server.players[i].goalPost.pos.y;
		p.kick = server.players[i].kick;
		p.ctrls = server.players[i].ctrls;
		p.p_name = server.players[i].p_name;
	}
	ball.pos.x = server.ball.pos.x;
	ball.pos.y = server.ball.pos.y;
	text = server.text;
	score_p1 = server.score_p1;
	score_p2 = server.score_p2;
	scored = server.scored;
};

var sendData = function(){
	if (p_no == 0) {
		socket.emit('sendData', {player:p1});
		p1.downPress = false;
	} else if (p_no == 1) {
		socket.emit('sendData', {player:p2})
		p2.downPress = false;
	}
};

setInterval(function(){
	if (observer) {
	} else {
	sendData();
	}
},1000/60)