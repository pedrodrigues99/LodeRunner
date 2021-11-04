/*     Lode Runner

Aluno 1: 53623 Angelo Bennett <-- mandatory to fill
Aluno 2: 53713 Pedro Rodrigues <-- mandatory to fill

Comentario:

01234567890123456789012345678901234567890123456789012345678901234567890123456789

Tem que clicar no butao start/restart para iniciar o jogo, e quando o
faz, clica numa parte em branco da pagina para poder utilizar o spacebar
para disparar. Se nao o fizer, vai estar sempre a reiniciar o nivel quando
tenta utilizar a arma. O mesmo se aplica para qualquer butao utilizada, visto
que a spacebar funciona como o enter nestes casos, ativando o butao em questao.

Achamos o projeto interessante e muito desafiante, nomeadamente a implementacao
do movimento autonomo dos robos ( que levou a algumas dificuldades ) e a 
utilizacao da linguagem HTML para a criacao de um jogo interativo. O maior 
obstaculo ao funcionamento do nosso jogo foi a nao atualizacao do posicionamento
do heroi, que levava os robos a andarem sempre para a mesma posicao, a posicao
inicial do heroi no nivel. Este erro levou a varias mudancas desnecessarias, 
dado que a programacao do movimento dos robos esteve sempre bem implementada, 
no entanto, o erro encontrava-se na criacao da variavel 'hero', ao gerar um novo 
nivel, visto que estavamos a utilizar "" em vez de ''.

Esta a dar um erro no mooshak com o audio, porem as butoes relevantes ao audio
estao completamente funcionais.

*/


// GLOBAL VARIABLES

// tente não definir mais nenhuma variável global

let empty, hero, control;


// ACTORS

class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.imageName = imageName;
		this.show();
	}
	draw(x, y) {
		control.ctx.drawImage(GameImages[this.imageName],
				x * ACTOR_PIXELS_X, y* ACTOR_PIXELS_Y);
	}
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}
	isBarrier(){
		return false;
	}
	isKillable(){
        return false;
    }
	isHero(){
		return false;
	}
	isEvil(){
		return false;
	}
	isGround(){
		return false;
	}
	
}

class PassiveActor extends Actor {
	show() {
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}
	hide() {
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
	}
	
	isAir(){
		return false;
	}
	isGold(){
		return false;
	}
	isBrick(){
		return false;
	}
	isBoundary(){
		return false;
	}
	isLadder(){
		return false;
	}	
	isRope(){
		return false;
	}
	isFinalStair(){
		return false;
	}
	isHole(){
		return false;
	}
}

class ActiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
		this.time = 0;	// timestamp used in the control of the 
		this.nGold = 0;
		this.lookingLeft = true;
		this.falling = false;
	}
	
	show() {
		control.worldActive[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}
	hide() {
		control.worldActive[this.x][this.y] = empty;
		control.world[this.x][this.y].draw(this.x, this.y);
	}
	animation() {
	}
	
	isFalling(){
		let behind = control.getBehind(this.x, this.y);
		let atFeet = control.get(this.x, this.y + 1);
		/* ar livre behind e chao nos pes */
		if(atFeet.isEvil())
			this.falling = false;
		else if(behind.isAir() && !atFeet.isGround()){
			this.falling = true;
		}
		else
			this.falling = false;
		return this.falling;
	}
	
	hasGold() {
		if (this.nGold != 0)
			return true;
		else
			return false;
	}
	
	getGold() {
		this.nGold += 1;
	}
	
	loseGold() {
		this.nGold -= 1;
	}
	
	lookingRight() {
		if(!this.lookingLeft)
			return true;
		else
			return false;
	}
	
	lookRight(){
		this.lookingLeft = false;
	}
	
	lookLeft(){
		this.lookingLeft = true;
	}
	
	isGroud(){
		return true;
	}
}

class Brick extends PassiveActor {
	constructor(x, y) { super(x, y, "brick"); }
	
	isBarrier(){
		return true;
	}
	isGround(){
		return true;
	}
	isBrick(){
		return true;
	}
}

class Chimney extends PassiveActor {
	constructor(x, y) { super(x, y, "chimney"); }
	isAir(){
		return true;
	}
}

