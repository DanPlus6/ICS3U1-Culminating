/**
 * Day 1 - Sweep Task
 * Tap LEFT arrow then RIGHT arrow, alternating, for a random number of times (5-20)
 */

'use strict';

const CANVAS = document.getElementById('game-canvas');
CANVAS.width = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;
const BRUSH = CANVAS.getContext('2d');

// ── Task state ────────────────────────────────────────────────
let totalSweeps = 0;
let sweepsCompleted = 0;
let expectedKey = 'ArrowLeft';   // always starts on left
let taskActive = false;

// one-shot key guards (so holding doesn't spam)
let leftWasDown  = false;
let rightWasDown = false;

// ── Images ───────────────────────────────────────────────────
// placeholder 1 = left arrow prompt, placeholder 2 = right arrow prompt
// swap these src paths for your real arrow images later
const imgLeft  = new Image();
imgLeft.src    = 'assets/img/UI/sweep_left.png';

const imgRight = new Image();
imgRight.src   = 'assets/img/UI/sweep_right.png';

const PROMPT_SIZE = 128;

// ── Keys currently held ──────────────────────────────────────
const keysDown = {};
window.addEventListener('keydown', e => keysDown[e.key] = true);
window.addEventListener('keyup',   e => keysDown[e.key] = false);

// ── Core functions ───────────────────────────────────────────

function startSweepTask() {
    totalSweeps      = Math.floor(Math.random() * 16) + 5;  // 5-20
    sweepsCompleted  = 0;
    expectedKey      = 'ArrowLeft';
    leftWasDown      = false;
    rightWasDown     = false;
    taskActive       = true;
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

    const cx   = CANVAS.width  / 2;
    const cy   = CANVAS.height / 2;
    const half = PROMPT_SIZE   / 2;

    const img = expectedKey === 'ArrowLeft' ? imgLeft : imgRight;
    BRUSH.drawImage(img, cx - half, cy - half, PROMPT_SIZE, PROMPT_SIZE);

    // progress counter
    BRUSH.font      = 'bold 22px sans-serif';
    BRUSH.fillStyle = 'white';
    BRUSH.textAlign = 'center';
    BRUSH.fillText(`${sweepsCompleted} / ${totalSweeps}`, cx, cy + half + 32);
}

function onSweepComplete() {
    console.log('Sweep done!');
    // TODO: call startStudyTask() here when chaining tasks
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