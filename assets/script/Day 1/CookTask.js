/**
 * Day 1 - Cook Task
 * A random arrow prompt appears centre screen.
 * Tap the matching arrow key. Background cooking image cycles each correct tap.
 * Random number of prompts (3-5).
 */

'use strict';

const CANVAS = document.getElementById('game-canvas');
CANVAS.width = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;
const BRUSH = CANVAS.getContext('2d');

// ── Task state ────────────────────────────────────────────────
let totalPrompts     = 0;
let promptsCompleted = 0;
let currentPrompt    = null;   // 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
let taskActive       = false;

// one-shot key guards
let upWasDown    = false;
let downWasDown  = false;
let leftWasDown  = false;
let rightWasDown = false;

// background image cycling
let bgIndex = 0;
const BG_COUNT = 4;

// ── Images ───────────────────────────────────────────────────
// swap src paths for real sprites when ready

// 4 cooking background images, cycle on each correct tap
const bgImages = [];
for (let i = 0; i < BG_COUNT; i++) {
    const img = new Image();
    img.src   = `assets/img/BG/cook_bg_${i}.png`;
    bgImages.push(img);
}

// 4 arrow prompt images shown centre screen
const arrowImgs = {
    ArrowUp:    new Image(),
    ArrowDown:  new Image(),
    ArrowLeft:  new Image(),
    ArrowRight: new Image(),
};
arrowImgs.ArrowUp.src    = 'assets/img/UI/cook_arrow_up.png';
arrowImgs.ArrowDown.src  = 'assets/img/UI/cook_arrow_down.png';
arrowImgs.ArrowLeft.src  = 'assets/img/UI/cook_arrow_left.png';
arrowImgs.ArrowRight.src = 'assets/img/UI/cook_arrow_right.png';

const PROMPT_SIZE = 128;
const ALL_KEYS    = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

// ── Keys currently held ──────────────────────────────────────
const keysDown = {};
window.addEventListener('keydown', e => keysDown[e.key] = true);
window.addEventListener('keyup',   e => keysDown[e.key] = false);

// ── Core functions ───────────────────────────────────────────

function startCookTask() {
    totalPrompts     = Math.floor(Math.random() * 3) + 3;  // 3, 4, or 5
    promptsCompleted = 0;
    bgIndex          = 0;
    taskActive       = true;
    resetKeyGuards();
    nextPrompt();
}

function updateCookTask() {
    if (!taskActive) return;

    const upDown    = !!keysDown['ArrowUp'];
    const downDown  = !!keysDown['ArrowDown'];
    const leftDown  = !!keysDown['ArrowLeft'];
    const rightDown = !!keysDown['ArrowRight'];

    const tappedUp    = upDown    && !upWasDown;
    const tappedDown  = downDown  && !downWasDown;
    const tappedLeft  = leftDown  && !leftWasDown;
    const tappedRight = rightDown && !rightWasDown;

    upWasDown    = upDown;
    downWasDown  = downDown;
    leftWasDown  = leftDown;
    rightWasDown = rightDown;

    if (currentPrompt === 'ArrowUp'    && tappedUp)    registerCorrect();
    if (currentPrompt === 'ArrowDown'  && tappedDown)  registerCorrect();
    if (currentPrompt === 'ArrowLeft'  && tappedLeft)  registerCorrect();
    if (currentPrompt === 'ArrowRight' && tappedRight) registerCorrect();
}

function registerCorrect() {
    promptsCompleted++;
    bgIndex = (bgIndex + 1) % BG_COUNT;   // cycle background

    if (promptsCompleted >= totalPrompts) {
        taskActive = false;
        onCookComplete();
        return;
    }

    nextPrompt();
}

// pick a new random prompt, never the same as current one
function nextPrompt() {
    let next;
    do {
        next = ALL_KEYS[Math.floor(Math.random() * ALL_KEYS.length)];
    } while (next === currentPrompt);

    currentPrompt = next;
    resetKeyGuards();
}

function resetKeyGuards() {
    upWasDown    = false;
    downWasDown  = false;
    leftWasDown  = false;
    rightWasDown = false;
}

function drawCookTask() {
    if (!taskActive) return;

    const W    = CANVAS.width;
    const H    = CANVAS.height;
    const cx   = W / 2;
    const cy   = H / 2;
    const half = PROMPT_SIZE / 2;

    // full-screen cooking background
    BRUSH.drawImage(bgImages[bgIndex], 0, 0, W, H);

    // centred arrow prompt
    BRUSH.drawImage(arrowImgs[currentPrompt], cx - half, cy - half, PROMPT_SIZE, PROMPT_SIZE);

    // progress counter
    BRUSH.font      = 'bold 22px sans-serif';
    BRUSH.fillStyle = 'white';
    BRUSH.textAlign = 'center';
    BRUSH.fillText(`${promptsCompleted} / ${totalPrompts}`, cx, cy + half + 32);
}

function onCookComplete() {
    console.log('Cook done!');
    // TODO: call startBedTask() or unlock bed interaction here
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