class Empty extends PassiveActor {
	constructor() { super(-1, -1, "empty"); }
	show() {}
	hide() {}
	isAir(){
		return true;
	}
}

class Hole extends PassiveActor {
	constructor(x, y) { super(x, y, "empty"); }
	isAir(){
		return true;
	}
	isHole(){
		return true;
	}
	isGround(){
        return false;
    }
}

class Gold extends PassiveActor {
	constructor(x, y) { super(x, y, "gold"); }
	isGold() {
		return true;
	}
}

class Invalid extends PassiveActor {
	constructor(x, y) { super(x, y, "invalid"); }
}

class Ladder extends PassiveActor {
	constructor(x, y) {
		super(x, y, "empty");
		this.finalStair = false;
	}
	
	makeVisible() {
		this.imageName = "ladder";
		this.show();
	}
	
	isGround(){
			return true;
	}
	
	isLadder(){
		return true;
	}
	
	makeFinal(){
		this.finalStair = true;
	}
	
	isFinalStair(){
		return this.finalStair;
	}
}

class Rope extends PassiveActor {
	constructor(x, y) { super(x, y, "rope"); }
	
	isRope(){
		return true;
	}
}

class Stone extends PassiveActor {
	constructor(x, y) { super(x, y, "stone"); }
	
	isBarrier(){
		return true;
	}
	isGround(){
		return true;
	}
}

class Boundary extends Stone {
	constructor() { super(-1, -1); }
	show() {}
	hide() {}
	
	isBarrier(){
		return true;
	}
	
	isBoundary() {
		return true;
	}
}

class Hero extends ActiveActor {
	constructor(x, y) {
		super(x, y, "hero_runs_left");
		this.x = x;
		this.y = y;
		this.shooting = false;
		this.killable = true;
		this.lvlGold = 0;
		this.end = false;
	}
	
	isKillable(){
		return true;
	}
	
	isHero(){
		return true;
	}
	
	isBarrier(){
		return true;
	}
	
	
	
	checkLooking(dx){
		if(dx == -1)
			this.lookLeft();
		else if(dx == 1)
			this.lookRight();
	}

	shoot(x, y){
		if(control.getBehind(x,y).isAir() && 
		control.getUnder(x,y+1).isGround()){
			if(control.canMakeHole(x,y, this.lookingRight()) && 
			control.canRecoil(x, y, this.lookingRight())){
				control.destroyBlock(x,y,this.lookingRight());
				if(this.lookingRight()){
					this.shooting = true;
					this.move(-1,0);
				}else{
					this.shooting = true;
					this.move(1,0);
				}
			}
		}
	}
	
	move(dx, dy){
		let next = control.get(this.x + dx, this.y + dy);
		let under = control.getUnder(this.x, this.y + 1);
		let behind = control.getBehind(this.x, this.y);
		if(!this.shooting)
			this.checkLooking(dx);
		if(next.isBarrier()	)
			/* nothing */ ;
		else{
			this.hide();
			
			this.x += dx;
			this.y += dy;
			this.checkBehind();
			if(!this.end)
				this.show();
		}
	}
	
	getXPos(){
		return this.x;
	}
	
	getYPos(){
		return this.y;
	}
	
	animation() {
		let k = control.getKey();
		if(this.isFalling())
			this.move(0, 1);
		else if( k == ' ' ){
			this.shoot(this.x, this.y);
		} else if( k == null )
			/* nothing */ ;
		else {
			let [dx, dy] = k;
			this.move(dx, dy);
		}
	}

	show() {
		let behind = control.getBehind(this.x, this.y);
		// Muitos casos
		// alterar this.imageName
		
		if(!this.lookingRight()){
			if(this.shooting){
				this.imageName = "hero_shoots_left";
				this.shooting = false;
			} else {
				if(this.isFalling()){
					this.imageName = "hero_falls_left";
				} else {
					if(behind.imageName === "ladder"){
						if(this.imageName !== "hero_on_ladder_left")
							this.imageName = "hero_on_ladder_left";
						else
							this.imageName = "hero_on_ladder_right";
					}  else if(behind.imageName === "rope")
						this.imageName = "hero_on_rope_left";
					else
						this.imageName = "hero_runs_left"
				}
			}
		} else if(this.lookingRight()){
			if(this.shooting){
				this.imageName = "hero_shoots_right";
				this.shooting = false;
			} else {
				if(this.isFalling())
					this.imageName = "hero_falls_right";
				else {
					if(behind.imageName === "ladder"){
						if(this.imageName !== "hero_on_ladder_right")
							this.imageName = "hero_on_ladder_right";
						else
							this.imageName = "hero_on_ladder_left";
					} else if(behind.imageName === "rope")
						this.imageName = "hero_on_rope_right";
					else
						this.imageName = "hero_runs_right";
				}
			}
		}
		
		super.show();
	}

