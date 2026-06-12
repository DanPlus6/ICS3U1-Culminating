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
let startX = 95;
let endX = 850;
let originalStartX = startX;
let originalEndX = endX
let redStart = 50;
let originalRedStart = redStart;
let redStartCollide = false;
let redEnd = 50;
let originalRedEnd = redEnd;
let redEndCollide = false;

//information about the mouse status
let mouseButton = false;
let mouseX;
let mouseY;

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
        redStartCollide = mouseCollision(startX, redStart);
    }
    else {
        redStartCollide = false;
    }
    if (redStartCollide){
        startX = mouseX;
        redStart = mouseY;
        draw();
    }
}

function checkMouseDown(mouseDownEvent){
    console.log('mouse clicked');
    mouseButton = true;
}

function checkMouseUp(mouseUpEvent){
    console.log('mouse released');
    mouseButton = false;
    redEndCollide = mouseCollision(endX, redEnd);
    if (!redEndCollide){
        redStartCollide = false;
        startX = originalStartX;
        redStart = originalRedStart;
        BRUSH.clearRect(0, 0, CANVAS.width, CANVAS.height);
        draw();
    }
    else {
        console.log('collide');
    }
}

function mouseCollision(objX, objY){
    if (mouseX > objX - circleRadius && mouseX < objX + circleRadius  && mouseY > objY - circleRadius && mouseY < objY + circleRadius){
        return true;
    }
}

function draw(){
    BRUSH.beginPath();
    BRUSH.arc(startX, redStart, circleRadius, 0, 2 * Math.PI);
    BRUSH.stroke();
    BRUSH.fillStyle = "red";
    BRUSH.fill();
    BRUSH.strokeStyle = "red";
    BRUSH.stroke();
    BRUSH.beginPath();
    BRUSH.arc(endX, redEnd, circleRadius, 0, 2 * Math.PI);
    BRUSH.stroke();
    BRUSH.fillStyle = "red";
    BRUSH.fill();
    BRUSH.strokeStyle = "red";
    BRUSH.stroke();
}

function start(){
    draw();
    addEventListeners();
}