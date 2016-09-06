'use strict'

var canvas = document.getElementById('canvasHB');
var ctx = canvas.getContext('2d');

// Controls are up, down, left, right.
var p1_ctrls = new Array(87,83,65,68);
var p2_ctrls = new Array(38,40,37,39);
var spf = 0.3; // Seconds per frame.


Object.prototype.clone = Array.prototype.clone = function()
{
    if (Object.prototype.toString.call(this) === '[object Array]')
    {
        var clone = [];
        for (var i=0; i<this.length; i++)
            clone[i] = this[i].clone();

        return clone;
    } 
    else if (typeof(this)=="object")
    {
        var clone = {};
        for (var prop in this)
            if (this.hasOwnProperty(prop))
                clone[prop] = this[prop].clone();

        return clone;
    }
    else
        return this;
}


function dot(a,b) {
	var n = 0;
	for (var i = 0; i < 2; i++) n += a[i] * b[i];
		return n;
}

function sub(a,b) {
	var c = [0,0];
	for (var i = 0; i < 2; i++) {
		c[i] += a[i] - b[i];
	};
	return c;
}


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
Vector2d.prototype.dot = function(u) {
	return this.x*u.x + this.y*u.y;
};
Vector2d.prototype.sub = function(u) {
	return new Vector2d(this.x-u.x, this.y-u.y);
};

var CircCollider = function(x,y,r) {
	this.x = x;
	this.y = y;
	this.r = r;
};
CircCollider.prototype.check = function (coll) {
	if (coll instanceof CircCollider) {
		if (Math.sqrt((this.x - coll.x)*(this.x - coll.x)
			+ (this.y - coll.y)*(this.y - coll.y)) < 
			(this.r + coll.r)) {
			return true;
		} else {
			return false;
		}
	} else if (coll instanceof RectCollider) {
		var distX = Math.abs(this.x - coll.x - coll.w/2);
   		var distY = Math.abs(this.y - coll.y - coll.h/2);

    	if (distX > (coll.w/2 + this.r)) {
      	 	return false;
    	}
    	if (distY > (coll.h/2 + this.r)) {
        	return false;
    	}

    	if (distX <= (coll.w/2)) {
       		return true;
    	}
    	if (distY <= (coll.h/2)) {
        	return true;
    	}

    	var dx = distX - coll.w/2;
    	var dy = distY - coll.h/2;
    	return (dx*dx + dy*dy <= (this.r*this.r));
	}
};
CircCollider.prototype.update = function (x,y) {
	this.x = x;
	this.y = y;
};

var RectCollider = function(x,y,w,h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};
RectCollider.prototype.check = function (coll) {
	if (coll instanceof RectCollider) {
		if (this.x <= coll.x + coll.w &&
   			this.x + this.w >= coll.x &&
  			this.y <= coll.y + coll.h &&
   			this.h + this.y >= coll.y) {
			return true;
		}
	} else if (coll instanceof CircCollider) {
		var distX = Math.abs(coll.x - this.x - this.w/2);
   		var distY = Math.abs(coll.y - this.y - this.h/2);

    	if (distX > (this.w/2 + coll.r)) {
      	 	 return false;
    	}
    	if (distY > (this.h/2 + coll.r)) {
        	return false;
    	}

    	if (distX <= (this.w/2)) {
       		return true;
    	}
    	if (distY <= (this.h/2)) {
        	return true;
    	}

    	var dx = distX - this.w/2;
    	var dy = distY - this.h/2;
    	return (dx*dx + dy*dy <= (coll.r*coll.r));
	}
};
RectCollider.prototype.update = function (x,y) {
	this.x = x;
	this.y = y;
};


var Player = function(x,y,ctrls,colour,p_no){
	this.pos = new Vector2d(x,y); // position of head centre
	this.vel = new Vector2d(0,0);
	this.acc = new Vector2d(0,0);
	this.last_pos = new Vector2d(0,0);
	this.mass = 60;
	this.headSize = 40;
	this.init(x,y,ctrls,colour,p_no);
};

