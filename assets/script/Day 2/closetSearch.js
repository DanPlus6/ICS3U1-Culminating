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