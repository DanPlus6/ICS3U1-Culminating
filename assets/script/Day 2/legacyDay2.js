/**
 * By Ian Choy
 */

'use strict';

import { GAME_CONFIG } from '../config.js';

let CV;
let PL;
let input;
let actMap;
let onComplete;

let CANVAS;
let BRUSH;

const stageOrder = ['blinds', 'phone', 'door', 'closet', 'wires'];

const stageImages = {
    blinds: 'assets/img/Day2Img/2_Blinds.png',
    phone: 'assets/img/Day2Img/2_Phone.png',
    door: 'assets/img/Day2Img/2_Uber.png',
    closet: 'assets/img/Day2Img/2_Closet.png',
    wires: 'assets/img/Day2Img/2_Game.png'
};

const taskImages = {
    sticky1: 'assets/img/Day2Img/2_CloseSticky.png',
    sticky2: 'assets/img/Day2Img/2_SecretEnding.png',
    phone: 'assets/img/Day2Img/ian_png-removebg-preview.png',
    uberJS: 'assets/img/Day2Img/2_CloseUber1',
    door: 'assets/img/Day2Img/2_CloseUber2',
    closetBackground: 'assets/img/Day2Img/closetBG.png',
    closetLeftDoor: 'assets/img/Day2Img/closetLDoor.png',
    closetRightDoor: 'assets/img/Day2Img/closetRDoor.png',
    jumpscare: 'assets/img/Day3Img/3_Jumpscare.png',
    secretEnding: 'assets/img/Day2Img/2_MomEnding.png'
};

const state = {
    stageIndex: 0,
    mode: 'map',
    currentTask: null,
    done: false,
    secretGameOver: false,
    fadeAlpha: 0,
    eWasDown: false,
    taskFinishedAt: 0
};

//get the information about the mouse status
let cursorX;
let cursorY;
let mouseClicked = false;

//get the varibles for where to draw the inputs
//the size of the circles
let inputRadius = 40;
let circleRadius = inputRadius;

//variables for the inputs in the phone minigame
let topButtonY;
let midButtonY;
let botButtonY;
let lastButtonY;
let leftButtonX;
let midButtonX;
let rightButtonX;

//variables for the inputs in the wires minigame
let startX;
let endX;
let rgbyStarts;
let rgbyEnds;
let actualStarts;
let actualEnds;

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
let uberNumber = 6474356685;
let secretNumber = 4168508495;

//stores the different ending activations
let normalEnding = false;
let secretEnding = false;

//get the varaibles for the wires minigame
//information about the red pair of wires
let redStartY;
let redStartX;
let originalRedStartY;
let redStartCollide = false;
let redEnd;
let redEndCollide = false;
let redCompleted = false;

//information about the yellow pair of wires
let yellowStartY;
let yellowStartX;
let originalYellowStartY;
let yellowStartCollide = false;
let yellowEnd;
let yellowEndCollide = false;
let yellowCompleted = false;

//information about the blue pair of wires
let blueStartY;
let blueStartX;
let originalBlueStartY;
let blueStartCollide = false;
let blueEnd;
let blueEndCollide = false;
let blueCompleted = false;

//information about the green pair of wires
let greenStartY;
let greenStartX;
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

//check if the mouse is currently collided with a starting wire
let collided = false;

//check if the game has been completed
let wiresCompleted = false;

//get the images
const PHONE_IMAGE = document.createElement('img');
const BACKGROUND_IMAGE = document.createElement('img');
const LDOOR_IMAGE = document.createElement('img');
const RDOOR_IMAGE = document.createElement('img');
const JUMPSCARE_IMAGE = document.createElement('img');
const STICKY1_IMAGE = document.createElement('img');
const STICKY2_IMAGE = document.createElement('img');
const SECRET_ENDING_IMAGE = document.createElement('img');
const UBERJS_IMAGE = document.createElement('img');
const UBER_IMAGE = document.createElement('img');

//get the jumpscare sound
const JUMPSCARE_AUDIO = new Audio('assets/audio/JumpscareScream.mp3');

