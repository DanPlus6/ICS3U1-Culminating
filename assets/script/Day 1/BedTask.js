/**
 * Day 1 - Bed Task
 * Player walks near the bed and presses E to sleep.
 * Screen fades to black, then day1End = true.
 */

'use strict';

const CANVAS = document.getElementById('game-canvas');
CANVAS.width = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;
const BRUSH = CANVAS.getContext('2d');

// ── Game state ────────────────────────────────────────────────
let day1End = false;

// ── Player ────────────────────────────────────────────────────
let playerX    = CANVAS.width  / 2;
let playerY    = CANVAS.height / 2;
const PLAYER_W = 48;
const PLAYER_H = 48;
const SPEED    = 4;

// ── Bed ───────────────────────────────────────────────────────
const BED_W = 96;
const BED_H = 96;
const bedX  = CANVAS.width  - BED_W - 60;   // near bottom-right, adjust to your room
const bedY  = CANVAS.height - BED_H - 60;

// ── Fade ──────────────────────────────────────────────────────
let fading    = false;
let fadeAlpha = 0;
const FADE_SPEED = 0.02;

// ── Prompt ────────────────────────────────────────────────────
let showPrompt = false;

// ── Images ───────────────────────────────────────────────────
// swap src paths for real sprites when ready
const playerImg = new Image();
playerImg.src   = 'assets/img/player.png';

const bedImg  = new Image();
bedImg.src    = 'assets/img/Entities/bed/bed.png';

// ── Keys ─────────────────────────────────────────────────────
const keysDown = {};
let eWasDown   = false;

window.addEventListener('keydown', e => keysDown[e.key] = true);
window.addEventListener('keyup',   e => keysDown[e.key] = false);

// ── Core functions ───────────────────────────────────────────

function updatePlayer() {
    if (fading || day1End) return;

    if (keysDown['ArrowUp']    || keysDown['w'] || keysDown['W']) playerY = Math.max(0, playerY - SPEED);
    if (keysDown['ArrowDown']  || keysDown['s'] || keysDown['S']) playerY = Math.min(CANVAS.height - PLAYER_H, playerY + SPEED);
    if (keysDown['ArrowLeft']  || keysDown['a'] || keysDown['A']) playerX = Math.max(0, playerX - SPEED);
    if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D']) playerX = Math.min(CANVAS.width  - PLAYER_W, playerX + SPEED);
}

function checkBedCollision() {
    return (
        playerX             < bedX + BED_W &&
        playerX + PLAYER_W  > bedX         &&
        playerY             < bedY + BED_H &&
        playerY + PLAYER_H  > bedY
    );
}

function updateBed() {
    if (fading || day1End) return;

    showPrompt = checkBedCollision();

    // one-shot E press
    const eDown   = !!keysDown['e'] || !!keysDown['E'];
    const eTapped = eDown && !eWasDown;
    eWasDown      = eDown;

    if (showPrompt && eTapped) {
        fading    = true;
        fadeAlpha = 0;
    }
}

function updateFade() {
    if (!fading) return;

    fadeAlpha = Math.min(1, fadeAlpha + FADE_SPEED);

    if (fadeAlpha >= 1) {
        fading   = false;
        day1End  = true;
        onDay1End();
    }
}

function onDay1End() {
    console.log('Day 1 ended! day1End =', day1End);
    // Day 2 will check day1End === true before loading
    // TODO: loadDay2();
}

// ── Draw functions ───────────────────────────────────────────

function drawScene() {
    // player
    BRUSH.drawImage(playerImg, playerX, playerY, PLAYER_W, PLAYER_H);

    // bed
    BRUSH.drawImage(bedImg, bedX, bedY, BED_W, BED_H);
}

function drawPrompt() {
    if (!showPrompt || fading) return;

    BRUSH.font      = 'bold 18px sans-serif';
    BRUSH.fillStyle = 'white';
    BRUSH.textAlign = 'center';
    BRUSH.fillText('[E] Sleep', bedX + BED_W / 2, bedY - 12);
}

function drawFade() {
    if (fadeAlpha <= 0) return;

    BRUSH.save();
    BRUSH.globalAlpha = fadeAlpha;
    BRUSH.fillStyle   = 'black';
    BRUSH.fillRect(0, 0, CANVAS.width, CANVAS.height);
    BRUSH.restore();
}

// ── Game loop ────────────────────────────────────────────────

function gameLoop() {
    BRUSH.clearRect(0, 0, CANVAS.width, CANVAS.height);

    updatePlayer();
    updateBed();
    updateFade();

    drawScene();
    drawPrompt();
    drawFade();   // always last so it sits on top
}

function start() {
    setInterval(gameLoop, 20);
}

window.addEventListener('load', start);