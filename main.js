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
    this.left = false;
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
        if(index === 20 && this.left){
            index -= 2;
        }
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

function Background(game) {
    Entity.call(this, game, 0, 200);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "Green";
    ctx.fillRect(0,275,350,200);
    ctx.fillRect(450,275,350,200);
    Entity.prototype.draw.call(this);
}

function Braid(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/BraidDude.png"), 0, 0,  74.2857, 86.75, 0.04, 27, true, false);
    this.Leftanimation = new Animation(ASSET_MANAGER.getAsset("./img/LeftBraidDude.png"), 0, 0, 74.2857, 86.75, 0.06, 27, true, true);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/BraidJump2.png"), 0, 0, 123, 163, 0.04, 9, false, false);
    this.LeftjumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/BraidJump1.png"), 0, 0, 125.3333333, 163, 0.04, 9, false, true);
    this.radius = 100;
    this.ground = 200;
    Entity.call(this, game, 0, 200);
}

Braid.prototype = new Entity();
Braid.prototype.constructor = Braid;

Braid.prototype.update = function () {
    if ((this.x === 300 && !this.left) || (this.x === 400 && this.left)) this.jumping = true;

    if (this.jumping ) {
        if (this.jumpAnimation.isDone() && !this.left) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        } else if(this.LeftjumpAnimation.isDone() && this.left) {
            this.LeftjumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }

        if(!this.left) {
            var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
            var totalHeight = 100;
        } else {
            var jumpDistance = this.LeftjumpAnimation.elapsedTime / this.LeftjumpAnimation.totalTime;
            var totalHeight = 100;
        }

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    Entity.prototype.update.call(this);
}

Braid.prototype.draw = function (ctx) {
    if (this.jumping && !this.left) {
        this.x = this.x +5;
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34, .5);
    }
    else if(this.jumping && this.left) {
        this.x = this.x -5;
        this.LeftjumpAnimation.drawFrame(this.game.clockTick, ctx, this.x - 17, this.y - 34, .5);
    } else {
        if (this.left) {
            this.x = this.x -5;
            if (this.x < -75) {
                this.left = false;
                //this.x = -75;
            }
            this.Leftanimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        } else {
            this.x = this.x + 5;
            if (this.x > 800) {
                this.left = true;
                //this.x = -75;
            }
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/BraidDude.png");
ASSET_MANAGER.queueDownload("./img/LeftBraidDude.png");
ASSET_MANAGER.queueDownload("./img/BraidJump2.png");
ASSET_MANAGER.queueDownload("./img/BraidJump1.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var braid = new Braid(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(braid);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
