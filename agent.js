// James McHugh

    
function Agent(game, theSpawner) {
    this.spawner = theSpawner;
    this.name = "Agent";
    this.radius = 20;
    this.visualRadius = 800;
    this.ammo = 3;
    this.cooldown = 0;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    this.direction = { x: 800, y: 800 };
    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
        this.speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

    }
};

Agent.prototype = new Entity();
Agent.prototype.constructor = Agent;



Agent.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Agent.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Agent.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Agent.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Agent.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Agent.prototype.selectAction = function() {
    var action = { direction: { x: this.direction.x, y: this.direction.y }, shoot: false, target: null, ammo: null, bullet: null };
    var closestBullet = 1000;
    var closestAmmo = 1000;
    var closestEnemy = 1000;

    for (var i = 0; i < this.game.entities.length; i++) {

        //if out of ammo or low, move towards ammo

        if (this.game.entities[i].name == "Ammo") {
            var ent = this.game.entities[i];
            var dist = distance(ent, this);
            if (dist < closestAmmo) {
                action.ammo = ent;
                closestAmmo = dist;
                
            }
        }

        // find closest bullet

        if (this.game.entities[i].name == "Bullet" && this.game.entities[i].shotBy != this) {
            var ent = this.game.entities[i];
            var dist = distance(ent, this);
            if (dist < closestBullet) {
                closestBullet = dist;
                action.bullet = ent;
            }
        }
        // find closest enemy

        if (this.game.entities[i] != this && this.game.entities[i].name == "Agent") {
            var ent = this.game.entities[i];
            var dist = distance(ent, this);
            if (dist < closestEnemy) {
                closestEnemy = dist;
                action.target = ent;
            }
        }
    }

    // dodge bullets
    
    if (closestBullet < 100) {
        var difX = (action.bullet.x - this.x) / closestBullet;
        var difY = (action.bullet.y - this.y) / closestBullet;
        this.velocity.x -= difX * acceleration / (closestBullet * closestBullet);
        this.velocity.y -= difY * acceleration / (closestBullet * closestBullet);
        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxSpeed) {
            var ratio = maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }
    }

    // move towards ammo if out

    else if (this.ammo == 0 && action.ammo != null) {
        var difX = (action.ammo.x - this.x) / closestAmmo;
        var difY = (action.ammo.y - this.y) / closestAmmo;
        this.velocity.x += difX * acceleration / (closestAmmo * closestAmmo);
        this.velocity.y += difY * acceleration / (closestAmmo * closestAmmo);
        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxSpeed) {
            var ratio = maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }
    }

    // move towards closest enemy 

    else if (this.spawner.enemiesLeft() > 1 && this.ammo > 1) {
        var difX = (action.target.x - this.x) / closestEnemy;
        var difY = (action.target.y - this.y) / closestEnemy;
        this.velocity.x += difX * acceleration / (closestEnemy * closestEnemy);
        this.velocity.y += difY * acceleration / (closestEnemy * closestEnemy);
        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxSpeed) {
            var ratio = maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }
    }

    

    if (action.target && this.ammo > 0) {
        action.shoot = true;
    }

    
    return action;
}

Agent.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;

    this.action = this.selectAction();

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
            if (ent.name === "Bullet") {
                this.spawner.enemyDied();
                this.removeFromWorld = true;
                ent.removeFromWorld = true;
            }
            else if (ent.name == "Ammo") {
                this.ammo += 3;
                ent.removeFromWorld = true;
            }
            else if (ent.name == "Agent") {
                var temp = { x: this.velocity.x, y: this.velocity.y };

                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x)/dist;
                var difY = (this.y - ent.y)/dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                
            }
            
            
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.name == "Bullet" && dist > this.radius + ent.radius && ent.shotBy != this) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }

    if (this.cooldown === 0 && this.action.shoot && this.ammo > 0) {
        this.cooldown = 1;
        this.ammo--;
        var target = this.action.target;
        var dir = direction(target, this);
        var bullet = new Bullet(this.game);
        bullet.shotBy = this;
        bullet.x = this.x + dir.x * (this.radius + bullet.radius + 20);
        bullet.y = this.y + dir.y * (this.radius + bullet.radius + 20);
        bullet.velocity.x = dir.x * bullet.maxSpeed;
        bullet.velocity.y = dir.y * bullet.maxSpeed;
        bullet.shot = true;
        this.game.addEntity(bullet);
    }
};

Agent.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = "White";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};