//get the x value of the closet
let backgroundX;

//get when the jumpscare happens
let jumpscareTiming = 575;

//get when the minigame is finished
let closetCompleted = false;

/**
 * starts or resets the complete day 2 sequence
 * @param {object} args day 2 references from main.js
 * @returns {void}
 */
export function startDay2({ canvas, player, inputManager, actionMap, onDayComplete }) {
    CV = canvas;
    PL = player;
    input = inputManager;
    actMap = actionMap;
    onComplete = onDayComplete;
    CANVAS = CV.CANVAS;
    BRUSH = CV.BRUSH;

    state.stageIndex = 0;
    state.mode = 'map';
    state.currentTask = null;
    state.done = false;
    state.secretGameOver = false;
    state.fadeAlpha = 0;
    state.eWasDown = false;
    state.taskFinishedAt = 0;

    loadTaskAssets();
    resetDay2Tasks();
    CV.setBackground(stageImages.blinds);
    centerPlayer();
}

/**
 * updates day 2 once per game tick
 * @returns {void}
 */
export function updateDay2() {
    if (state.done || state.secretGameOver) return;

    if (state.mode === 'task') {
        updateTask();
        return;
    }

    if (state.mode === 'fade') {
        updateFade();
        return;
    }

    PL.update();
    if (PL.oldX !== PL.x || PL.oldY !== PL.y) {
        CV.update(PL);
    }

    updateMapInteraction();
}

/**
 * draws the current day 2 screen
 * @returns {void}
 */
export function drawDay2() {
    if (state.mode === 'task') {
        CV.clearCanvas();
        drawTask();
        if (state.secretGameOver) {
            drawRestartPrompt();
        }
        return;
    }

    CV.clearAndDraw();

    if (canInteract()) {
        drawInteractPrompt();
    }

    if (GAME_CONFIG.DEBUG_HITBOXES) {
        drawHitbox();
    }

    if (state.mode === 'fade') {
        drawFade();
    }
}

/**
 * reports whether day 2 has finished
 * @returns {boolean} true when the final fade is complete
 */
export function isDay2Complete() {
    return state.done;
}

/**
 * reports whether the secret ending ended the game
 * @returns {boolean} true when day 2 should stop on the Mom ending screen
 */
export function isDay2SecretGameOver() {
    return state.secretGameOver;
}

/**
 * clears task listeners if the whole game restarts during a day 2 task
 * @returns {void}
 */
export function stopDay2() {
    removeTaskListeners();
}

/**
 * loads all day 2 image objects
 * @returns {void}
 */
function loadTaskAssets() {
    PHONE_IMAGE.src = taskImages.phone;
    BACKGROUND_IMAGE.src = taskImages.closetBackground;
    LDOOR_IMAGE.src = taskImages.closetLeftDoor;
    RDOOR_IMAGE.src = taskImages.closetRightDoor;
    JUMPSCARE_IMAGE.src = taskImages.jumpscare;
    STICKY1_IMAGE.src = taskImages.sticky1;
    STICKY2_IMAGE.src = taskImages.sticky2;
    SECRET_ENDING_IMAGE.src = taskImages.secretEnding;
    UBERJS_IMAGE.src = taskImages.uberJS;
    UBER_IMAGE.src = taskImages.door;
}

/**
 * resets all day 2 task variables
 * @returns {void}
 */
function resetDay2Tasks() {
    inputRadius = 40;
    circleRadius = inputRadius;

    topButtonY = 200;
    midButtonY = 350;
    botButtonY = 500;
    lastButtonY = 650;
    leftButtonX = (CANVAS.width / 3) + 50;
    midButtonX = CANVAS.width / 2;
    rightButtonX = ((CANVAS.width / 3) * 2) - 50;

    startX = leftButtonX;
    endX = rightButtonX;
    rgbyStarts = [topButtonY, midButtonY, botButtonY, lastButtonY];
    rgbyEnds = [topButtonY, midButtonY, botButtonY, lastButtonY];
    actualStarts = [0, 0, 0, 0];
    actualEnds = [0, 0, 0, 0];

    redStartX = startX;
    yellowStartX = startX;
    blueStartX = startX;
    greenStartX = startX;

    phoneNumbers = [];
    normalEnding = false;
    secretEnding = false;
    wiresCompleted = false;
    closetCompleted = false;
    backgroundX = -CANVAS.width / 2 + 27;
}