Player.prototype.init = function(x,y,ctrls,colour,p_no) {
	this.ctrls = ctrls;
	this.p_no = p_no;
	this.colour = colour;
	this.upPress = false;
	this.downPress = false;
	this.leftPress = false;
	this.rightPress = false;

	this.pos.set(x,y);
	this.vel.set(0,0);

	this.headColl = new CircCollider(this.pos.x, 
									this.pos.y, 
									this.headSize)
	this.bodyColl = new RectCollider(this.pos.x-
									this.headSize*0.5, 
									this.pos.y+
									this.headSize, 
									this.headSize, 
									this.headSize*2.1)
	this.footColl = new CircCollider(this.pos.x, 
									this.pos.y+
									this.headSize*3.4, 
									this.headSize*0.3)

	
	this.goalPost = new GoalPost(p_no,
						this.headSize*4,
						this.headSize*9);

	this.frozen = false;
	this.kick = false;
	this.canJump = true;
	this.jumpSpd = -20*spf;
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
	if (this.kick) {
		var that = this;
		setTimeout(function(){
			that.kick = false;
		}, 100);
		if (this.p_no == 0) {
			var dir = 0;
		} else if (this.p_no == 1){
			var dir = this.headSize*1.4;
		}
		ctx.rect(this.pos.x-dir, 
			this.pos.y+this.headSize*3.1, 
			this.headSize*1.4, 
			this.headSize*0.6)
	}

	ctx.fillStyle = '#000000';
	ctx.fill();
	ctx.closePath();

	this.goalPost.draw();
};

Player.prototype.update = function() {
	if (this.pos.y < canvas.height - this.headSize*3.7){
		this.acc.y = 1.5*spf*spf;
		this.canJump = false;
	} else {
		this.pos.y = canvas.height - this.headSize*3.7;
		this.acc.y = 0;
		this.vel.y = 0;
		this.canJump = true;
	}

	if (this.rightPress && !this.leftPress) {
		if (Math.sign(this.vel.x) == -1){
			this.acc.x = 2.5*spf*spf;
		} else {
			this.acc.x = 1*spf*spf;
		}
	} else if (this.leftPress && !this.rightPress) {
		if (Math.sign(this.vel.x) == 1){
			this.acc.x = -2.5*spf*spf;
		} else {
			this.acc.x = -1*spf*spf;
		}
	} else if (this.pos.y < 
				canvas.height-this.headSize*3.7) {
		this.acc.x = 0;
	} else if (Math.abs(this.vel.x) > 1*spf) {
		this.acc.x = -Math.sign(this.vel.x)*2*spf;
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
		this.vel.x = -0.5*this.vel.x;
		this.acc.x = 0;
	} else if (this.pos.x + this.headSize > canvas.width) {
		this.pos.x = canvas.width - this.headSize;
		this.vel.x = -0.5*this.vel.x;
		this.acc.x = 0;
	}

	this.last_pos = this.pos.clone();
	this.pos.add(this.vel);
	this.vel.add(this.acc);

	this.headColl.update(this.pos.x, 
						this.pos.y)
	this.bodyColl.update(this.pos.x-
						this.headSize*0.5, 
						this.pos.y+
						this.headSize*0)
	this.footColl.update(this.pos.x, 
						this.pos.y+
						this.headSize*3.4)
};



var Ball = function(x,y){
	this.pos = new Vector2d(x,y); // position of head centre
	this.vel = new Vector2d(0,0);
	this.acc = new Vector2d(0,1.5*spf*spf);
	this.last_pos = new Vector2d(0,0);
	this.mass = 1;
	this.size = 30; 
	this.init(x,y);
};

Ball.prototype.init = function(x,y) {
	this.pos.set(x,y);
	this.vel.set(0,0);
	this.coll = new CircCollider(this.pos.x, 
									this.pos.y, 
									this.size)
	this.elast = 0.7;
};

