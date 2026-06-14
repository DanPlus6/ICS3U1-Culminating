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

//get the collision from all the buttons
let collision0 = false;
let collision1 = false;
let collision2 = false;
let collision3 = false;
let collision4 = false;
let collision5 = false;
let collision6 = false;
let collision7 = false;
let collision8 = false;
let collision9 = false;
let collisionReset = false;
let collisionVerify = false;

//get te information about the mouse status
let cursorX;
let cursorY;
let mouseClicked = false;

//get the element that was pressed
let phoneNumbers;

//stores the correct phone numbers to call
let uberNumber =  6474356685;
let secretNumber = 4168508495;

//stores the different ending activations
let normalEnding = false;
let secretEnding = true;

function addEventListeners(){
    document.body.addEventListener('mousemove', trackMouseMove);
    document.body.addEventListener('mousedown', checkClick);
    document.body.addEventListener('mouseup', checkRelease);
}

function buttonsCollide(buttonX, buttonY){
    if (cursorX > buttonX - inputRadius && cursorX < buttonX + inputRadius && cursorY > buttonY - inputRadius && cursorY < buttonY + inputRadius){
        return true
    }
    else {
        return false;
    }
}

function checkClick(mouseDownEvent){
    mouseClicked = true;
    collision0 = buttonsCollide(midButtonX, lastButtonY);
    collision1 = buttonsCollide(leftButtonX, botButtonY);
    collision2 = buttonsCollide(midButtonX, botButtonY);
    collision3 = buttonsCollide(rightButtonX, botButtonY);
    collision4 = buttonsCollide(leftButtonX, midButtonY);
    collision5 = buttonsCollide(midButtonX, midButtonY);
    collision6 = buttonsCollide(rightButtonX, midButtonY);
    collision7 = buttonsCollide(leftButtonX, topButtonY);
    collision8 = buttonsCollide(midButtonX, topButtonY);
    collision9 = buttonsCollide(rightButtonX, topButtonY);
    collisionReset = buttonsCollide(leftButtonX, lastButtonY);
    collisionVerify = buttonsCollide(rightButtonX, lastButtonY);
    if (collision0){
        BRUSH.beginPath();
        BRUSH.arc(midButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(0);
    }
    else if (collisionReset){
        BRUSH.beginPath();
        BRUSH.arc(leftButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers = [];
    }
    else if (collisionVerify){
        BRUSH.beginPath();
        BRUSH.arc(rightButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        checkSimilarity();
    }
    else if (collision1){
        BRUSH.beginPath();
        BRUSH.arc(leftButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(1);
    }
    else if (collision2){
        BRUSH.beginPath();
        BRUSH.arc(midButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(2);
    }
    else if (collision3){
        BRUSH.beginPath();
        BRUSH.arc(rightButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(3);
    }
    else if (collision4){
        BRUSH.beginPath();
        BRUSH.arc(leftButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(4);
    }
    else if (collision5){
        BRUSH.beginPath();
        BRUSH.arc(midButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(5);
    }
    else if (collision6){
        BRUSH.beginPath();
        BRUSH.arc(rightButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(6);
    }
    else if (collision7){
        BRUSH.beginPath();
        BRUSH.arc(leftButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(7);
    }
    else if (collision8){
        BRUSH.beginPath();
        BRUSH.arc(midButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(8);
    }
    else if (collision9){
        BRUSH.beginPath();
        BRUSH.arc(rightButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(9);
    }
}

function checkRelease(mouseUpEvent){
    mouseClicked = false;
    BRUSH.clearRect(0, 0, CANVAS.width, CANVAS.height);
    drawButtons();
}

function checkSimilarity(){
    if (phoneNumbers.join('') == uberNumber){
        phoneNumbers = ['Calling ', 'Uber ', 'Eats'];
        normalEnding = true;
    }
    else if (phoneNumbers.join('') == secretNumber){
        phoneNumbers = ['Calling ', 'Mom'];
        secretEnding = true;
    }
    else{
        phoneNumbers = ['Invalid ', 'Number'];
    }
}

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
    BRUSH.fillText(phoneNumbers.join(''), ((CANVAS.width/5)*2)+45, 100);
}

function trackMouseMove(mouseMoveEvent){
    cursorX = mouseMoveEvent.clientX;
    cursorY = mouseMoveEvent.clientY;
}

function start(){
    phoneNumbers = [];
    drawButtons();
    addEventListeners();
}

window.addEventListener('load', start);
