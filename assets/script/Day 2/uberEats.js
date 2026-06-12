/**
 * By Ian Choy
 */

'use strict';

//get the Canvas from the HTML
const CANVAS = document.getElementById('game-canvas');

//get the Canvas height and width
CANVAS.width = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;

//get the graphics content from the Canvas for drawing directions
const BRUSH = CANVAS.getContext('2d');

//get the button input information
let inputRadius = 40;
let topButtonInput = [7, 8, 9];
let midButtonInput = [4, 5, 6];
let botButtonInput = [1, 2, 3];
let lastButtonInput = 0;
let topButtonY = 200;
let midButtonY = 350;
let botButtonY = 500;
let lastButtonY = 650;
let leftButtonX = (CANVAS.width/3) + 50;
let midButtonX = CANVAS.width/2;
let rightButtonX = ((CANVAS.width/3)*2) - 50;

function drawButtons(){
    BRUSH.beginPath();
    BRUSH.arc(midButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(leftButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(rightButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(leftButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(midButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(rightButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(leftButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(midButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(rightButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(leftButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(midButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(rightButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = "grey";
    BRUSH.stroke();
    BRUSH.fillStyle = "grey";
    BRUSH.fill();
    BRUSH.font = "40px Arial";
    BRUSH.fillStyle = "black";
    BRUSH.fillText("0",midButtonX - 10,lastButtonY + 15);
    BRUSH.fillText("1", leftButtonX - 10, botButtonY + 15);
    BRUSH.fillText("2", midButtonX - 10, botButtonY + 15);
    BRUSH.fillText("3", rightButtonX - 10, botButtonY + 15);
    BRUSH.fillText("4", leftButtonX - 10, midButtonY + 15);
    BRUSH.fillText("5", midButtonX - 10, midButtonY + 15);
    BRUSH.fillText("6", rightButtonX - 10, midButtonY + 15);
    BRUSH.fillText("7", leftButtonX - 10, topButtonY + 15);
    BRUSH.fillText("8", midButtonX - 10, topButtonY + 15);
    BRUSH.fillText("9", rightButtonX - 10, topButtonY + 15);
    BRUSH.fillText("✓", rightButtonX - 10, lastButtonY + 15);
    BRUSH.fillText("✗", leftButtonX - 10, lastButtonY + 15);
}

function start(){
    drawButtons();
}

window.addEventListener('load', start);