	checkBehind(){
		let behind = control.getBehind(this.x, this.y);
		let under = control.getUnder(this.x, this.y + 1);
		if(behind.isGold()){
			this.getGold();
			this.lvlGold++;
			behind.hide();
			updateGold();
			updateTotalGold();
			putScore();
		}
		if(this.lvlGold === control.goldLevel)
			control.ladderDrop();
		
		if(behind.isLadder && this.y === 0)
			if(control.finalLadderVisible && 
				this.lvlGold === control.goldLevel){
				this.end = true;
				this.hide();
				control.saveScore();
				control.saveGold();
				control.nextLevel();
			}
			
		if(under.isBoundary() && behind.isHole()){
			this.end = true;
			alert("Game Over")
			resetLevelScore();
			resetLevelGold();
			control.incDeaths();
			control.reloadLevel();
		}
	}
	
	getPos() {
			return [this.x, this.y];
		}
		
	
}

class Robot extends ActiveActor {
	constructor(x, y) {
		super(x, y, "robot_runs_right");
		this.x = x;
		this.y = y;
		this.lookUp = false;
		this.lookDown = false;
		this.timeWithGold = 0;
		this.timeInHole = 0;
	  }
	  
	isBarrier(){
		return true;
	}
	
	isEvil(){
		return true;
	}
	
	unexpectedDropGold(){
        control.world[this.x][this.y-1] = new Gold(this.x, this.y-1);
        control.world[this.x][this.y-1].show();
        this.timeWithGold = 0;
        this.loseGold();
    }
	
	move(dx, dy){
		let next = control.get(this.x + dx, this.y + dy);
		let under = control.getUnder(this.x, this.y+1);
		if(next.isBarrier()){
			if(next.isKillable()){
				alert("Game Over")
				resetLevelScore();
				resetLevelGold();
				control.incDeaths();
				control.reloadLevel();
			}
			
			else if(control.getBehind(this.x, this.y).isHole() && 
					!next.isHero()){
				this.y += dy;
				this.show();
				this.time++;
			}
			
		} else {
			this.hide();
			this.x += dx;
			this.y += dy;
			this.checkBehind();
			this.show();
			this.time++;
		}
		
	}

	animation(){
		this.calcOrientation();
		if(this.isFalling() && !control.getBehind(this.x, this.y).isHole()){
				this.move(0, 1);
		} 
		else if(control.getBehind(this.x, this.y).isHole()){
			if(this.hasGold())
                this.unexpectedDropGold();
			this.timeInHole++;
			if(this.timeInHole >= 10 && 
			!control.get(this.x, this.y-1).isBarrier())
				this.getOut();
		}
		else {
			if(this.lookUp && control.getBehind(this.x, this.y).isLadder()){
				this.move(0, -1);
			} else if (this.lookDown && 
			(control.getUnder(this.x, this.y + 1).isLadder()
				|| control.getUnder(this.x, this.y + 1).isAir())){
				this.move(0, 1);
			} else {
				if(this.lookingRight()){
					this.move(1, 0);
				}else if(!this.lookingRight()){
					this.move(-1, 0);
				}
			}
		}
	}
	