/**
 * checks for map interaction input and starts the correct task
 * @returns {void}
 */
function updateMapInteraction() {
    const eDown = actMap.isActive('interact');
    const eTapped = eDown && !state.eWasDown;
    state.eWasDown = eDown;

    if (!canInteract() || !eTapped) return;

    if (getStage() === 'blinds') {
        completeTask();
        return;
    }

    if (getStage() === 'door'){
        BRUSH.drawImage(UBERJS_IMAGE, 0, 0, CANVAS.width, CANVAS.height);
        BRUSH.drawImage(UBER_IMAGE, 0, 0, CANVAS.width, CANVAS.height);
        completeTask();
        return;
    }

    startTask(getStage());
}

/**
 * checks whether the player overlaps the current stage hitbox
 * @returns {boolean} true when the player can press e
 */
function canInteract() {
    const hitbox = GAME_CONFIG.HITBOXES.day2[getStage()];
    if (!hitbox) return false;

    return PL.x < hitbox.x + hitbox.w &&
        PL.x + PL.w > hitbox.x &&
        PL.y < hitbox.y + hitbox.h &&
        PL.y + PL.h > hitbox.y;
}

/**
 * gets the active day 2 stage name
 * @returns {string} current stage id
 */
function getStage() {
    return stageOrder[state.stageIndex];
}

/**
 * starts one of the day 2 tasks
 * @param {string} taskName name of the task to start
 * @returns {void}
 */
function startTask(taskName) {
    state.mode = 'task';
    state.currentTask = taskName;
    state.eWasDown = true;
    state.taskFinishedAt = 0;

    if (taskName === 'phone') startCall();
    if (taskName === 'closet') startCloset();
    if (taskName === 'wires') startWires();
}

/**
 * moves from a finished task to the next map stage
 * @returns {void}
 */
function completeTask() {
    removeTaskListeners();

    state.currentTask = null;
    state.eWasDown = true;
    state.stageIndex++;

    if (state.stageIndex >= stageOrder.length) {
        state.mode = 'fade';
        state.fadeAlpha = 0;
        return;
    }

    state.mode = 'map';
    CV.setBackground(stageImages[getStage()]);
    centerPlayer();
}

/**
 * puts the player back in the center of the canvas
 * @returns {void}
 */
function centerPlayer() {
    CV.rmEntity(PL);
    PL.x = Math.round((CV.WIDTH - PL.w) / 2);
    PL.y = Math.round((CV.HEIGHT - PL.h) / 2);
    PL.oldX = PL.x;
    PL.oldY = PL.y;
    CV.addEntity(PL);
}

/**
 * sends updates to the active task
 * @returns {void}
 */
function updateTask() {
    if (state.currentTask === 'phone') updatePhone();
    if (state.currentTask === 'wires') updateWires();
    if (state.currentTask === 'closet') updateCloset();
}

/**
 * sends drawing to the active task
 * @returns {void}
 */
function drawTask() {
    if (state.currentTask === 'phone') drawPhone();
    if (state.currentTask === 'wires') drawWires();
    if (state.currentTask === 'closet') drawCloset();
}

/**
 * updates the phone task
 * @returns {void}
 */
function updatePhone() {
    if (!normalEnding && !secretEnding) return;

    if (secretEnding) {
        removeTaskListeners();
        state.secretGameOver = true;
        return;
    }

    if (state.taskFinishedAt === 0) {
        state.taskFinishedAt = Date.now();
    }

    if (Date.now() - state.taskFinishedAt >= 900) {
        completeTask();
    }
}

