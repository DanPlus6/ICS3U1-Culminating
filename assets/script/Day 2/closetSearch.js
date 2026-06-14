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

//get the monster image
const MONSTER_IMAGE = document.createElement('img');
MONSTER_IMAGE.src = '../../img/PlayerAvatar/trollge.png';

let leftDoor