	calcOrientation(){
		let heroPos = hero.getPos();
		var distLeft = distance(heroPos[0], heroPos[1], this.x - 1, this.y);
		var distRight = distance(heroPos[0], heroPos[1], this.x + 1, this.y);
		var distUp = distance(heroPos[0], heroPos[1], this.x, this.y - 1);
		var distDown = distance(heroPos[0], heroPos[1], this.x, this.y + 1);
		
		if(heroPos[1] < this.y){
			let shortest = {
				dist : distUp,
				orientation : "up"
			}
			
			if(shortest.dist > distRight){
				shortest.dist = distRight;
				shortest.orientation = "right";
			}
			
			if(shortest.dist > distLeft){
				shortest.dist = distLeft;
				shortest.orientation = "left";
			}
			
			if(shortest.orientation === "up"){
				if(!control.get(this.x, this.y - 1).isBarrier()){
					this.lookUp = true;
				} else {
					if(distLeft > distRight)
						this.lookRight();
					else
						this.lookLeft();
				}
			} else {
				this.lookUp = false;
				this.lookDown = false;
				if(shortest.orientation === "right"){
					this.lookRight();
				} else if (shortest.orientation === "left"){
					this.lookLeft();
				}
			}	
		} else if(heroPos[1] > this.y){
			let shortest = {
				dist : distDown,
				orientation : "down"
			}
			
			if(shortest.dist > distRight){
				shortest.dist = distRight;
				shortest.orientation = "right";
			}
			
			if(shortest.dist > distLeft){
				shortest.dist = distLeft;
				shortest.orientation = "left";
			}

			if(shortest.orientation === "down"){
				if(!control.getUnder(this.x, this.y + 1).isBarrier()){
					this.lookDown = true;
				} else {
					if(distLeft > distRight)
						this.lookRight();
					else
						this.lookLeft();
				}
			} else {
				this.lookDown = false;
				this.lookUp = false;
				if(shortest.orientation === "right"){
					this.lookRight();
				} else if (shortest.orientation === "left"){
					this.lookLeft();
				}
			}
		} else {
			this.lookUp = false;
			this.lookDown = false;
			if(distRight > distLeft){
				this.lookLeft();
			} else if(distLeft < distRight){
				this.lookRight();
			}
		}
	}

	show(){
		let behind = control.getBehind(this.x, this.y);
		
		if(!this.lookingRight()){
			if(this.isFalling())
				this.imageName = "robot_falls_left";
			else {
				if(this.lookUp){
					if(behind.isLadder()){
						if(this.imageName !== "robot_on_ladder_left")
							this.imageName = "robot_on_ladder_left";
						else
							this.imageName = "robot_on_ladder_right";
					}
				} else if(this.lookDown){
					if(behind.isLadder()){
						if(this.imageName !== "robot_on_ladder_left")
							this.imageName = "robot_on_ladder_left";
						else
							this.imageName = "robot_on_ladder_right";
					}
				} else if(behind.imageName === "rope")
						this.imageName = "robot_on_rope_left";
					else
						this.imageName = "robot_runs_left"
				}
		} else if(this.lookingRight()){
			if(this.isFalling())
				this.imageName = "robot_falls_right";
			else {
				if(this.lookUp){
					if(behind.isLadder()){
						if(this.imageName !== "robot_on_ladder_right")
							this.imageName = "robot_on_ladder_right";
						else
							this.imageName = "robot_on_ladder_left";
					}
				} else if(this.lookDown){
					if(behind.isLadder()){
						if(this.imageName !== "robot_on_ladder_right")
							this.imageName = "robot_on_ladder_right";
						else
							this.imageName = "robot_on_ladder_left";
					}
				} else if(behind.imageName === "rope")
						this.imageName = "robot_on_rope_right";
					else
						this.imageName = "robot_runs_right"
				}
			}
		super.show();
	}
	
	dropGold(){
		if(control.getBehind(this.x, this.y) == empty && 
		control.getUnder(this.x, this.y+1).isGround()){ 
			control.world[this.x][this.y] = new Gold(this.x, this.y);
			control.world[this.x][this.y].show();
			this.loseGold();
			this.timeWithGold = 0;
		}
	}
	
	checkBehind(){
		let behind = control.getBehind(this.x, this.y);
		let under = control.getUnder(this.x, this.y + 1);
		if(behind.isGold() && !this.hasGold()){
			this.getGold();
			behind.hide();
		}
		
		if(this.hasGold()){
			this.timeWithGold++;
			if(this.timeWithGold >= 5)
				this.dropGold();
		}
	}
	
