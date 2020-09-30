function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Guy(game) {
    this.idleAnim = new Animation(ASSET_MANAGER.getAsset("./img/sheet.png"), 0, 0, 800, 450, 0.2, 3, true, false);
    this.lightAnim = new Animation(ASSET_MANAGER.getAsset("./img/sheet.png"), 2400, 0, 800, 450, 0.2, 8, false, false);
    this.blinds1Anim = new Animation(ASSET_MANAGER.getAsset("./img/sheet.png"), 0, 450, 800, 450, 0.2, 16, false, false);
    this.blinds2Anim = new Animation(ASSET_MANAGER.getAsset("./img/sheet.png"), 0, 900, 800, 450, 0.2, 16, false, false);
    this.blinds3Anim = new Animation(ASSET_MANAGER.getAsset("./img/sheet.png"), 0, 1350, 800, 450, 0.2, 16, false, false);
    this.blinds4Anim = new Animation(ASSET_MANAGER.getAsset("./img/sheet.png"), 0, 1800, 800, 450, 0.2, 16, false, false);
    this.blinds1 = false;
    this.blinds2 = false;
    this.blinds3 = false;
    this.blinds4 = false;
    this.light = false;
    this.isDark = false;
    this.timer = 0;
    Entity.call(this, game, 0, 0);
}

Guy.prototype = new Entity();
Guy.prototype.constructor = Guy;

Guy.prototype.update = function () {
    
    if (this.isDark) {
        document.body.style.background = "DarkSlateGray"; 
    }
    else {
        document.body.style.background = "white"; 
    }

    

    if (this.game.space) {
        var tempBlinds = Math.floor(Math.random() * Math.floor(4))
        if (tempBlinds == 0) {
            this.blinds1 = true;
        }
        if (tempBlinds == 1) {
            this.blinds2 = true;
        }
        if (tempBlinds == 2) {
            this.blinds3 = true;
        }
        if (tempBlinds == 3) {
            this.blinds4 = true;
        }
    }
    
    if (this.game.shift) {
        this.timer ++;
        if (this.timer == 50) {
            this.isDark = !this.isDark;
        }
        this.light = true;
    }

    if (this.blinds1Anim.isDone()) {
        this.blinds1 = false
        this.blinds1Anim.elapsedTime = 0;
    }
    if (this.blinds2Anim.isDone()) {
        this.blinds2 = false
        this.blinds2Anim.elapsedTime = 0;
    }
    if (this.blinds3Anim.isDone()) {
        this.blinds3 = false
        this.blinds3Anim.elapsedTime = 0;
    }
    if (this.blinds4Anim.isDone()) {
        this.blinds4 = false
        this.blinds4Anim.elapsedTime = 0;
    }
    if (this.lightAnim.isDone()) {
        this.timer = 0;
        this.light = false
        this.game.shift = false;
        this.lightAnim.elapsedTime = 0;
    }

    Entity.prototype.update.call(this);
}

Guy.prototype.draw = function (ctx) {
    var disp = 0;
    if (this.blinds1) {
        this.blinds1Anim.drawFrame(this.game.clockTick, ctx, this.x+disp, this.y, this.rotation);
    }
    else if (this.blinds2) {
        this.blinds2Anim.drawFrame(this.game.clockTick, ctx, this.x+disp, this.y, this.rotation);
    }
    else if (this.blinds3) {
        this.blinds3Anim.drawFrame(this.game.clockTick, ctx, this.x+disp, this.y, this.rotation);
    }
    else if (this.blinds4) {
        this.blinds4Anim.drawFrame(this.game.clockTick, ctx, this.x+disp, this.y, this.rotation);
    }
    else if (this.light) {
        this.lightAnim.drawFrame(this.game.clockTick, ctx, this.x+disp, this.y, this.rotation);
    }
    else {
        this.idleAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
    }

    Entity.prototype.draw.call(this);
}


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/sheet.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('world');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var guy = new Guy(gameEngine);

    gameEngine.addEntity(guy);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
