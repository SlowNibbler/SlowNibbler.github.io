// James McHugh

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// some code copied from AI zombies and Tag
function direction(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) return {x: dx / dist, y: dy / dist}; else return {x: 0, y: 0};
}

function Bullet(game) {
    this.direction;
    this.shotBy;
    this.radius = 4;
    this.name = "Bullet";
    this.color = "Gray";
    this.maxSpeed = 500;
    this.shot = false;
    this.velocity = { x: 0, y: 0 };
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
};

Bullet.prototype = new Entity();
Bullet.prototype.constructor = Bullet;

Bullet.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Bullet.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Bullet.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Bullet.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Bullet.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Bullet.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.removeFromWorld = true;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.removeFromWorld = true;
    }

};

Bullet.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};


// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    var spawner = new Spawner(gameEngine);
    gameEngine.addEntity(spawner);
    
    gameEngine.init(ctx);
    gameEngine.start();
});
