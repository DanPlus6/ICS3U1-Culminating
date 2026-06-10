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
}

/**
 * 
 * @param {MouseEvent} mouseEvent information about the mouse position
 */
function checkMouseMove(mouseEvent){
    console.log(`Mouse X: ${mouseEvent.clientX}, Mouse Y: ${mouseEvent.clientY}`);
}

function draw(){
    BRUSH.beginPath();
    BRUSH.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
    BRUSH.stroke();
}