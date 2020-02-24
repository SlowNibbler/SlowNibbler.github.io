function Spawner(theGame) {
    this.game = theGame
    this.ammoTimer = 0;
    this.agentsLeft = 12;
    for (var i = 0; i < 12; i++) {
        var agent = new Agent(theGame, this);
        theGame.addEntity(agent);
    }
};

Spawner.prototype = new Entity();
Spawner.prototype.constructor = Spawner;

Spawner.prototype.draw = function() {
}

Spawner.prototype.update = function() {
    if (this.agentsLeft == 1) {
        for (var i = 0; i < this.game.entities.length; i++) {
            if (this.game.entities[i].name == "Bullet") {
                this.game.entities[i].removeFromWorld = true;
            }
        }
    }
    if (this.game.timer.gameTime > 1 && this.agentsLeft > 1) {
        if (getRandomInt(2) == 1 && this.ammoTimer == 0) {
            this.game.addEntity(new Ammo(this.game));
            this.ammoTimer = 200;
        }
        else if (this.ammoTimer > 0) {
            this.ammoTimer--;
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


Spawner.prototype.enemiesLeft = function() {
    return this.agentsLeft;
}

Spawner.prototype.enemyDied = function() {
    this.agentsLeft--
}
  

function Ammo(theGame) {
    this.game = theGame
    this.name = "Ammo";
    this.x = Math.abs(getRandomInt(800));
    this.y = Math.abs(getRandomInt(800));
    this.radius = 10;
}

Ammo.prototype = new Entity();
Ammo.prototype.constructor = Ammo;

Ammo.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};


Ammo.prototype.update = function () {
    Entity.prototype.update.call(this);
};

Ammo.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "Green";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