	getOut(){
		// robot getting out of hole
		// spawn a brick in the hole
		this.timeInHole = 0;
		this.move(0,-1);
		control.get[this.x][this.y+1] = new Brick(this.x, this.y+1);
		control.get[this.x][this.y+1].show();
	}
	
}



// GAME CONTROL

class GameControl {
	constructor() {
		control = this;
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		this.clearMatrix();
		empty = new Empty();	// only one empty actor needed
		this.boundary = new Boundary();
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.currentLevel = 1;
		this.loadLevel(this.currentLevel);
		this.setupEvents();
		this.goldLevel;
		this.totalScore = 0;
		this.levelScore = 0;
		this.totalGold = 0;
		this.levelGold = 0;
		this.deaths = 0;
	}
	
	createMatrix() { // stored by columns
		let matrix = new Array(WORLD_WIDTH);
		for( let x = 0 ; x < WORLD_WIDTH ; x++ ) {
			let a = new Array(WORLD_HEIGHT);
			for( let y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = empty;
			matrix[x] = a;
		}
		return matrix;
	}

	clearMatrix() {
		  const ctx = document.getElementById("canvas1").getContext('2d');
		  ctx.save();
		  ctx.globalCompositeOperation = 'copy';
		  ctx.strokeStyle = 'transparent';
		  ctx.beginPath();
		  ctx.lineTo(0, 0);
		  ctx.stroke();
		  ctx.restore();
	}
	
	clear(){
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				control.world[x][y] = empty;
				control.worldActive[x][y] = empty;
			}
	}
	
	
	loadLevel(level) {
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		let map = MAPS[level-1];  // -1 because levels start at 1
		this.clearMatrix();
		this.clear();
		this.finalLadderVisible = false;
		this.currentLevel = level;
		this.goldLevel = 0;
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					// x/y reversed because map stored by lines
				GameFactory.actorFromCode(map[y][x], x, y);
				if(map[y][x] === "o")
					this.goldLevel += 1;
				putTotalGold(this.goldLevel);
				if(map[y][x] === "E")
					control.world[x][y].makeFinal();
				if(map[y][x] === 'h')
					hero = new Hero(x, y, "");
			}
	}

	getKey() {
		let k = control.key;
		control.key = 0;
		switch( k ) {
			case 37: case 79: case 74: return [-1, 0]; //  LEFT, O, J
			case 38: case 81: case 73: return [0, -1]; //    UP, Q, I
			case 39: case 80: case 76: return [1, 0];  // RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];  //  DOWN, A, K
			case 0: return null;
			default: return String.fromCharCode(k);
		// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		};	
	}
	
	setupEvents() {
		addEventListener("keydown", this.keyDownEvent, false);
		addEventListener("keyup", this.keyUpEvent, false);
		setInterval(this.animationEvent, 1000 / ANIMATION_EVENTS_PER_SECOND);
	}
	
	animationEvent() {
		control.time++;
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let a = control.worldActive[x][y];
				if( a.time < control.time ) {
					a.time = control.time;
					a.animation();
				}
			}
	}
	
	ladderDrop(){
		let map = MAPS[this.currentLevel-1];
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				if(map[y][x] === "E"){
					control.world[x][y].makeVisible();
					this.finalLadderVisible = true;
				}
			}
	}
	
	keyDownEvent(k) {
		control.key = k.keyCode;
	}
	
	keyUpEvent(k) {
	}
	
	isInside(x, y){
		return 0 <= x && x < WORLD_WIDTH && 0 <= y && y < WORLD_HEIGHT;
	}
	
	get(x, y) {
		if( !this.isInside(x,y) )
			return this.boundary;
		if ( control.worldActive[x][y] !== empty )
			return control.worldActive[x][y];
		else
			return control.world[x][y];
	}
	
	getBehind(x, y) {
		return control.world[x][y];
	}
	
	getUnder(x, y) {
        if(this.isInside(x, y)){
            return control.world[x][y];
        } else {
            return this.boundary;
        }
    }
	
	canMakeHole(x, y, lookingRight) {
		let canMake = false;
		if(lookingRight){
			let rightAdjacent = control.world[x+1][y+1];
			let aboveRightAdjacent = control.world[x+1][y];
			if(rightAdjacent.isBrick() && !aboveRightAdjacent.isGround())
				canMake = true;
		}
		else{
			let leftAdjacent = control.world[x-1][y+1];
			let aboveLeftAdjacent = control.world[x-1][y];
			if(leftAdjacent.isBrick() && !aboveLeftAdjacent.isGround())
				canMake = true;
		}
		
		return canMake;
	}
	
	canRecoil(x, y, lookingRight){
		let canRecoil = false;
		if(lookingRight){
			let rightBehind = control.world[x-1][y];
			let rightBehindFeet = control.world[x-1][y+1];
			if(!rightBehind.isBarrier() && rightBehindFeet.isGround())
				canRecoil = true;
		}
		else{
			let leftBehind = control.world[x+1][y];
			let leftBehindFeet = control.world[x+1][y+1];
			if(!leftBehind.isBarrier() && leftBehindFeet.isGround())
				canRecoil = true;
		}
		
		return canRecoil;
	}
	
	destroyBlock(x, y, lookingRight){
		if(lookingRight){
			control.world[x+1][y+1] = new Hole(x+1,y+1);
			control.world[x+1][y+1].show();
			}
		else
			control.world[x-1][y+1] = new Hole(x-1,y+1);
			control.world[x-1][y+1].show();
	}
	
	nextLevel(){
		this.currentLevel += 1;
		this.loadLevel(this.currentLevel);
		this.totalScore += 1500;
		this.levelScore = 0;
		this.levelGold = 0;
		reloadScore();
	}
	
	reloadLevel(){
		this.loadLevel(this.currentLevel);
		this.levelScore = 0;
		this.levelGold = 0;
	}
	
	incScore( points ) {
		this.levelScore += points;
		return this.totalScore + this.levelScore;
	}
	
	getLevelScore(){
		return this.totalScore;
	}
	
	saveScore() {
		this.totalScore = this.totalScore + this.levelScore;
	}
	
	incGold(){
		this.levelGold += 1;
		return this.totalGold + this.levelGold;
	}
	
	getLevelGold(){
		return this.totalGold;
	}
	
	saveGold(){
		this.totalGold = this.totalGold + this.levelGold;
	}
	
	getDeaths(){
		return this.deaths;
	}
	
	incDeaths(){
		this.deaths += 1;
		putDeaths();
	}
	
}


