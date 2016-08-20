'use strict'

var canvas = document.getElementById('canvasHB');
var ctx = canvas.getContext('2d');


var rightPress_p1 = false;
var leftPress_p1 = false;
var upPress_p1 = false;
var downPress_p1 = false;

var rightPress_p2 = false;
var leftPress_p2 = false;
var upPress_p2 = false;
var downPress_p2 = false;

var p1_ctrls = new Array(87,83,65,67);


var Vector2d  = function (x,y) {
	this.x = x;
	this.y = y;
};
Vector2d.prototype.add = function(v) {
	this.x += v.x;
	this.y += v.y;
};
Vector2d.prototype.mult = function(s) {
	this.x *= s;
	this.y *= s;
};
Vector2d.prototype.set = function(x,y) {
	this.x = x;
	this.y = y;
};


var Player = function(x,y){
	this.pos = new Vector2d(x,y); // position of head centre
	this.vel = new Vector2d(0,0);
	this.acc = new Vector2d(0,0);
	this.headSize = 40; 
	this.bod
	this.init(x,y);
};

Player.prototype.init = function(ctrls,x,y) {
	this.ctrls = ctrls;
	console.log(this.ctrls);
	this.upPress = false;
	this.downPress = false;
	this.leftPress = false;
	this.rightPress = false;

	this.pos.set(x,y);
	this.vel.set(0,0);
	this.frozen = false;
	this.canJump = true;
	this.jumpDelay = 5;
	this.jumpTimer = 0;
	this.jumpSpd = -6;
};

document.addEventListener("keydown", Player.prototype.keyDown, false);
document.addEventListener("keyup", Player.prototype.keyUp, false);

Player.prototype.keyDown = function(e) {
	if(e.keyCode == this.ctrls[0]) {
		console.log('lol')
        this.upPress = true;
    }
    else if(e.keyCode == this.ctrls[1]) {
        this.downPress = true;
    } 
    else if(e.keyCode == this.ctrls[2]) {
        this.rightPress = true;
    }
    else if(e.keyCode == this.ctrls[3]) {
        this.leftPress = true;
    }
}

Player.prototype.keyUp = function(e) {
	if(e.keyCode == this.ctrls[0]) {
        this.upPress = false;
    }
    else if(e.keyCode == this.ctrls[1]) {
        this.downPress = false;
    } 
    else if(e.keyCode == this.ctrls[2]) {
        this.rightPress = false;
    }
    else if(e.keyCode == this.ctrls[3]) {
        this.leftPress = false;
    }
}





Player.prototype.draw = function() {
	ctx.beginPath();
	ctx.arc(this.pos.x, 
			this.pos.y, 
			this.headSize, 
			0, Math.PI*2);
	ctx.rect(this.pos.x-this.headSize*0.5, 
			this.pos.y+this.headSize*0.6, 
			this.headSize, 
			this.headSize*1.8)
	ctx.rect(this.pos.x-this.headSize*0.2, 
			this.pos.y+this.headSize*2.4, 
			this.headSize*0.4, 
			this.headSize)
	ctx.arc(this.pos.x, 
			this.pos.y+this.headSize*3.4, 
			this.headSize*0.3, 
			0, Math.PI*2);
	ctx.fillStyle = '#000000';
	ctx.fill();
	ctx.closePath();
};

Player.prototype.update = function() {
	if (this.pos.y < 900 - this.headSize*3.7){
		this.acc.y = 1;
	} else {
		this.acc.y = 0;
		this.vel.y = 0;
	}

	if (this.rightPress){
		this.acc.x = 1;
	} else if (!this.rightPress && this.vel.x > 0) {
		this.acc.x = -2;
	} else {
		this.acc.x = 0;
		this.vel.x = 0;
	}


	if (this.jumpTimer<this.jumpDelay){
		this.jumpTimer++;
	}else if (!this.canJump) {
		this.canJump = true;
	}
	if (this.frozen){ return; }
	if (this.canJump && upPress_p1){
		this.vel.y = this.jumpSpd;
		this.canJump = false;
		this.jumpTimer=0;
	}
	this.pos.add(this.vel);
	this.vel.add(this.acc);
};


// function keyDownHandler(e) {
//     if(e.keyCode == 87) {
//         upPress_p1 = true;
//     }
//     else if(e.keyCode == 83) {
//         downPress_p1 = true;
//     } 
//     else if(e.keyCode == 68) {
//         rightPress_p1 = true;
//     }
//     else if(e.keyCode == 65) {
//         leftPress_p1 = true;
//     }
// };


// function keyUpHandler(e) {
//     if(e.keyCode == 87) {
//         upPress_p1 = false;
//     }
//     else if(e.keyCode == 83) {
//         downPress_p1 = false;
//     } 
//     else if(e.keyCode == 68) {
//         rightPress_p1 = false;
//     }
//     else if(e.keyCode == 65) {
//         leftPress_p1 = false;
//     }
// };

var p1 = new Player(p1_ctrls,200,50);

var update = function(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	p1.draw();
	p1.update();
}

setInterval(update,30);