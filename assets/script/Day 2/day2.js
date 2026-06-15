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

//get te information about the mouse status
let cursorX;
let cursorY;
let mouseClicked = false;

//get the varibles for where to draw the inputs
//the size of the circles
let inputRadius = 40;
let circleRadius = inputRadius;

//variables for the inputs in the phone minigame
let topButtonY = 200;
let midButtonY = 350;
let botButtonY = 500;
let lastButtonY = 650;
let leftButtonX = (CANVAS.width/3) + 50;
let midButtonX = CANVAS.width/2;
let rightButtonX = ((CANVAS.width/3)*2) - 50;

//variables for the inputs in the wires minigame
let startX = leftButtonX;
let endX = rightButtonX;
let rgbyStarts = [topButtonY, midButtonY, botButtonY, lastButtonY];
let rgbyEnds = [topButtonY, midButtonY, botButtonY, lastButtonY];
let actualStarts = [0, 0, 0, 0];
let actualEnds = [0, 0, 0, 0];

//get the variables for the phone minigame

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

//get the element that was pressed
let phoneNumbers;

//stores the correct phone numbers to call
let uberNumber =  6474356685;
let secretNumber = 4168508495;

//stores the different ending activations
let normalEnding = false;
let secretEnding = false;

//get the varaibles for the wires minigame
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

//amount of collisions from start to the end
let collisionAmount = 0;

//amount of lines made
let linesAmount = 0;

//check if the mouse is currently collided with a starting wire
let collided = false;

//check if the game has been completed
let wiresCompleted = false;

//variables for the closet minigame
//get the closet images
const BACKGROUND_IMAGE = document.createElement('img');
BACKGROUND_IMAGE.src = '../../img/Day2Img/closetBG.png';

const LDOOR_IMAGE = document.createElement('img');
LDOOR_IMAGE.src = '../../img/Day2Img/closetLDoor.png';

const RDOOR_IMAGE = document.createElement('img');
RDOOR_IMAGE.src = '../../img/Day2Img/closetRDoor.png';

//get the jumpscare image
const JUMPSCARE_IMAGE = document.createElement('img');
JUMPSCARE_IMAGE.src = '../../img/Day3Img/3_Jumpscare.png';

//get the jumpscare sound
const JUMPSCARE_AUDIO = new Audio('../../audio/JumpscareScream.mp3');

//get the x value of the closet
let backgroundX = -CANVAS.width/2 + 27;

//get when the jumpscare happens
let jumpscareTiming = 575;

//get when the minigame is finished
let closetCompleted = false;

//get the functions for the phone minigame
/**
 * Checks if the cursor is on the button
 * @param {number} buttonX The X position of the button
 * @param {number} buttonY The Y position of the button
 * @returns true if there is a collision, false if there isn't
 */
function buttonsCollide(buttonX, buttonY){
    if (cursorX > buttonX - inputRadius && cursorX < buttonX + inputRadius && cursorY > buttonY - inputRadius && cursorY < buttonY + inputRadius){
        return true
    }
    else {
        return false;
    }
}

