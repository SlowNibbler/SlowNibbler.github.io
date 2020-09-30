// James McHugh


// only change code in selectAction function()

function JRM(game) {
    this.player = 1;
    this.radius = 10;
    this.rocks = 0;
    this.kills = 0;
    this.name = "James McHugh";
    this.color = "White";
    this.cooldown = 0;
    this.direction = { x: randomInt(1600) - 800, y: randomInt(1600) - 800 };
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };
};

JRM.prototype = new Entity();
JRM.prototype.constructor = JRM;

// alter the code in this function to create your agent
// you may check the state but do not change the state of these variables:
//    this.rocks
//    this.cooldown
//    this.x
//    this.y
//    this.velocity
//    this.game and any of its properties

// you may access a list of zombies from this.game.zombies
// you may access a list of rocks from this.game.rocks
// you may access a list of players from this.game.players

JRM.prototype.selectAction = function () {

    var action = { direction: { x: this.direction.x, y: this.direction.y }, throwRock: false, target: null };
    var closestZombie = 1000;
    var closestRock = 1000;
    var closestAlly = 1000;
    var closestTarget = 1000;
    var target = null;
    var zombie = null;
    var rock = null;
    var ally = null;
    
    // find the closest rock that someone else isn't going after
    for (var i = 0; i < this.game.rocks.length; i++) {
        var ent = this.game.rocks[i];
        var dist = distance(this, ent);
        var dont = false;
        for (var j = 0; j < this.game.players.length; j++) {
            if (this.game.players[j] != this) {
                var tempDist = distance(ent, this.game.players[j]);
                if (tempDist < dist) {
                    dont = true;
                }
            }
        }
        if (dist < closestRock && dont == false) {
            closestRock = dist;
            rock = ent;
        }
    }

    // find the closest zombie, dont target the ones that someone else is about to kill
    for (var i = 0; i < this.game.zombies.length; i++) {
        var ent = this.game.zombies[i];
        var dist = distance(this, ent);
        var dont = false;
        for (var j = 0; j < this.game.players; j++) {
            var otherP = this.game.players[j];
            var tempDist = distance(ent, otherP);
            if ((tempDist < dist) && (otherP.rocks > 0)) {
                dont = true;
            }
        } 
        if (dont == false) {
            if (dist < closestTarget) {
                closestTarget = dist;
                target = ent;
            }
        }
        if (dist < closestZombie) {
            closestZombie = dist;
            zombie = ent;
        }
    }

    // find closest ally that doesn't have any rocks
    for (var i = 0; i < this.game.players.length; i++) {
        var ent = this.game.players[i];
        var dist = distance(this, ent);
        if (dist < closestAlly && this.game.players[i].rocks == 0) {
            closestAlly = dist;
            ally = ent;
        }
    }

    // evade zombies
    if (zombie && closestZombie < 100 && closestRock > closestZombie) {
        var difX = (zombie.x + this.x) / closestZombie;
        var difY = (zombie.y + this.y) / closestZombie;
        action.direction.x = difX * 1000000 / (closestZombie * closestZombie);
        action.direction.y = difY * 1000000/ (closestZombie * closestZombie);
    }

    
    // go after rocks
    else if (rock && this.rocks != 2) {
        var difX = (rock.x - this.x) / closestRock;
        var difY = (rock.y - this.y) / closestRock;
        action.direction.x = difX * 1000000 / (closestRock * closestRock);
        action.direction.y = difY * 1000000/ (closestRock * closestRock);
    }

    // chase zombies if you have rocks
    else if (zombie && this.rocks != 0) {
        var difX = (zombie.x - this.x) / closestZombie;
        var difY = (zombie.y - this.y) / closestZombie;
        action.direction.x = difX * 1000000 / (closestZombie * closestZombie);
        action.direction.y = difY * 1000000/ (closestZombie * closestZombie);
    }

    // throw at closest zombie if you have a rock
    if (target && closestTarget < 150) {
        action.target = target;
        action.throwRock = true;
    }
    // pass rocks
    else if (this.rocks == 2 && ally && closestAlly < 50) {
        action.target = ally;
        action.throwRock = true;
    }

    return action;
};

// do not change code beyond this point

JRM.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

JRM.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

JRM.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

JRM.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

JRM.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

JRM.prototype.update = function () {
    Entity.prototype.update.call(this);
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;
    this.action = this.selectAction();
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name !== "Zombie" && ent.name !== "Rock") {
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name === "Rock" && this.rocks < 2) {
                this.rocks++;
                ent.removeFromWorld = true;
            }
        }
    }
    

    if (this.cooldown === 0 && this.action.throwRock && this.rocks > 0) {
        this.cooldown = 1;
        this.rocks--;
        var target = this.action.target;
        var dir = direction(target, this);

        var rock = new Rock(this.game);
        rock.x = this.x + dir.x * (this.radius + rock.radius + 20);
        rock.y = this.y + dir.y * (this.radius + rock.radius + 20);
        rock.velocity.x = dir.x * rock.maxSpeed;
        rock.velocity.y = dir.y * rock.maxSpeed;
        rock.thrown = true;
        rock.thrower = this;
        this.game.addEntity(rock);
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

JRM.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};