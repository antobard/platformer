// From Chris Courses https://www.youtube.com/watch?v=4q2vvZn5aoo
const refCanvas = document.querySelector("canvas");
const ctx = refCanvas.getContext("2d");

refCanvas.width = 1024;
refCanvas.height = 576;

const gravity = 1.5;

class Player {
    constructor() {
        this.speed = 20;
        this.isJumping = false;
        this.position = {
            x: 100,
            y: 100
        };

        this.velocity = {
            x: 0,
            y: 0
        };

        this.width = 66;
        this.height = 150;

        this.image = createImage(images.spriteStandRight);
        this.frames = 0;
        this.sprites = {
            stand: {
                cropWidth: 177,
                width: 66,
                left: createImage(images.spriteStandLeft),
                right: createImage(images.spriteStandRight)
            },
            run: {
                cropWidth: 341,
                width: 127.875,
                left: createImage(images.spriteRunLeft),
                right: createImage(images.spriteRunRight)
            }
        }
        this.currentSprite = this.sprites.stand.right;
        this.currentCropWidth = this.sprites.stand.cropWidth;
    }

    draw() {
        if (this.image) {
            ctx.strokeStyle = "red"
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
            ctx.drawImage(
                this.currentSprite,
                this.currentCropWidth * this.frames,
                0,
                this.currentCropWidth,
                400,
                this.position.x,
                this.position.y,
                this.width,
                this.height);
        } else {
            ctx.fillStyle = "green";
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        this.frames++;
        if (this.frames > 59 
                && (this.currentSprite === this.sprites.stand.right ||
                    this.currentSprite === this.sprites.stand.left))
            { this.frames = 0 }
        else if (this.frames > 29 
                && (this.currentSprite === this.sprites.run.right ||
                    this.currentSprite === this.sprites.run.left))
            { this.frames = 0 }
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y <= refCanvas.height) {
            this.velocity.y += gravity;
        }
        
    }
}

class Platform  {
    static count = 0;
    constructor({x, y}, image) {
        this.instanceId = ++Platform.count;
        this.position = {
            x,
            y,
        };
        image.onload = () => {
            this.image = image;
            this.width = image.width;
            this.height = image.height;
        }        
    }
    draw() {
        if (this.image) {
            ctx.drawImage(this.image, this.position.x, this.position.y);
        }
    }
}

class GenericObject  {
    constructor({x, y}, image) {
        this.position = {
            x,
            y,
        };
        image.onload = () => {
            this.image = image;
            this.width = image.width;
            this.height = image.height;
        }        
    }
    draw() {
        if (this.image) {
            ctx.drawImage(this.image, this.position.x, this.position.y);
        }
    }
}


function createImage(imageSrc) {
    const image = new Image();
    image.src = imageSrc;
    return image
}

const images = {
    platform: "./img/platform.png",
    background: "./img/background.png",
    hills: "./img/hills.png",
    platformSmallTall: "./img/platformSmallTall.png",    

    spriteRunLeft: "./img/spriteRunLeft.png",
    spriteRunRight: "./img/spriteRunRight.png",
    spriteStandLeft: "./img/spriteStandLeft.png",
    spriteStandRight: "./img/spriteStandRight.png",
}

let platformImage = createImage(images.platform); // TODO: unused because of the loading of images that mess up the width


let player = new Player();
let platforms = [];
let genericObjects = [];

let lastKey;
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
}

let scrollOffset = 0;

