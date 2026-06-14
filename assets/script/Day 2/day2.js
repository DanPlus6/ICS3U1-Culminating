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

//get the varaibles for where to draw the inputs
let inputRadius = 40;

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
let closedCompleted = false;

//get the functions for the 