Ball.prototype.draw = function() {
	ctx.beginPath();
	ctx.arc(this.pos.x, 
			this.pos.y, 
			this.size, 
			0, Math.PI*2);
	ctx.fillStyle = '#000000';
	ctx.fill();
	ctx.closePath();
};

Ball.prototype.update = function(players) {
	if (this.pos.y < this.size) {
		this.pos.y = this.size;
		this.vel.y = -this.elast*this.vel.y;
	} else if (this.pos.y >= canvas.height - this.size) {
		this.pos.y = canvas.height - this.size;
		this.vel.y = -this.elast*this.vel.y;
	}

	if (Math.abs(this.vel.x) > 1*spf &&
		this.pos.y >= canvas.height - this.size) {
		this.acc.x = -Math.sign(this.vel.x)*2*spf;
	} else {
		this.acc.x = 0;
	}

	if (this.pos.x - this.size < 0) {
		this.pos.x = 0 + this.size;
		this.vel.x = -0.8*this.vel.x;
		this.acc.x = -this.acc.x;
	} else if (this.pos.x + this.size > canvas.width) {
		this.pos.x = canvas.width - this.size;
		this.vel.x = -0.8*this.vel.x;
		this.acc.x = -this.acc.x;
	}


	for (var i=0; i < players.length; i++) {
		var p = players[i];
		var sizes = this.size + p.headSize;
		if (this.coll.check(p.headColl) || 
			this.coll.check(p.footColl)) {
			if (this.coll.check(p.headColl)) {
				var posP = p.pos;
				//p.pos.x = p.last_pos.x.clone();
				//p.pos.y = p.last_pos.y.clone();
			} else {
				var posP = new Vector2d(p.pos.x, 
							p.pos.y+3.4*p.headSize);
				//p.pos.x = p.last_pos.x.clone();
				p.pos.y = p.last_pos.y.clone();
			}

			var velB = this.vel;
			var posB = this.pos;
			var velP = p.vel;
			var mB = this.mass;
			var mP = p.mass;
			
			this.vel.x =  this.vel.x - ((2*mP/(mB+mP))*(
				velB.sub(velP).dot(posB.sub(posP)))/
				posB.sub(posP).dot(posB.sub(posP)))*
				posB.sub(posP).x;
			this.vel.y = this.vel.y - ((2*mP/(mB+mP))*(
				velB.sub(velP).dot(posB.sub(posP)))/
				posB.sub(posP).dot(posB.sub(posP)))*
				posB.sub(posP).y;

			p.vel.x =  p.vel.x - ((2*mB/(mB+mP))*(
				velP.sub(velB).dot(posP.sub(posB)))/
				posP.sub(posB).dot(posP.sub(posB)))*
				posP.sub(posB).x;
			p.vel.y =  p.vel.y - ((2*mB/(mB+mP))*(
				velP.sub(velB).dot(posP.sub(posB)))/
				posP.sub(posB).dot(posP.sub(posB)))*
				posP.sub(posB).y;

			this.pos.x = this.last_pos.x.clone();
			this.pos.y = this.last_pos.y.clone();

		} else if (this.coll.check(p.bodyColl)) {
				var vel_init = this.vel.x.clone();
				this.vel.x = (p.mass/(this.mass+p.mass)*
							(p.vel.x - this.vel.x));
				p.vel.x = -(this.mass/(this.mass+p.mass)*
							(p.vel.x - vel_init));

				this.pos.x = this.last_pos.x.clone();
				this.pos.y = this.last_pos.y.clone();
				console.log('horizontal collision');
		}

		if (p.downPress) {
			p.kick = true;
			p.downPress = false;
			if (Math.sqrt(((this.pos.x - p.pos.x)*
				(this.pos.x - p.pos.x)) + 
				((this.pos.y-p.pos.y-3.4*p.headSize)*
				(this.pos.y-p.pos.y-3.4*p.headSize))) < 
				(this.size + 1.4*p.headSize) &&
				this.pos.y+this.size > p.pos.y-p.headSize*3.7) {
				if (p.p_no == 0 && this.pos.x > p.pos.x) {
					this.vel.y -= 30*spf;
					this.vel.x += 30*spf;
				} else if (p.p_no == 1 && this.pos.x < p.pos.x) {
					this.vel.y -= 30*spf;
					this.vel.x -= 30*spf;
				}
			}
		}

		if (this.coll.check(p.goalPost.topColl)) {
			if (this.coll.check(p.goalPost.cornerColl)) {
				this.vel.x = -this.vel.x;
			} else {
				this.vel.y = -this.vel.y;
			}
			this.pos.x = this.last_pos.x.clone();
			this.pos.y = this.last_pos.y.clone();
		} else if (this.coll.check(p.goalPost.goalColl)) {
			restartGame(p.p_no);
		}
	}
	this.last_pos = this.pos.clone();
	this.pos.add(this.vel);
	this.vel.add(this.acc);
	this.coll.update(this.pos.x, this.pos.y);
};

