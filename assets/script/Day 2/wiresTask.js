/**
 * By Ian Choy
 */

'use strict';

//get the Canvas from the HTML
const CANVAS = document.getElementById('game-canvas');

//get the graphics content from the Canvas for drawing directions
const BRUSH = CANVAS.getContext('2d');

//information about the circle
let circleX = 95;
let circleY = 50;
let circleRadius = 40;

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
}

function checkMouseDown(mouseDownEvent){
    console.log('mouse clicked');
}

function checkMouseUp(mouseUpEvent){
    console.log('mouse released');
}

function draw(){
    BRUSH.beginPath();
    BRUSH.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
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