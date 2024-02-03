let canvas = document.querySelector("#screen");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mode = 0;
let dt = 0;
let timeLast = 0;

function calculate_dt(elapsed){
    dt = elapsed - timeLast;
    timeLast = elapsed;
}

function drawRect (x, y, w, h, color, fill=true, width=1) {
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
    ctx.lineWidth = width
	ctx.beginPath();
	ctx.rect(x, y, w, h);
    if(fill) ctx.fill();
    else ctx.stroke();
}

function drawCircle (x, y, r, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(x,y,r,0,Math.PI*4);
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

function drawLine(x1, y1, x2, y2, color="white", width=1){
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2, y2)
    ctx.stroke();
}

class Ball {
    constructor(x=canvas.width/2, y=canvas.height/2, r=30, color="white", mass=1) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.mass = r/30;
        this.velX = 0;
        this.velY = 0;
    }

    render(){
        drawCircle(this.x, this.y, this.r, this.color);
    }

    move(){
        this.x += this.velX;
        this.y += this.velY;
    }

    applyForce(forceX, forceY){
        let fx = forceX / this.mass;
        let fy = forceY / this.mass;
        this.velX += fx*dt;
        this.velY += fy*dt;
    }

    wallCollision(){
        if(this.x+this.r>=canvas.width){
            this.x = canvas.width-this.r;
            this.velX*=-1;
        }
        else if(this.y+this.r>=canvas.height){
            this.y = canvas.height-this.r;
            this.velY*=-1;
        }
        else if(this.x-this.r<=0){
            this.x = this.r;
            this.velX*=-1;
        }
        else if(this.y-this.r<=0){
            this.y = this.r;
            this.velY*=-1;
        }
    }
}
let b1 = new Ball();
let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", e=>{
   mouseX = e.clientX;
   mouseY = e.clientY;
});
document.addEventListener("click", e=>{
    if (mode != 1) return;
    let distX = b1.x-mouseX;
    let distY = b1.y-mouseY
    let forceX = distX/1000;
    let forceY = distY/1000;
    b1.applyForce(forceX, forceY);
    mode = 0;
});
document.addEventListener("keydown", e=>{
    switch (e.key) {
        case "r":
            b1.x=canvas.width/2;
            b1.y=canvas.height/2;
            b1.velX=0;
            b1.velY=0;
            ob = null;
            break;
        case "`":
            mode=0;
            break;
        case "1":
            mode = 1;
            break;
        case "2":
            mode = 2;
            break;
        case "3":
            mode = 3;
            ob = null;
            anchorX = mouseX;
            anchorY = mouseY;
            break;
        case "4":
            if (mode != 3) break;
            mode = 0;
            ob = new Objstruction(anchorX, anchorY, mouseX-anchorX, mouseY-anchorY);
            break;
    }
});


class Objstruction {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = "white";
    }
    render(){
        drawRect(this.x, this.y, this.w, this.h, this.color, false, 4);
    }
    collide(){
        // temporary variables to set edges for testing
        let testX = b1.x;
        let testY = b1.y;

        // which edge is closest?
        if (b1.x < this.x)             testX = this.x;      // test left edge
        else if (b1.x > this.x+this.w) testX = this.x+this.w;   // right edge
        if (b1.y < this.y)             testY = this.y;      // top edge
        else if (b1.y > this.y+this.h) testY = this.y+this.h;   // bottom edge

        // get distance from closest edges
        let distX = b1.x-testX;
        let distY = b1.y-testY;
        let distance = Math.sqrt( (distX*distX) + (distY*distY) );

        // if the distance is less than the radius, collision!
        if (distance > b1.r) return;

        // vert collision
        if(distX === 0) b1.velY *= -1;
        // horizontal collision
        if(distY === 0) b1.velX *= -1;

        if(distX !== 0 && distY !== 0) {
            b1.velY *= -1;
            b1.velX *= -1;
        }
    }
}
let anchorX;
let anchorY;
let ob = null;
function modes(){
    switch (mode) {
        case 1:
            drawLine(b1.x, b1.y, mouseX, mouseY, "#fff", 0.5);
            drawLine(b1.x, b1.y, b1.x+b1.x-mouseX, b1.y+b1.y-mouseY, "#fff", 2);
            let distX = (b1.x-mouseX);
            let distY = (b1.y-mouseY);
            let f = Math.sqrt(distX*distX+distY*distY)/10;
            let txt = Math.floor(f).toString()+" N";
            let txt_width = ctx.measureText(txt).width;
            drawText(txt, b1.x, b1.y-b1.r-10, "white", 25);
            break;
        case 2:
            b1.r = Math.abs(Math.sqrt( (b1.x-mouseX)*(b1.x-mouseX) + (b1.y-mouseY)*(b1.y-mouseY)));
            b1.mass = b1.r/30;
            drawText(Math.floor(b1.mass).toString(), b1.x, b1.y, "black", b1.mass*10);
            break;
        case 3:
            drawRect(anchorX, anchorY, mouseX-anchorX, mouseY-anchorY, "white", false, 1);
            break;
    }
}

function loop(elapsed){ //elapsed in ms
    drawRect(0, 0, canvas.width, canvas.height, "black");
    ob?.render();
    ob?.collide();
    b1.render();
    drawText("Simulation 1", canvas.width/2, 50, "white", 50);
    modes();
    // b1.wallCollision();
    b1.move();
    calculate_dt(elapsed);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop)