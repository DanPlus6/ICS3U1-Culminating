/**
 * By Ian Choy
 */

'use strict';

//get the Canvas from the HTML
const CANVAS = document.getElementById('game-canvas');

CANVAS.width = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;

//get the graphics content from the Canvas for drawing directions
const BRUSH = CANVAS.getContext('2d');

//information about the circle
let circleRadius = 40;
let startX = CANVAS.width / 3;
let endX = (CANVAS.width / 3) * 2;
let rgbyStarts = [50, 200, 350, 500];
let rgbyEnds = [50, 200, 350, 500];
let actualStarts = [0, 0, 0, 0];
let actualEnds = [0, 0, 0, 0];

//information about the red pair of wires
let redStartY;
let redStartX = startX;
let originalRedStartY;
let redStartCollide = false;
let redEnd;
let redEndCollide = false;
let redCompleted = false;

//information about the yellow pair of wires
let yellowStartY;
let yellowStartX = startX;
let originalYellowStartY;
let yellowStartCollide = false;
let yellowEnd;
let yellowEndCollide = false;
let yellowCompleted = false;

//information about the blue pair of wires
let blueStartY;
let blueStartX = startX;
let originalBlueStartY;
let blueStartCollide = false;
let blueEnd;
let blueEndCollide = false;
let blueCompleted = false;

//information about the green pair of wires
let greenStartY;
let greenStartX = startX;
let originalGreenStartY;
let greenStartCollide = false;
let greenEnd;
let greenEndCollide = false;
let greenCompleted = false;

//information about the mouse status
let mouseButton = false;
let mouseX;
let mouseY;

//amount of collisions from start to the end
let collisionAmount = 0;

//amount of lines made
let linesAmount = 0;

let collided = false;

/**
 * Adds all event listeners to the game
 */
function addEventListeners(){
    document.body.addEventListener('mousemove', checkMouseMove);
    document.body.addEventListener('mousedown', checkMouseDown);
    document.body.addEventListener('mouseup', checkMouseUp);
}

/**
 * 
 * @param {MouseEvent} mouseMoveEvent information about the mouse position
 */
function checkMouseMove(mouseMoveEvent){
    console.log(`Mouse X: ${mouseMoveEvent.clientX}, Mouse Y: ${mouseMoveEvent.clientY}`);
    mouseX = mouseMoveEvent.clientX;
    mouseY = mouseMoveEvent.clientY;
    if (mouseButton){
        if (!collided){
            redStartCollide = mouseCollision(redStartX, redStartY);
            yellowStartCollide = mouseCollision(yellowStartX, yellowStartY);
            blueStartCollide = mouseCollision(blueStartX, blueStartY);
            greenStartCollide = mouseCollision(greenStartX. greenStartY);
        }
    }
    else {
        redStartCollide = false;
        yellowStartCollide = false;
        blueStartCollide = false;
        greenStartCollide = false;
    }
    if (redStartCollide){
        redStartX = mouseX;
        redStartY = mouseY;
        draw();
    }
    if (yellowStartCollide){
        yellowStartX = mouseX;
        yellowStartY = mouseY;
        draw();
    }
    if (blueStartCollide){
        blueStartX = mouseX;
        blueStartY = mouseY;
        draw();
    }
    if (greenStartCollide){
        greenStartX = mouseX;
        greenStartY = mouseY;
        draw();
    }
}

function checkMouseDown(mouseDownEvent){
    console.log('mouse clicked');
    mouseButton = true;
    redStartCollide = mouseCollision(redStartX, redStartY);
    yellowStartCollide = mouseCollision(yellowStartX, yellowStartY);
    blueStartCollide = mouseCollision(blueStartX, blueStartY);
    greenStartCollide = mouseCollision(greenStartX, greenStartY);
    if (redStartCollide || yellowStartCollide || blueStartCollide || greenStartCollide){
        linesAmount++;
    }   
}

function checkMouseUp(mouseUpEvent){
    console.log('mouse released');
    mouseButton = false;
    if (!redCompleted){
        redEndCollide = mouseCollision(endX, redEnd);
        if (redEndCollide && redStartCollide){
            collisionAmount++;
        }
    }
    if (!yellowCompleted){
        yellowEndCollide = mouseCollision(endX, yellowEnd);
        if (yellowEndCollide && yellowStartCollide){
            collisionAmount++;
        }
    }
    if (!blueCompleted){
        blueEndCollide = mouseCollision(endX, blueEnd);
        if (blueEndCollide && blueStartCollide){
            collisionAmount++;
        }
    }
    if (!greenCompleted){
        greenEndCollide = mouseCollision(endX, greenEnd);
        if (greenEndCollide && greenStartCollide){
            collisionAmount++;
        }
    }
    if (linesAmount > collisionAmount){
        linesAmount = 0;
        collisionAmount = 0;

        redCompleted = false;
        redStartCollide = false;
        redEndCollide = false;
        redStartX = startX;
        redStartY = originalRedStartY;
        
        yellowCompleted = false;
        yellowStartCollide = false;
        yellowEndCollide = false;
        yellowStartY = originalYellowStartY;
        yellowStartX = startX;

        blueCompleted = false;
        blueStartCollide = false;
        blueEndCollide = false;
        blueStartY = originalBlueStartY;
        blueStartX = startX;

        greenCompleted = false;
        greenStartCollide = false;
        greenEndCollide = false;
        greenStartY = originalGreenStartY;
        greenStartX = startX;

        BRUSH.clearRect(0, 0, CANVAS.width, CANVAS.height);
        draw();
    }
    else {
        if (redEndCollide){
            redCompleted = true;
        }
        if (yellowEndCollide){
            yellowCompleted = true;
        }
        if (blueEndCollide){
            blueCompleted = true;
        }
        if (greenEndCollide){
            greenCompleted = true;
        }
    }
}

function mouseCollision(rgbX, rgbY){
    if (mouseX > rgbX - circleRadius && mouseX < rgbX + circleRadius  && mouseY > rgbY - circleRadius && mouseY < rgbY + circleRadius){
        collided = true;
        return true;
    }
    else {
        return false;
    }
}

function draw(){
    BRUSH.beginPath();
    BRUSH.arc(redStartX, redStartY, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = "red";
    BRUSH.stroke();
    BRUSH.fillStyle = "red";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(endX, redEnd, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = "red";
    BRUSH.stroke();
    BRUSH.fillStyle = "red";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(yellowStartX, yellowStartY, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = "yellow";
    BRUSH.stroke();
    BRUSH.fillStyle = "yellow";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(endX, yellowEnd, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = "yellow";
    BRUSH.stroke();
    BRUSH.fillStyle = "yellow";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(blueStartX, blueStartY, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = "blue";
    BRUSH.stroke();
    BRUSH.fillStyle = "blue";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(endX, blueEnd, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = "blue";
    BRUSH.stroke();
    BRUSH.fillStyle = "blue";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(greenStartX, greenStartY, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = "green";
    BRUSH.stroke();
    BRUSH.fillStyle = "green";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(endX, greenEnd, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = "green";
    BRUSH.stroke();
    BRUSH.fillStyle = "green";
    BRUSH.fill();
}

function randomizeStarts(){
    let pos;
    for (let i = 0; i < actualStarts.length; i++){
        pos = Math.floor(Math.random() * (4));
        while (rgbyStarts[pos] == 0){
            pos = Math.floor(Math.random() * (4));
        }
        actualStarts[i] = rgbyStarts[pos];
        rgbyStarts[pos] = 0;
    }
    redStartY = actualStarts[0];
    greenStartY = actualStarts[1];
    blueStartY = actualStarts[2];
    yellowStartY = actualStarts[3];
    originalRedStartY = redStartY;
    originalGreenStartY = greenStartY;
    originalBlueStartY = blueStartY;
    originalYellowStartY = yellowStartY;
}

function randomizeEnds(){
    let pos;
    for (let i = 0; i < actualEnds.length; i++){
        pos = Math.floor(Math.random() * (4));
        while (rgbyEnds[pos] == 0){
            pos = Math.floor(Math.random() * (4));
        }
        actualEnds[i] = rgbyEnds[pos];
        rgbyEnds[pos] = 0;
    }
    redEnd = actualEnds[0];
    greenEnd = actualEnds[1];
    blueEnd = actualEnds[2];
    yellowEnd = actualEnds[3];
}

function start(){
    randomizeStarts();
    randomizeEnds();
    draw();
    addEventListeners();
}