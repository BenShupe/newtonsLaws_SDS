let canvas = document.querySelector("#screen");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mode = 0;
let dt = 0;
let timeLast = 0;

function calculate_dt(elapsed) {
    dt = elapsed - timeLast;
    timeLast = elapsed;
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color, size) {
    ctx.fillStyle = color;
    ctx.font = size + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

function drawLine(x1, y1, x2, y2, color = "white", width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

class Ball {
    constructor(x = canvas.width / 2, y = canvas.height / 2, r = 30, color = "white", mass = 1) {
        this.x_initial = x;
        this.y_initial = y;
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.mass = mass;
        this.velX = 0;
        this.velY = 0;
    }

    render() {
        drawCircle(this.x, this.y, this.r, this.color);
	    drawText(this.mass.toString(), this.x, this.y, "black", this.r/2)
    }

    move() {
        this.x += this.velX;
        this.y += this.velY;
    }

    applyForce(forceX, forceY) {
        let fx = forceX / this.mass;
        let fy = forceY / this.mass;
        this.velX += fx;
        this.velY += fy;
    }

    wallCollision() {
        if (this.x + this.r >= canvas.width) {
            this.x = canvas.width - this.r;
            this.velX *= -1;
        } else if (this.y + this.r >= canvas.height) {
            this.y = canvas.height - this.r;
            this.velY *= -1;
        } else if (this.x - this.r <= 0) {
            this.x = this.r;
            this.velX *= -1;
        } else if (this.y - this.r <= 0) {
            this.y = this.r;
            this.velY *= -1;
        }
    }
}

let b1 = new Ball(canvas.width - 200);
let b2 = new Ball(200);

b2.color = "white";

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", e => {
    mouseX = e.clientX
    mouseY = e.clientY;
});

document.addEventListener("click", e => {
    let f = 2;
    b1.applyForce(-1*b1.mass*f, 0);
    b2.applyForce(b2.mass*f, 0);
});
let b2resize = false;
document.addEventListener("keydown", e => {
    switch (e.key) {
        case "r":
            b1.x = b1.x_initial;
            b1.y = b1.y_initial;
            b2.x = b2.x_initial;
            b2.y = b2.y_initial;
            b1.velX = 0;
            b1.velY = 0;
            b2.velX = 0;
            b2.velY = 0;
            break;
        case " ":
            b2resize = !b2resize;
            pause = !pause;
    }
});
let pause = false;
function collide() {
    let dx = b1.x - b2.x;
    if (Math.abs(dx) >= (b1.r + b2.r)) {
        return; // No collision if distance is greater than sum of radii
    }
    let move = b1.r + b2.r - dx;
    b1.x+=move*0.5;
    b2.x-=move*0.5;

    let b1v = b1.velX;
    let b2v = b2.velX;
    console.log("b1 before" + b1.velX);
    console.log("b2 before" + b2.velX);
    b2.applyForce(b1v / b1.mass, 0);
    b1.applyForce(b2v / b2.mass, 0);
    b2.applyForce(b1v * b1.mass, 0);
    b1.applyForce(b2v * b2.mass, 0);
    console.log("b1 after" + b1.velX);
    console.log("b2 after" + b2.velX);
}
function resize() {
    b2.r = Math.sqrt((mouseX-b2.x)*(mouseX-b2.x) + (mouseY-b2.y)*(mouseY-b2.y));
    b2.mass = Math.floor(b2.r/30);
    console.log("mass set " + b2.mass);
}

function loop(elapsed) {
    drawRect(0, 0, canvas.width, canvas.height, "black");
    if (b2resize) resize();
    b1.render();
    b2.render();
    drawText("Simulation 2", canvas.width / 2, 50, "white", 50);
    if (!pause) {
        collide();
        b1.move();
        b2.move();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