var GoalPost = function(p_no,w,h) {
	this.w = w;
	this.h = h;
	this.p_no = p_no;
	this.init(p_no,w,h);
};
GoalPost.prototype.init = function (p_no,w,h) {
	if (this.p_no == 0) {
		var pos_x = 0;
		var corner_x = this.w - 10;
	} else if (this.p_no == 1) {
		var pos_x = canvas.width - this.w;
		var corner_x = pos_x;
	}
	this.topColl = new RectCollider(
					pos_x,
					canvas.height - this.h,
					this.w,
					10);
	this.cornerColl = new RectCollider(
					corner_x,
					canvas.height - this.h,
					10,
					10);
	this.goalColl = new RectCollider(
					pos_x,
					canvas.height - this.h + 10,
					this.w,
					this.h - 10);
	this.draw();
};
GoalPost.prototype.draw = function () {
	ctx.beginPath();
	ctx.rect(this.topColl.x,
			this.topColl.y,
			this.w,
			this.h);
	ctx.strokeStyle = '#000000';
	ctx.lineWidth = 8;

	ctx.stroke();
	ctx.closePath();
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


var p1 = new Player(canvas.width*0.2,canvas.height,
					p1_ctrls,'blue',0);
var p2 = new Player(canvas.width*0.8,canvas.height,
					p2_ctrls,'red',1);
var players = new Array(p1,p2);
var ball = new Ball (canvas.width/2, 
					canvas.height*0.1)

var text = '';
var score_p1 = 0;
var score_p2 = 0;
var scored = false;

var drawScore = function () {
	ctx.font = "60px Comic Sans MS";
	ctx.fillStyle = "grey";
	ctx.textAlign = "center";
	ctx.fillText(text, canvas.width/2, canvas.height/4);
	ctx.fillText(score_p1.toString()+'-'+score_p2.toString(),
				canvas.width/2, canvas.height/3);
}

var restartGame = function (p_no) {
	scored = true;
	if (p_no == 0) {
		text = 'Player 1 Scored!';
		score_p1 += 1;
	} else if (p_no == 1) {
		text = 'Player 2 Scored!';
		score_p2 += 1;
	}
	p1 = new Player(canvas.width*0.2,canvas.height,
					p1_ctrls,'blue',0);
	p2 = new Player(canvas.width*0.8,canvas.height,
					p2_ctrls,'red',1);
	players = new Array(p1,p2);
	ball = new Ball (canvas.width/2, 
					canvas.height*0.1)
}

document.addEventListener("keydown", function(e){keyDown(e,p1);}, false);
document.addEventListener("keyup", function(e){keyUp(e,p1);}, false);

document.addEventListener("keydown", function(e){keyDown(e,p2);}, false);
document.addEventListener("keyup", function(e){keyUp(e,p2);}, false);

var update = function(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ball.draw();
	for (var i=0; i<players.length; i++) {
		players[i].draw();
		players[i].update();
	}
	ball.update(players);
}

//setInterval(update,spf*1000);
function repeat() {
  	update()
  	if (scored) {
		drawScore();
		setTimeout(function(){scored = false;}, 2000);
	}
  	requestAnimationFrame(repeat);
}
repeat();