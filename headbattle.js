'use strict'

var canvas = document.getElementById('canvasHB');
var ctx = canvas.getContext('2d');

var p1_ctrls = new Array(87,83,65,68);


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


var Player = function(x,y,ctrls){
	this.pos = new Vector2d(x,y); // position of head centre
	this.vel = new Vector2d(0,0);
	this.acc = new Vector2d(0,0);
	this.headSize = 40; 
	this.bod
	this.init(x,y,ctrls);
};

Player.prototype.init = function(x,y,ctrls) {
	this.ctrls = ctrls;
	console.log(this.ctrls);
	console.log(typeof(this.ctrls))
	this.upPress = false;
	this.downPress = false;
	this.leftPress = false;
	this.rightPress = false;

	this.pos.set(x,y);
	this.vel.set(0,0);
	this.frozen = false;
	this.canJump = true;
	this.jumpSpd = -20;
};

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
		this.canJump = false;
	} else {
		this.pos.y = 900 - this.headSize*3.7;
		this.acc.y = 0;
		this.vel.y = 0;
		this.canJump = true;
	}

	if (this.rightPress && !this.leftPress) {
		if (Math.sign(this.vel.x) == -1){
			this.acc.x = 2;
		} else {
			this.acc.x = 1;
		}
	} else if (this.leftPress && !this.rightPress) {
		if (Math.sign(this.vel.x) == 1){
			this.acc.x = -2;
		} else {
			this.acc.x = -1;
		}
	} else if (Math.abs(this.vel.x) > 0) {
		this.acc.x = -Math.sign(this.vel.x)*2;
	} else {
		this.acc.x = 0;
		this.vel.x = 0;
	}


	if (this.frozen){
		this.vel.x = 0;
		this.acc.x = 0;
	}

	if (this.canJump && this.upPress){
		this.vel.y = this.jumpSpd;
		this.canJump = false;
		this.jumpTimer=0;
	}

	if (this.pos.x - this.headSize < 0) {
		this.pos.x = 0 + this.headSize;
		this.vel.x = 0;
		this.acc.x = 0;
	} else if (this.pos.x + this.headSize > 1600) {
		this.pos.x = 1600 - this.headSize;
		this.vel.x = 0;
		this.acc.x = 0;
	}

	this.pos.add(this.vel);
	this.vel.add(this.acc);
};



var keyDown = function(e,p) {
	if(e.keyCode == p.ctrls[0]) {
        p.upPress = true;
    }
    else if(e.keyCode == p.ctrls[1]) {
        p.downPress = true;
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

var p1 = new Player(200,50,p1_ctrls);

document.addEventListener("keydown", function(e){keyDown(e,p1);}, false);
document.addEventListener("keyup", function(e){keyUp(e,p1);}, false);


var update = function(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	p1.draw();
	p1.update();
}

setInterval(update,30);