/**
 * draws the phone task
 * @returns {void}
 */
function drawPhone() {
    drawButtons();
}

/**
 * updates the wires task
 * @returns {void}
 */
function updateWires() {
    if (wiresCompleted) {
        completeTask();
    }
}

/**
 * draws the wires task
 * @returns {void}
 */
function drawWires() {
    draw();
}

/**
 * updates the closet task
 * @returns {void}
 */
function updateCloset() {
    if (!closetCompleted) return;

    if (state.taskFinishedAt === 0) {
        state.taskFinishedAt = Date.now();
    }

    if (Date.now() - state.taskFinishedAt >= 900) {
        completeTask();
    }
}

/**
 * draws the closet task
 * @returns {void}
 */
function drawCloset() {
    if (closetCompleted) {
        BRUSH.drawImage(JUMPSCARE_IMAGE, 0, 0, CANVAS.width, CANVAS.height);
        return;
    }

    closetDraw();
}

/**
 * Adds event listeners for the cursor
 * @returns {void}
 */
function addCursorListeners() {
    document.body.addEventListener('mousemove', trackMouseMove);
    document.body.addEventListener('mousedown', checkClick);
    document.body.addEventListener('mouseup', checkRelease);
}

/**
 * removes active task listeners
 * @returns {void}
 */
function removeTaskListeners() {
    document.body.removeEventListener('mousemove', trackMouseMove);
    document.body.removeEventListener('mousedown', checkClick);
    document.body.removeEventListener('mouseup', checkRelease);
    document.body.removeEventListener('mousemove', checkMouseMove);
    document.body.removeEventListener('mousedown', checkMouseDown);
    document.body.removeEventListener('mouseup', checkMouseUp);
    window.removeEventListener('keydown', checkClosetDown);
}

/**
 * gets mouse position relative to the canvas
 * @param {MouseEvent} mouseEvent mouse event
 * @returns {{x: number, y: number}} canvas coordinates
 */
function getCanvasPoint(mouseEvent) {
    const rect = CANVAS.getBoundingClientRect();
    const scaleX = CANVAS.width / rect.width;
    const scaleY = CANVAS.height / rect.height;

    return {
        x: (mouseEvent.clientX - rect.left) * scaleX,
        y: (mouseEvent.clientY - rect.top) * scaleY
    };
}

//get the functions for the phone minigame
/**
 * Checks if the cursor is on the button
 * @param {number} buttonX The X position of the button
 * @param {number} buttonY The Y position of the button
 * @returns {boolean} true if there is a collision, false if there isn't
 */
function buttonsCollide(buttonX, buttonY){
    if (cursorX > buttonX - inputRadius && cursorX < buttonX + inputRadius && cursorY > buttonY - inputRadius && cursorY < buttonY + inputRadius){
        return true;
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
    const point = getCanvasPoint(mouseDownEvent);
    cursorX = point.x;
    cursorY = point.y;
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
        phoneNumbers.push(0);
    }
    //check if the cursor is on button X
    else if (collisionReset){
        phoneNumbers = [];
    }
    //check if the cursor is on button V
    else if (collisionVerify){
        checkSimilarity();
    }
    //check if the cursor is on button 1
    else if (collision1){
        phoneNumbers.push(1);
    }
    //check if the cursor is on button 2
    else if (collision2){
        phoneNumbers.push(2);
    }
    //check if the cursor is on button 3
    else if (collision3){
        phoneNumbers.push(3);
    }
    //check if the cursor is on button 4
    else if (collision4){
        phoneNumbers.push(4);
    }
    //check if the cursor is on button 5
    else if (collision5){
        phoneNumbers.push(5);
    }
    //check if the cursor is on button 6
    else if (collision6){
        phoneNumbers.push(6);
    }
    //check if the cursor is on button 7
    else if (collision7){
        phoneNumbers.push(7);
    }
    //check if the cursor is on button 8
    else if (collision8){
        phoneNumbers.push(8);
    }
    //check if the cursor is on button 9
    else if (collision9){
        phoneNumbers.push(9);
    }
}

