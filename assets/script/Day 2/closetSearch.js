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
BACKGROUND_IMAGE.src = '../../img/closetBG.png';

const LDOOR_IMAGE = document.createElement('img');
LDOOR_IMAGE.src = '../../img/closetLDoor.png';

const RDOOR_IMAGE = document.createElement('img');
RDOOR_IMAGE.src = '../../img/closetRDoor.png';

let backgroundX = -CANVAS.width/2 + 27;

function closetDraw(){
    BRUSH.drawImage(BACKGROUND_IMAGE, backgroundX, -10, CANVAS.width, CANVAS.height + 20);
    BRUSH.drawImage(LDOOR_IMAGE, 0, 0, CANVAS.width/2 - 10, CANVAS.height);
    BRUSH.drawImage(RDOOR_IMAGE, CANVAS.width/2 + 10, 0, CANVAS.width/2 - 10, CANVAS.height);
}


function startCloset(){
    closetDraw();
}