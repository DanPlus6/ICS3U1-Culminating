/**
 * Day 1 - Study Task
 * Hold UP arrow to write, release and repeat for a random number of times (3-5)
 * Image alternates between two writing frames while held, returns to idle on release
 */

'use strict';

const CANVAS = document.getElementById('game-canvas');
CANVAS.width = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;
const BRUSH = CANVAS.getContext('2d');

// ── Task state ────────────────────────────────────────────────
let totalWrites     = 0;
let writesCompleted = 0;
let taskActive      = false;

// hold detection
let holdCounted  = false;    // has this press already been counted
let upHeld       = false;

// animation
let writeFrame  = 'A';      // 'A' or 'B', flips while held
let animTick    = 0;
const ANIM_INTERVAL = 8;    // ticks between frame flips (~160ms at 50fps)

// ── Images ───────────────────────────────────────────────────
// swap src paths for real sprites when ready
const imgIdle   = new Image();
imgIdle.src     = 'assets/img/UI/study_idle.png';    // pen stationary

const imgWriteA = new Image();
imgWriteA.src   = 'assets/img/UI/study_write_a.png'; // writing frame 1

const imgWriteB = new Image();
imgWriteB.src   = 'assets/img/UI/study_write_b.png'; // writing frame 2

const PROMPT_SIZE = 128;

// ── Keys currently held ──────────────────────────────────────
const keysDown = {};
window.addEventListener('keydown', e => keysDown[e.key] = true);
window.addEventListener('keyup',   e => keysDown[e.key] = false);

// ── Core functions ───────────────────────────────────────────

function startStudyTask() {
    totalWrites     = Math.floor(Math.random() * 3) + 3;  // 3, 4, or 5
    writesCompleted = 0;
    holdCounted     = false;
    upHeld          = false;
    writeFrame      = 'A';
    animTick        = 0;
    taskActive      = true;
}

function updateStudyTask() {
    if (!taskActive) return;

    const upDown = !!keysDown['ArrowUp'];

    if (upDown) {
        upHeld = true;
        animTick++;

        // count one write on the very first tick of a new hold
        if (!holdCounted) {
            holdCounted = true;
            registerWrite();
            if (!taskActive) return;  // task may have just finished
        }

        // alternate animation frames while held
        if (animTick >= ANIM_INTERVAL) {
            animTick   = 0;
            writeFrame = writeFrame === 'A' ? 'B' : 'A';
        }
    } else {
        // key released — reset back to idle
        upHeld      = false;
        holdCounted = false;
        animTick    = 0;
        writeFrame  = 'A';
    }
}

function registerWrite() {
    writesCompleted++;
    if (writesCompleted >= totalWrites) {
        taskActive = false;
        onStudyComplete();
    }
}

function drawStudyTask() {
    if (!taskActive) return;

    const cx   = CANVAS.width  / 2;
    const cy   = CANVAS.height / 2;
    const half = PROMPT_SIZE   / 2;

    // pick correct image
    let img;
    if (!upHeld) {
        img = imgIdle;
    } else {
        img = writeFrame === 'A' ? imgWriteA : imgWriteB;
    }

    BRUSH.drawImage(img, cx - half, cy - half, PROMPT_SIZE, PROMPT_SIZE);

    // hint text when idle
    if (!upHeld) {
        BRUSH.font      = 'bold 18px sans-serif';
        BRUSH.fillStyle = 'white';
        BRUSH.textAlign = 'center';
        BRUSH.fillText('[↑] Hold to write', cx, cy - half - 14);
    }

    // progress counter
    BRUSH.font      = 'bold 22px sans-serif';
    BRUSH.fillStyle = 'white';
    BRUSH.textAlign = 'center';
    BRUSH.fillText(`${writesCompleted} / ${totalWrites}`, cx, cy + half + 32);
}

function onStudyComplete() {
    console.log('Study done!');
    // TODO: call startCookTask() here when chaining tasks
}

// ── Game loop ────────────────────────────────────────────────

function gameLoop() {
    BRUSH.clearRect(0, 0, CANVAS.width, CANVAS.height);
    updateStudyTask();
    drawStudyTask();
}

function start() {
    startStudyTask();
    setInterval(gameLoop, 20);
}

window.addEventListener('load', start);