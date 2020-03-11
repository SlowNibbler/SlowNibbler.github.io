// James McHugh
// Updated for Assignment 3

window.onload = function () {
    var socket = io.connect("http://24.16.255.56:8888");
    var text = document.getElementById("text");
    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");

    socket.on("load", function (newData) {
        gameEngine.entities = [];
        var spawner = new Spawner(gameEngine);
        for (var i = 0; i < newData.data.length; i++) {
            var tempData = newData.data[i];
            var tempEnt;
            if (tempData.name == "Spawner") {
                var tempData = newData.data[i];
                spawner = new Spawner(gameEngine);
                spawner.ammoTimer = tempData.ammoTimer;
                spawner.shieldTimer = tempData.shieldTimer;
                spawner.agentsLeft = tempData.agentsLeft;
            }
            if (tempData.name == "Ammo") {
                tempEnt = new Ammo(gameEngine);
                tempEnt.x = tempData.x;
                tempEnt.y = tempData.y;
            }
            else if (tempData.name == "Shield") {
                tempEnt = new Shield(gameEngine);
                tempEnt.x = tempData.x;
                tempEnt.y = tempData.y;
            }
            else if (tempData.name == "Bullet") {
                tempEnt = new Bullet(gameEngine);
                tempEnt.x = tempData.x;
                tempEnt.y = tempData.y;
                tempEnt.direction = tempData.direction;
                tempEnt.velocity = tempData.velocity;
            }
            else if (tempData.name == "Agent") {
                tempEnt = new Agent(gameEngine, spawner, tempData.x, tempData.y);
                tempEnt.velocity = tempData.velocity;
                tempEnt.ammo = tempData.ammo;
                tempEnt.shield = tempData.shield;
                tempEnt.cooldown = tempData.cooldown;
            }
            if (tempEnt != null) {
                gameEngine.addEntity(tempEnt);
            }
        }
    });

    saveButton.onclick = function () {
        var saveData = getData(gameEngine);
        socket.emit("save", { studentname: "James McHugh", statename: "Fortnite2", data: saveData });
        console.log("save");
        text.innerHTML = "Saved."
    };

    loadButton.onclick = function () {
        socket.emit("load", { studentname: "James McHugh", statename: "Fortnite2" });
        console.log("load");
        text.innerHTML = "Loaded."
    };

    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    var spawner = new Spawner(gameEngine);
    var agent1 = new Agent(gameEngine, spawner, 10, 10);
    var agent2 = new Agent(gameEngine, spawner, 790, 10);
    var agent3 = new Agent(gameEngine, spawner, 10, 790);
    var agent4 = new Agent(gameEngine, spawner, 790, 790);

    gameEngine.addEntity(spawner);
    gameEngine.addEntity(agent1);
    gameEngine.addEntity(agent2);
    gameEngine.addEntity(agent3);
    gameEngine.addEntity(agent4);

    gameEngine.init(ctx);
    gameEngine.start();

    
};

function getData(game) {
    var data = [];
    for (var i = 0; i < game.entities.length; i++) {
        var tempData = {};
        var tempEnt = game.entities[i];
        if (tempEnt.name == "Spawner") {
            tempData.name = "Spawner";
            tempData.ammoTimer = tempEnt.ammoTimer;
            tempData.shieldTimer = tempEnt.shieldTimer;
            tempData.agentsLeft = tempEnt.agentsLeft;
        }
        else if (tempEnt.name == "Ammo") {
            tempData.name = "Ammo";
            tempData.x = tempEnt.x;
            tempData.y = tempEnt.y;
        }
        else if (tempEnt.name == "Shield") {
            tempData.name = "Shield";
            tempData.x = tempEnt.x;
            tempData.y = tempEnt.y;
        }
        else if (tempEnt.name == "Bullet") {
            tempData.name = "Bullet";
            tempData.x = tempEnt.x;
            tempData.y = tempEnt.y;
            tempData.velocity = tempEnt.velocity;
            tempData.direction = tempEnt.direction;
        }
        else if (tempEnt.name == "Agent") {
            tempData.name = "Agent";
            tempData.x = tempEnt.x;
            tempData.y = tempEnt.y;
            tempData.velocity = tempEnt.velocity;
            tempData.ammo = tempEnt.ammo;
            tempData.shield = tempEnt.shield;
            tempData.cooldown = tempEnt.cooldown;
        }
        data[i] = tempData;
    }
    console.log(data);
    return data;
}


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

ASSET_MANAGER.downloadAll(function () {});