// HTML FORM

function onLoad() {
  // Asynchronously load the images an then run the game
	GameImages.loadAll(function() { new GameControl(); });
	let el = document.getElementById('nGold') 
	el.innerHTML = 0;
	let score = document.getElementById('sc');
	score.innerHTML = 0;
	let deaths = document.getElementById('deathCounter');
	deaths.innerHTML = 0;
}

let audio = null;

function b1(url) { 
	if( audio == null)
		audio = new Audio("http://ctp.di.fct.unl.pt/miei/lap/projs/proj2020-3/files/louiscole.m4a");
	audio.loop = true;
	audio.play();
}	

function b2() {
	if( audio != null)
		audio.pause();
}

function updateGold() {
	let el = document.getElementById('nGold') 
	el.innerHTML = control.incGold();
}

function putTotalGold(nGold){
	let el = document.getElementById('nGoldLeft')
	el.innerHTML = nGold;
}

function updateTotalGold(){
	let el = document.getElementById('nGoldLeft')
	el.innerHTML = parseInt(el.innerHTML,10) - 1;
}

function resetLevelGold(){
	var el = document.getElementById('nGold');
	el.innerHTML = control.getLevelGold();
}

function loadNLevel(nLevel){
	control.loadLevel(nLevel);
	resetLevelScore();
	resetLevelGold();
}

function putScore(){
	var score = document.getElementById('sc');
	score.innerHTML = control.incScore(250);
}

function reloadScore(){
	var score = document.getElementById('sc');
	score.innerHTML = control.getLevelScore();
}

function resetLevelScore(){
	var score = document.getElementById('sc');
	score.innerHTML = control.getLevelScore();
}

function reloadLevel(){
	control.reloadLevel();
	resetLevelScore();
	resetLevelGold();
}

function putDeaths(){
	let deaths = document.getElementById('deathCounter');
	deaths.innerHTML = control.getDeaths();
}




