/**
 * Day 1 - Sweep Task
 * Draws the broom image behind, arrow image on top, both centred.
 * Tap LEFT arrow (broom left + left arrow) then RIGHT arrow (broom right + right arrow), alternating.
 * Random number of times 5-20.
 */

'use strict';

const CANVAS = document.getElementById('game-canvas');
CANVAS.width  = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;
const BRUSH   = CANVAS.getContext('2d');

// ── Task state ────────────────────────────────────────────────
let totalSweeps     = 0;
let sweepsCompleted = 0;
let expectedKey     = 'ArrowLeft';
let taskActive      = false;

// one-shot key guards
let leftWasDown  = false;
let rightWasDown = false;

// ── Images ───────────────────────────────────────────────────

// broom images (back layer)
const broomLeft  = new Image();
broomLeft.src    = '../../img/Day1Img/1_CloseSweep2.png';

const broomRight = new Image();
broomRight.src   = '../../img/Day1Img/1_CloseSweep1.png';

// arrow images (front layer)
const arrowLeft  = new Image();
arrowLeft.src    = '../../img/Arrows/LeftArrow.png';

const arrowRight = new Image();
arrowRight.src   = '../../img/Arrows/RightArrow.png';

// broom drawn bigger, arrow smaller on top
const BROOM_SIZE = 600;
const ARROW_SIZE = 500;

// ── Keys ─────────────────────────────────────────────────────
const keysDown = {};
window.addEventListener('keydown', e => { keysDown[e.key] = true;  e.preventDefault(); });
window.addEventListener('keyup',   e => { keysDown[e.key] = false; });

// ── Core functions ───────────────────────────────────────────

function startSweepTask() {
    totalSweeps     = Math.floor(Math.random() * 16) + 5;  // 5-20
    sweepsCompleted = 0;
    expectedKey     = 'ArrowLeft';
    leftWasDown     = false;
    rightWasDown    = false;
    taskActive      = true;
}

function updateSweepTask() {
    if (!taskActive) return;

    const leftDown  = !!keysDown['ArrowLeft'];
    const rightDown = !!keysDown['ArrowRight'];

    const leftTapped  = leftDown  && !leftWasDown;
    const rightTapped = rightDown && !rightWasDown;

    leftWasDown  = leftDown;
    rightWasDown = rightDown;

    if (expectedKey === 'ArrowLeft'  && leftTapped)  registerSweep();
    if (expectedKey === 'ArrowRight' && rightTapped) registerSweep();
}

function registerSweep() {
    sweepsCompleted++;
    // flip expected key
    expectedKey = expectedKey === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';

    if (sweepsCompleted >= totalSweeps) {
        taskActive = false;
        onSweepComplete();
    }
}

function drawSweepTask() {
    if (!taskActive) return;

    const cx = CANVAS.width  / 2;
    const cy = CANVAS.height / 2;

    // broom behind — centred, larger
    const broom = expectedKey === 'ArrowLeft' ? broomLeft : broomRight;
    BRUSH.drawImage(broom, cx - BROOM_SIZE / 2, cy - BROOM_SIZE / 2, BROOM_SIZE, BROOM_SIZE);

    // arrow on top — centred, smaller
    const arrow = expectedKey === 'ArrowLeft' ? arrowLeft : arrowRight;
    BRUSH.drawImage(arrow, cx - ARROW_SIZE / 2, cy - ARROW_SIZE / 2, ARROW_SIZE, ARROW_SIZE);

    // progress counter below
    BRUSH.font      = 'bold 22px sans-serif';
    BRUSH.fillStyle = 'white';
    BRUSH.textAlign = 'center';
    BRUSH.fillText(`${sweepsCompleted} / ${totalSweeps}`, cx, cy + BROOM_SIZE / 2 + 36);
}

function onSweepComplete() {
    console.log('Sweep done!');
    // TODO: chain to next task
}

// ── Game loop ────────────────────────────────────────────────

function gameLoop() {
    BRUSH.clearRect(0, 0, CANVAS.width, CANVAS.height);
    updateSweepTask();
    drawSweepTask();
}

function start() {
    startSweepTask();
    setInterval(gameLoop, 20);
}

window.addEventListener('load', start);