/**
 * Checks if the cursor is on any of the buttons when there is a click
 * @param {MouseEvent} mouseDownEvent Information if the mouse is held
 */
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
    //check if phone numbers is not a number
    if (isNaN(phoneNumbers.join(''))){
        phoneNumbers = [];
    }
    //check if the cursor is on button 0
    if (collision0){
        BRUSH.beginPath();
        BRUSH.arc(midButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(0);
    }
    //check if the cursor is on button ✗
    else if (collisionReset){
        BRUSH.beginPath();
        BRUSH.arc(leftButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers = [];
    }
    //check if the cursor is on button ✓
    else if (collisionVerify){
        BRUSH.beginPath();
        BRUSH.arc(rightButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        checkSimilarity();
    }
    //check if the cursor is on button 1
    else if (collision1){
        BRUSH.beginPath();
        BRUSH.arc(leftButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(1);
    }
    //check if the cursor is on button 2
    else if (collision2){
        BRUSH.beginPath();
        BRUSH.arc(midButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(2);
    }
    //check if the cursor is on button 3
    else if (collision3){
        BRUSH.beginPath();
        BRUSH.arc(rightButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(3);
    }
    //check if the cursor is on button 4
    else if (collision4){
        BRUSH.beginPath();
        BRUSH.arc(leftButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(4);
    }
    //check if the cursor is on button 5
    else if (collision5){
        BRUSH.beginPath();
        BRUSH.arc(midButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(5);
    }
    //check if the cursor is on button 6
    else if (collision6){
        BRUSH.beginPath();
        BRUSH.arc(rightButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(6);
    }
    //check if the cursor is on button 7
    else if (collision7){
        BRUSH.beginPath();
        BRUSH.arc(leftButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(7);
    }
    //check if the cursor is on button 8
    else if (collision8){
        BRUSH.beginPath();
        BRUSH.arc(midButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
        BRUSH.strokeStyle = "black";
        BRUSH.stroke();
        BRUSH.fillStyle = "black";
        BRUSH.fill();
        phoneNumbers.push(8);
    }
    //check if the cursor is on button 9
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

/**
 * Checks if the button is released and updates the CANVAS
 * @param {MouseEvent} mouseUpEvent information about if the button is released
 */
function checkRelease(mouseUpEvent){
    mouseClicked = false;
    BRUSH.clearRect(0, 0, CANVAS.width, CANVAS.height);
    drawButtons();
}

/**
 * Checks if the user input is the same as the phone numbers
 */
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

/**
 * Draws the buttons and input
 */
function drawButtons(){
    BRUSH.drawImage(PHONE_IMAGE, -150, -25, 1301*1.4, CANVAS.height*1.2);
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
    BRUSH.fillText(phoneNumbers.join(''), ((CANVAS.width/5)*2)+45, 150);
}

/**
 * Checks where the mouse is
 * @param {MouseEvent} mouseMoveEvent information about the mouse position
 */
function trackMouseMove(mouseMoveEvent){
    cursorX = mouseMoveEvent.clientX;
    cursorY = mouseMoveEvent.clientY;
}

/**
 * Starts the code
 */
function startCall(){
    phoneNumbers = ['Use ', 'Mouse ', 'To Call'];
    drawButtons();
    addCursorListeners();
}

//get the functions for the closet minigame
/**
 * Gets the closet event listeners
 */
function addClosetListeners(){
    addEventListener('keydown', checkClosetDown);
}

/**
 * Draws the closet
 */
function closetDraw(){
    BRUSH.clearRect(0, 0, CANVAS.width, CANVAS.height);
    BRUSH.drawImage(BACKGROUND_IMAGE, backgroundX, -10, CANVAS.width, CANVAS.height + 20);
    BRUSH.drawImage(LDOOR_IMAGE, 0, 0, CANVAS.width/2 - 10, CANVAS.height);
    BRUSH.drawImage(RDOOR_IMAGE, CANVAS.width/2 + 10, 0, CANVAS.width/2 - 10, CANVAS.height);
    BRUSH.font = "40px Garamond";
    BRUSH.fillStyle = "white";
    BRUSH.fillText("[a] or [<-] to look around", 50, 500);
}

/**
 * Checks if the player pressed the appropriate key and moves the background
 * @param {KeyboardEvent} keydown information about the keyboard
 */
function checkClosetDown(keydown){
    console.log(keydown.key);
    //check if the key pressed is the correct key
    if (keydown.key == 'ArrowLeft' || keydown.key == 'a'){
        backgroundX+=5;
        closetDraw();
        //check if the background value is the same to trigger the jumpscare
        if (backgroundX >= jumpscareTiming){
            BRUSH.drawImage(JUMPSCARE_IMAGE, 0, 0, CANVAS.width, CANVAS.height);
            JUMPSCARE_AUDIO.play();
            closetCompleted = true;
        }
    }
}

/**
 * Start the game
 */
function startCloset(){
    closetDraw();
    addClosetListeners();
}

//get the functions for the phone minigame
/**
 * Adds mouse event listeners
 */
function addMouseListeners(){
    document.body.addEventListener('mousemove', checkMouseMove);
    document.body.addEventListener('mousedown', checkMouseDown);
    document.body.addEventListener('mouseup', checkMouseUp);
}

/**
 * Gets the mouse position and moves the starting wire to the mouse
 * @param {MouseEvent} mouseMoveEvent information about the mouse position
 */
function checkMouseMove(mouseMoveEvent){
    console.log(`Mouse X: ${mouseMoveEvent.clientX}, Mouse Y: ${mouseMoveEvent.clientY}`);
    mouseX = mouseMoveEvent.clientX;
    mouseY = mouseMoveEvent.clientY;
    //check if the mouse button is pressed
    if (mouseButton){
        //check if the mouse has no other collisions
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
    //check if the red starting wire has been collided
    if (redStartCollide){
        redStartX = mouseX;
        redStartY = mouseY;
        draw();
    }
    //check if the yellow starting wire has been collided
    if (yellowStartCollide){
        yellowStartX = mouseX;
        yellowStartY = mouseY;
        draw();
    }
    //check if the blue starting wire has been collided
    if (blueStartCollide){
        blueStartX = mouseX;
        blueStartY = mouseY;
        draw();
    }
    //check if the green starting wire has been collided
    if (greenStartCollide){
        greenStartX = mouseX;
        greenStartY = mouseY;
        draw();
    }
}

/**
 * Checks if the mouse is pressed and checks if the mouse is on any of the wires
 * @param {MouseEvent} mouseDownEvent Information about if the mouse is pressed
 */
function checkMouseDown(mouseDownEvent){
    console.log('mouse clicked');
    mouseButton = true;
    redStartCollide = mouseCollision(redStartX, redStartY);
    yellowStartCollide = mouseCollision(yellowStartX, yellowStartY);
    blueStartCollide = mouseCollision(blueStartX, blueStartY);
    greenStartCollide = mouseCollision(greenStartX, greenStartY);
    //check if any of the starting wires are collided with the mouse
    if (redStartCollide || yellowStartCollide || blueStartCollide || greenStartCollide){
        linesAmount++;
    }   
}

/**
 * Checks if the mouse is released, and check if the wiring is at the correct position
 * @param {MouseEvent} mouseUpEvent Information about if the mouse is released
 */
function checkMouseUp(mouseUpEvent){
    console.log('mouse released');
    mouseButton = false;
    //check if red wire has not already been completed
    if (!redCompleted){
        redEndCollide = mouseCollision(endX, redEnd);
        //check if the mouse collides with both the end and starting wire
        if (redEndCollide && redStartCollide){
            collisionAmount++;
        }
    }
    //check if the yellow wire has not already been completed
    if (!yellowCompleted){
        yellowEndCollide = mouseCollision(endX, yellowEnd);
        //check if the mouse collides with both the end and starting wire
        if (yellowEndCollide && yellowStartCollide){
            collisionAmount++;
        }
    }
    //check if the blue wire has not already been completed
    if (!blueCompleted){
        blueEndCollide = mouseCollision(endX, blueEnd);
        //check if the mouse collides with both the end and starting wire
        if (blueEndCollide && blueStartCollide){
            collisionAmount++;
        }
    }
    //check if the green wire has not already been completed
    if (!greenCompleted){
        greenEndCollide = mouseCollision(endX, greenEnd);
        //check if the mouse collides with both the end and starting wire
        if (greenEndCollide && greenStartCollide){
            collisionAmount++;
        }
    }
    //check if the amount of lines made are more than the amount of lines that collide with the end point
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
        BRUSH.drawImage(PHONE_IMAGE, -150, -25, 1301*1.4, CANVAS.height*1.2);
        BRUSH.font = "35px Arial";
        BRUSH.fillStyle = "black";
        BRUSH.fillText('Use Mouse to Connect Wires', CANVAS.width/3 + 25, 150);
        draw();
    }
    else {
        //check if the wire is completed
        if (redEndCollide){
            redCompleted = true;
            endGame();
        }
        //check if the wire is completed
        if (yellowEndCollide){
            yellowCompleted = true;
            endGame();
        }
        //check if the wire is completed
        if (blueEndCollide){
            blueCompleted = true;
            endGame();
        }
        //check if the wire is completed
        if (greenEndCollide){
            greenCompleted = true;
            endGame();
        }
    }
}

/**
 * Checks if the mouse is colliding with the rgb coloured wires
 * @param {number} rgbX The X position of the rgb wire
 * @param {number} rgbY The Y position of the rgb wire
 * @returns true if there is a collsion, false if not
 */
function mouseCollision(rgbX, rgbY){
    //check if the mouse is inside the coloured wires
    if (mouseX > rgbX - circleRadius && mouseX < rgbX + circleRadius  && mouseY > rgbY - circleRadius && mouseY < rgbY + circleRadius){
        collided = true;
        return true;
    }
    else {
        return false;
    }
}

/**
 * Draws the wires on the Canvas
 */
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

/**
 * Check if the game has ended
 */
function endGame(){
    if (redCompleted && greenCompleted && yellowCompleted && blueCompleted){
        wiresCompleted = true;
    }
}

/**
 * Randomizes the starting positions of the wire start positions
 */
function randomizeStarts(){
    let pos;
    //traverses through the actualStarts array to assign a value to each element
    for (let i = 0; i < actualStarts.length; i++){
        pos = Math.floor(Math.random() * (4));
        //check if the randomized rgbyStarts element has already been chosen
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

/**
 * Randomizes the wire ending positions
 */
function randomizeEnds(){
    let pos;
    //traverses through the actualEnds array to assign a value to each element
    for (let i = 0; i < actualEnds.length; i++){
        pos = Math.floor(Math.random() * (4));
        //check if the randomized rgbyEnds element has already been chosen
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

/**
 * Starts the code
 */
function startWires(){
    randomizeStarts();
    randomizeEnds();
    BRUSH.drawImage(PHONE_IMAGE, -150, -25, 1301*1.4, CANVAS.height*1.2);
    BRUSH.font = "35px Arial";
    BRUSH.fillStyle = "black";
    BRUSH.fillText('Use Mouse to Connect Wires', CANVAS.width/3 + 25, 150);
    draw();
    addMouseListeners();
}
w