/**
 * Day 1 - Cook Task
 * Random arrow appears centre screen (with cooking image behind it).
 * Tap the matching arrow key. Background cooking image cycles each correct tap.
 * Random number of times 3-5.
 */

'use strict';

const CANVAS = document.getElementById('game-canvas');
CANVAS.width  = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;
const BRUSH   = CANVAS.getContext('2d');

// ── Task state ────────────────────────────────────────────────
let totalPrompts     = 0;
let promptsCompleted = 0;
let currentPrompt    = null;
let taskActive       = false;

// one-shot key guards
let upWasDown    = false;
let downWasDown  = false;
let leftWasDown  = false;
let rightWasDown = false;

// background cycling
let cookBgIndex = 0;

const COOK_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

// ── Images ───────────────────────────────────────────────────

// cooking background images (cycle on each correct tap)
const cookBg1 = new Image();
cookBg1.src   = '../../img/Day1Img/1_CloseCook1.png';      // frame 1  ← swap/add more if you have them

const cookBg2 = new Image();
cookBg2.src   = '../../img/Day1Img/1_CloseCook2.png'; // frame 2

const cookBg3 = new Image();
cookBg3.src   = '../../img/Day1Img/1_CloseCook3.png'; // frame 3

const cookBg4 = new Image();
cookBg4.src   = '../../img/Day1Img/1_CloseCook4.png'; // frame 4

const cookBgs = [cookBg1, cookBg2, cookBg3, cookBg4];

// arrow images (drawn on top of background)
const arrowUp    = new Image();
arrowUp.src      = '../../img/Arrows/UpArrow.png';

const arrowDown  = new Image();
arrowDown.src    = '../../img/Arrows/DownArrow.png';

const arrowLeft  = new Image();
arrowLeft.src    = '../../img/Arrows/LeftArrow.png';

const arrowRight = new Image();
arrowRight.src   = '../../img/Arrows/RightArrow.png';

const arrowImgs = {
    ArrowUp:    arrowUp,
    ArrowDown:  arrowDown,
    ArrowLeft:  arrowLeft,
    ArrowRight: arrowRight,
};

const ARROW_SIZE = 400;

// ── Keys ─────────────────────────────────────────────────────
const keysDown = {};
window.addEventListener('keydown', e => { keysDown[e.key] = true;  e.preventDefault(); });
window.addEventListener('keyup',   e => { keysDown[e.key] = false; });

// ── Core functions ───────────────────────────────────────────

function startCookTask() {
    totalPrompts     = Math.floor(Math.random() * (6)) + 10; 
    promptsCompleted = 0;
    cookBgIndex      = 0;
    taskActive       = true;
    resetKeyGuards();
    nextPrompt();
}

function nextPrompt() {
    let next;
    do {
        next = COOK_KEYS[Math.floor(Math.random() * COOK_KEYS.length)];
    } while (next === currentPrompt);
    currentPrompt = next;
    resetKeyGuards();
}

function resetKeyGuards() {
    upWasDown = downWasDown = leftWasDown = rightWasDown = false;
}

function updateCookTask() {
    if (!taskActive) return;

    const upDown    = !!keysDown['ArrowUp'];
    const downDown  = !!keysDown['ArrowDown'];
    const leftDown  = !!keysDown['ArrowLeft'];
    const rightDown = !!keysDown['ArrowRight'];

    const tapUp    = upDown    && !upWasDown;
    const tapDown  = downDown  && !downWasDown;
    const tapLeft  = leftDown  && !leftWasDown;
    const tapRight = rightDown && !rightWasDown;

    upWasDown    = upDown;
    downWasDown  = downDown;
    leftWasDown  = leftDown;
    rightWasDown = rightDown;

    if (currentPrompt === 'ArrowUp'    && tapUp)    countCook();
    if (currentPrompt === 'ArrowDown'  && tapDown)  countCook();
    if (currentPrompt === 'ArrowLeft'  && tapLeft)  countCook();
    if (currentPrompt === 'ArrowRight' && tapRight) countCook();
}

function countCook() {
    promptsCompleted++;
    cookBgIndex = (cookBgIndex + 1) % cookBgs.length;

    if (promptsCompleted >= totalPrompts) {
        taskActive = false;
        onCookComplete();
        return;
    }

    nextPrompt();
}

function drawCookTask() {
    if (!taskActive) return;

    const W  = CANVAS.width;
    const H  = CANVAS.height;
    const cx = W / 2;
    const cy = H / 2;

    // cooking background full screen
    BRUSH.drawImage(cookBgs[cookBgIndex], 0, 0, W, H);

    // arrow centred on top
    BRUSH.drawImage(arrowImgs[currentPrompt], cx - ARROW_SIZE / 2, cy - ARROW_SIZE / 2, ARROW_SIZE, ARROW_SIZE);

    // progress counter
    BRUSH.font      = 'bold 22px sans-serif';
    BRUSH.fillStyle = 'white';
    BRUSH.textAlign = 'center';
    BRUSH.fillText(`${promptsCompleted} / ${totalPrompts}`, cx, cy + ARROW_SIZE / 2 + 36);
}

function onCookComplete() {
    console.log('Cook done!');
    // TODO: chain to next task
}

// ── Game loop ────────────────────────────────────────────────

function gameLoop() {
    BRUSH.clearRect(0, 0, CANVAS.width, CANVAS.height);
    updateCookTask();
    drawCookTask();
}

function start() {
    startCookTask();
    setInterval(gameLoop, 20);
}

window.addEventListener('load', start);