function init() {
    platformImage = createImage(images.platform); // TODO: unused because of the loading of images that mess up the width
    platformSmallTallImage = createImage(images.platformSmallTall);


    player = new Player();
    platforms = [
        new Platform({x: 580 * 4 + 250 - 2, y: 370}, createImage(images.platformSmallTall)),
        new Platform({x: 580 * 5, y: 270}, createImage(images.platformSmallTall)),
        new Platform({x: 0, y: 470}, createImage(images.platform)), 
        new Platform({x: 580 * 1 - 2, y: 470}, createImage(images.platform)),
        new Platform({x: 580 * 2 + 100, y: 470}, createImage(images.platform)),
        new Platform({x: 580 * 3 + 300, y: 470}, createImage(images.platform)),
        new Platform({x: 580 * 4 + 300 - 2, y: 470}, createImage(images.platform)),
        new Platform({x: 580 * 6 + 400 - 2, y: 470}, createImage(images.platform)),
    ];
    genericObjects = [
        new GenericObject({x: -1, y: -1}, createImage(images.background)),
        new GenericObject({x: -1, y: -1}, createImage(images.hills))
    ];

    scrollOffset = 0;
}

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, refCanvas.width, refCanvas.height);

    genericObjects.forEach(genericObject => {
        genericObject.draw();
    })

    platforms.forEach(platform => {
        platform.draw();
    });
    player.update();

    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = player.speed;
    } else if ((keys.left.pressed && player.position.x > 100) ||
            (keys.left.pressed && scrollOffset === 0 &&
            player.position.x > 0)) {
        player.velocity.x = -player.speed;
    } else {
        player.velocity.x = 0;

        if (keys.right.pressed) {
            scrollOffset += player.speed;
            platforms.forEach(platform => {
                platform.position.x -= player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x -= player.speed * .66;
            })

        } else if (keys.left.pressed && scrollOffset > 0) {
            scrollOffset -= player.speed;
            platforms.forEach(platform => {
                platform.position.x += player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x += player.speed * .66;
            })
        }
    }

    // Platform collision detetction 
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y && 
                player.position.y + player.height + player.velocity.y >= platform.position.y &&
                player.position.x + player.width >= platform.position.x &&
                player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0;
            player.isJumping = false;
        }
    });

    // Sprite switching
    if (keys.right.pressed &&
        lastKey === "ArrowRight" &&
            player.currentSprite !== player.sprites.run.right) {
        player.frames = 1;
        player.currentSprite = player.sprites.run.right;
        player.currentCropWidth = player.sprites.run.cropWidth;
        player.width = player.sprites.run.width;
        
    } else if (keys.left.pressed &&
        lastKey === "ArrowLeft" &&
            player.currentSprite !== player.sprites.run.left) {
        player.currentSprite = player.sprites.run.left;
        player.currentCropWidth = player.sprites.run.cropWidth;
        player.width = player.sprites.run.width;

    } else if (!keys.right.pressed &&
        lastKey === "ArrowRight" &&
            player.currentSprite !== player.sprites.stand.right) {
        player.currentSprite = player.sprites.stand.right;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;

    } else if (!keys.left.pressed &&
        lastKey === "ArrowLeft" &&
            player.currentSprite !== player.sprites.stand.left) {
        player.currentSprite = player.sprites.stand.left;
        player.currentCropWidth = player.sprites.stand.cropWidth;
        player.width = player.sprites.stand.width;
    }

    // Win condition
    if (scrollOffset > 580 * 6 + 400 - 2) {
        console.log("You Win !")
    }

    // Lose condition
    if (player.position.y > refCanvas.height) {
        init();
    }
}

init();
animate();

addEventListener("keydown", (e) => {
    switch (e.code) {
        case "ArrowLeft":
            // left
            keys.left.pressed = true;
            lastKey = e.code;
            break

        case "ArrowDown":
            // down
            break

        case "ArrowRight":
            // right
            keys.right.pressed = true;
            lastKey = e.code;
            break

        case "ArrowUp":
            // up
            if (!player.isJumping) {
                player.velocity.y -= 25;
                player.isJumping = true;
            }
            break
    }
});

addEventListener("keyup", (e) => {
    switch (e.code) {
        case "ArrowLeft":
            // left
            keys.left.pressed = false;
            break

        case "ArrowDown":
            // down
            break

        case "ArrowRight":
            // right
            keys.right.pressed = false;
            break

        case "ArrowUp":
            // up
            break
    }
});