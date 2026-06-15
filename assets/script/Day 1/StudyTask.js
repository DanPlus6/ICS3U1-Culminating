/**
 * Day 1 - Study Task
 * Hold UP arrow to write.
 * Shows idle pen image, then alternates between two writing images while held.
 * Random number of times 3-5.
 */

'use strict';

const CANVAS = document.getElementById('game-canvas');
CANVAS.width  = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;
const BRUSH   = CANVAS.getContext('2d');

// ── Task state ────────────────────────────────────────────────
let totalWrites     = 0;
let writesCompleted = 0;
let taskActive      = false;
let holdCounted     = false;
let upHeld          = false;
let writeFrame      = 'A';
let animTick        = 0;
const ANIM_INTERVAL = 8;

// ── Images ───────────────────────────────────────────────────

// study images (back layer)
const studyIdle   = new Image();
studyIdle.src     = '../../img/Day1Img/1_CloseStudy1.png';   // pen stationary

const studyWriteA = new Image();
studyWriteA.src   = '../../img/Day1Img/1_CloseStudy1.png';   // writing frame 1 (swap if you have a different one)

const studyWriteB = new Image();
studyWriteB.src   = '../../img/Day1Img/1_CloseStudy2.png';   // writing frame 2

// arrow on top
const arrowUp = new Image();
arrowUp.src   = '../../img/Arrows/DownArrow.png';

const STUDY_SIZE = 600;
const ARROW_SIZE = 200;

// ── Keys ─────────────────────────────────────────────────────
const keysDown = {};
window.addEventListener('keydown', e => { keysDown[e.key] = true;  e.preventDefault(); });
window.addEventListener('keyup',   e => { keysDown[e.key] = false; });

// ── Core functions ───────────────────────────────────────────

function startStudyTask() {
    totalWrites     = Math.floor(Math.random() * 6) + 10;  // 3-5
    writesCompleted = 0;
    holdCounted     = false;
    upHeld          = false;
    writeFrame      = 'A';
    animTick        = 0;
    taskActive      = true;
}

function updateStudyTask() {
    if (!taskActive) return;

    const upDown = !!keysDown['ArrowDown'];

    if (upDown) {
        upHeld = true;
        animTick++;

        // count one write on the first tick of each new hold
        if (!holdCounted) {
            holdCounted = true;
            writesCompleted++;
            if (writesCompleted >= totalWrites) {
                taskActive = false;
                onStudyComplete();
                return;
            }
        }

        // alternate frames while held
        if (animTick >= ANIM_INTERVAL) {
            animTick   = 0;
            writeFrame = writeFrame === 'A' ? 'B' : 'A';
        }
    } else {
        // released — reset back to idle
        upHeld      = false;
        holdCounted = false;
        animTick    = 0;
        writeFrame  = 'A';
    }
}

function drawStudyTask() {
    if (!taskActive) return;

    const cx = CANVAS.width  / 2;
    const cy = CANVAS.height / 2;

    // study image behind
    const studyImg = !upHeld ? studyIdle
                   : writeFrame === 'A' ? studyWriteA : studyWriteB;
    BRUSH.drawImage(studyImg, cx - STUDY_SIZE / 2, cy - STUDY_SIZE / 2, STUDY_SIZE, STUDY_SIZE);

    // up arrow on top — only show when not yet held (hint to player)
    if (!upHeld) {
        BRUSH.drawImage(arrowUp, cx - ARROW_SIZE / 2, cy - ARROW_SIZE / 2, ARROW_SIZE, ARROW_SIZE);
    }

    // progress counter
    BRUSH.font      = 'bold 22px sans-serif';
    BRUSH.fillStyle = 'white';
    BRUSH.textAlign = 'center';
    BRUSH.fillText(`${writesCompleted} / ${totalWrites}`, cx, cy + STUDY_SIZE / 2 + 36);
}

function onStudyComplete() {
    console.log('Study done!');
    // TODO: chain to next task
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