/**
 * Checks if the button is released and updates the CANVAS
 * @param {MouseEvent} mouseUpEvent information about if the button is released
 */
function checkRelease(mouseUpEvent){
    mouseClicked = false;
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
    if (secretEnding) {
        BRUSH.drawImage(SECRET_ENDING_IMAGE, 0, 0, CANVAS.width, CANVAS.height);
        return;
    } else {
        BRUSH.drawImage(PHONE_IMAGE, -150, -25, 1301 * 1.4, CANVAS.height * 1.2);
    }

    BRUSH.beginPath();
    BRUSH.arc(midButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(leftButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(rightButtonX, lastButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(leftButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(midButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(rightButtonX, botButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(leftButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(midButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(rightButtonX, midButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(leftButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(midButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(rightButtonX, topButtonY, inputRadius, 0, 2*Math.PI);
    BRUSH.strokeStyle = 'grey';
    BRUSH.stroke();
    BRUSH.fillStyle = 'grey';
    BRUSH.fill();
    BRUSH.font = '40px Arial';
    BRUSH.fillStyle = 'black';
    BRUSH.fillText('0', midButtonX - 10, lastButtonY + 15);
    BRUSH.fillText('1', leftButtonX - 10, botButtonY + 15);
    BRUSH.fillText('2', midButtonX - 10, botButtonY + 15);
    BRUSH.fillText('3', rightButtonX - 10, botButtonY + 15);
    BRUSH.fillText('4', leftButtonX - 10, midButtonY + 15);
    BRUSH.fillText('5', midButtonX - 10, midButtonY + 15);
    BRUSH.fillText('6', rightButtonX - 10, midButtonY + 15);
    BRUSH.fillText('7', leftButtonX - 10, topButtonY + 15);
    BRUSH.fillText('8', midButtonX - 10, topButtonY + 15);
    BRUSH.fillText('9', rightButtonX - 10, topButtonY + 15);
    BRUSH.fillText('OK', rightButtonX - 23, lastButtonY + 15);
    BRUSH.fillText('X', leftButtonX - 13, lastButtonY + 15);
    BRUSH.fillText(phoneNumbers.join(''), ((CANVAS.width / 5) * 2) + 45, 150);
}

/**
 * Checks where the mouse is
 * @param {MouseEvent} mouseMoveEvent information about the mouse position
 */
function trackMouseMove(mouseMoveEvent){
    const point = getCanvasPoint(mouseMoveEvent);
    cursorX = point.x;
    cursorY = point.y;
}

/**
 * Starts the code
 */
function startCall(){
    phoneNumbers = ['Use ', 'Mouse ', 'To Call'];
    normalEnding = false;
    secretEnding = false;
    addCursorListeners();
}

//get the functions for the closet minigame
/**
 * Gets the closet event listeners
 */
function addClosetListeners(){
    window.addEventListener('keydown', checkClosetDown);
}

/**
 * Draws the closet
 */
function closetDraw(){
    BRUSH.drawImage(BACKGROUND_IMAGE, backgroundX, -10, CANVAS.width, CANVAS.height + 20);
    BRUSH.drawImage(LDOOR_IMAGE, 0, 0, CANVAS.width/2 - 10, CANVAS.height);
    BRUSH.drawImage(RDOOR_IMAGE, CANVAS.width/2 + 10, 0, CANVAS.width/2 - 10, CANVAS.height);
    BRUSH.font = '40px Garamond';
    BRUSH.fillStyle = 'white';
    BRUSH.fillText('[a] or [<-] to look around', 50, 500);
}

/**
 * Checks if the player pressed the appropriate key and moves the background
 * @param {KeyboardEvent} keydown information about the keyboard
 */
function checkClosetDown(keydown){
    //check if the key pressed is the correct key
    if (keydown.key == 'ArrowLeft' || keydown.key == 'a'){
        backgroundX += 5;
        //check if the background value is the same to trigger the jumpscare
        if (backgroundX >= jumpscareTiming){
            JUMPSCARE_AUDIO.play();
            closetCompleted = true;
        }
    }
}

/**
 * Start the game
 */
function startCloset(){
    backgroundX = -CANVAS.width / 2 + 27;
    closetCompleted = false;
    addClosetListeners();
}

//get the functions for the wires minigame
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
    const point = getCanvasPoint(mouseMoveEvent);
    mouseX = point.x;
    mouseY = point.y;
    //check if the mouse button is pressed
    if (mouseButton){
        //check if the mouse has no other collisions
        if (!collided){
            redStartCollide = mouseCollision(redStartX, redStartY);
            yellowStartCollide = mouseCollision(yellowStartX, yellowStartY);
            blueStartCollide = mouseCollision(blueStartX, blueStartY);
            greenStartCollide = mouseCollision(greenStartX, greenStartY);
        }
    }
    else {
        redStartCollide = false;
        yellowStartCollide = false;
        blueStartCollide = false;
        greenStartCollide = false;
        collided = false;
    }
    //check if the red starting wire has been collided
    if (redStartCollide){
        redStartX = mouseX;
        redStartY = mouseY;
    }
    //check if the yellow starting wire has been collided
    if (yellowStartCollide){
        yellowStartX = mouseX;
        yellowStartY = mouseY;
    }
    //check if the blue starting wire has been collided
    if (blueStartCollide){
        blueStartX = mouseX;
        blueStartY = mouseY;
    }
    //check if the green starting wire has been collided
    if (greenStartCollide){
        greenStartX = mouseX;
        greenStartY = mouseY;
    }
}

/**
 * Checks if the mouse is pressed and checks if the mouse is on any of the wires
 * @param {MouseEvent} mouseDownEvent Information about if the mouse is pressed
 */
function checkMouseDown(mouseDownEvent){
    const point = getCanvasPoint(mouseDownEvent);
    mouseX = point.x;
    mouseY = point.y;
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
    const point = getCanvasPoint(mouseUpEvent);
    mouseX = point.x;
    mouseY = point.y;
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
        resetWires();
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

    redStartCollide = false;
    yellowStartCollide = false;
    blueStartCollide = false;
    greenStartCollide = false;
    collided = false;
}

/**
 * resets the wire task positions after a wrong connection
 * @returns {void}
 */
function resetWires() {
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

    BRUSH.drawImage(PHONE_IMAGE, -150, -25, 1301 * 1.4, CANVAS.height * 1.2);
    BRUSH.font = '35px Arial';
    BRUSH.fillStyle = 'black';
    BRUSH.fillText('Use Mouse to Connect Wires', CANVAS.width / 3 + 25, 150);
}

/**
 * Checks if the mouse is colliding with the rgb coloured wires
 * @param {number} rgbX The X position of the rgb wire
 * @param {number} rgbY The Y position of the rgb wire
 * @returns {boolean} true if there is a collsion, false if not
 */
function mouseCollision(rgbX, rgbY){
    //check if the mouse is inside the coloured wires
    if (mouseX > rgbX - circleRadius && mouseX < rgbX + circleRadius && mouseY > rgbY - circleRadius && mouseY < rgbY + circleRadius){
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
    BRUSH.strokeStyle = 'red';
    BRUSH.stroke();
    BRUSH.fillStyle = 'red';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(endX, redEnd, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = 'red';
    BRUSH.stroke();
    BRUSH.fillStyle = 'red';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(yellowStartX, yellowStartY, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = 'yellow';
    BRUSH.stroke();
    BRUSH.fillStyle = 'yellow';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(endX, yellowEnd, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = 'yellow';
    BRUSH.stroke();
    BRUSH.fillStyle = 'yellow';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(blueStartX, blueStartY, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = 'blue';
    BRUSH.stroke();
    BRUSH.fillStyle = 'blue';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(endX, blueEnd, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = 'blue';
    BRUSH.stroke();
    BRUSH.fillStyle = 'blue';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(greenStartX, greenStartY, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = 'green';
    BRUSH.stroke();
    BRUSH.fillStyle = 'green';
    BRUSH.fill();
    BRUSH.beginPath();
    BRUSH.arc(endX, greenEnd, circleRadius, 0, 2 * Math.PI);
    BRUSH.strokeStyle = 'green';
    BRUSH.stroke();
    BRUSH.fillStyle = 'green';
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
    rgbyStarts = [topButtonY, midButtonY, botButtonY, lastButtonY];
    rgbyEnds = [topButtonY, midButtonY, botButtonY, lastButtonY];
    actualStarts = [0, 0, 0, 0];
    actualEnds = [0, 0, 0, 0];
    linesAmount = 0;
    collisionAmount = 0;
    wiresCompleted = false;
    randomizeStarts();
    randomizeEnds();
    redStartX = startX;
    yellowStartX = startX;
    blueStartX = startX;
    greenStartX = startX;
    resetWires();
    addMouseListeners();
}

/**
 * updates the end of day fade
 * @returns {void}
 */
function updateFade() {
    state.fadeAlpha = Math.min(1, state.fadeAlpha + 0.02);

    if (state.fadeAlpha < 1) return;

    state.done = true;
    if (onComplete) onComplete();
}

/**
 * draws the interact prompt at the bottom of the screen
 * @returns {void}
 */
function drawInteractPrompt() {
    const text = 'Interact [E]';
    const cx = CV.WIDTH / 2;
    const cy = CV.HEIGHT - 44;
    const paddingX = 24;

    BRUSH.save();
    BRUSH.font = 'bold 20px sans-serif';
    BRUSH.textAlign = 'center';

    const textWidth = BRUSH.measureText(text).width;
    const boxX = cx - textWidth / 2 - paddingX;
    const boxY = cy - 24;
    const boxW = textWidth + paddingX * 2;
    const boxH = 38;

    BRUSH.fillStyle = 'rgba(0, 0, 0, 0.65)';
    BRUSH.beginPath();
    BRUSH.roundRect(boxX, boxY, boxW, boxH, 8);
    BRUSH.fill();

    BRUSH.fillStyle = 'white';
    BRUSH.fillText(text, cx, cy);
    BRUSH.restore();
}

/**
 * draws the restart prompt for ending screens
 * @returns {void}
 */
function drawRestartPrompt() {
    const text = 'Press [R] to restart';
    const cx = CV.WIDTH / 2;
    const cy = CV.HEIGHT - 44;
    const paddingX = 24;

    BRUSH.save();
    BRUSH.font = 'bold 20px sans-serif';
    BRUSH.textAlign = 'center';

    const textWidth = BRUSH.measureText(text).width;
    const boxX = cx - textWidth / 2 - paddingX;
    const boxY = cy - 24;
    const boxW = textWidth + paddingX * 2;
    const boxH = 38;

    BRUSH.fillStyle = 'rgba(0, 0, 0, 0.65)';
    BRUSH.beginPath();
    BRUSH.roundRect(boxX, boxY, boxW, boxH, 8);
    BRUSH.fill();

    BRUSH.fillStyle = 'white';
    BRUSH.fillText(text, cx, cy);
    BRUSH.restore();
}

/**
 * draws the current shared hitbox for manual tuning
 * @returns {void}
 */
function drawHitbox() {
    const hitbox = GAME_CONFIG.HITBOXES.day2[getStage()];
    if (!hitbox) return;

    BRUSH.save();
    BRUSH.strokeStyle = 'lime';
    BRUSH.lineWidth = 3;
    BRUSH.strokeRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
    BRUSH.restore();
}

/**
 * draws the fade to black overlay
 * @returns {void}
 */
function drawFade() {
    BRUSH.save();
    BRUSH.globalAlpha = state.fadeAlpha;
    BRUSH.fillStyle = 'black';
    BRUSH.fillRect(0, 0, CV.WIDTH, CV.HEIGHT);
    BRUSH.restore();
}
