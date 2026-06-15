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

const stageOrder = ['blinds', 'phone', 'wires', 'closet'];

const stageImages = {
    blinds: 'assets/img/Day2Img/2_Blinds.png',
    phone: 'assets/img/Day2Img/2_Phone.png',
    wires: 'assets/img/Day2Img/2_Uber.png',
    closet: 'assets/img/Day2Img/2_Uber.png'
};

const taskImages = {
    sticky1: 'assets/img/Day2Img/2_CloseSticky.png',
    sticky2: 'assets/img/Day2Img/2_SecretEnding.png',
    phone: 'assets/img/Day2Img/ian_png-removebg-preview.png',
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

