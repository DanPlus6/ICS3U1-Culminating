'use strict';

import { StartScreen } from './Classes/UI/StartScreen.js';
import { InputManager } from './Classes/Player/InputManager.js';
import { ActionMap } from './Classes/Player/ActionMap.js';
import { Player } from './Classes/Player/Player.js';
import { Canvas } from './Classes/GameScreen/Canvas.js';
import { GAME_CONFIG } from './config.js';
import { Bed } from './Classes/Entities/Bed.js';

// +++++++++++++++++ Game State ++++++++++++++++++++
let CV;
let PL;
let gameActive = false;
let gameRefresher = null;
let gameTick = 0;
let screenTransitioning = false;
const gameState = { day1End: false };

// +++++++++++++++++ Input System ++++++++++++++++++++
let iptManager;
let actMapper;

// +++++++++++++++++ Game Loop ++++++++++++++++++++
/** Toggle pause/resume game */
function toggleGame() {
    if (screenTransitioning) return;
    if (!gameActive) {
        gameActive = true;
        gameRefresher = setInterval(refreshGame, GAME_CONFIG.REFRESH_INTERVAL_MS);
    } else {
        gameActive = false;
        if (gameRefresher) clearInterval(gameRefresher);
        gameRefresher = null;
    }
}

/** Reset game to initial state */
function resetGame() {
    CV = new Canvas(GAME_CONFIG.CANVAS_ID, GAME_CONFIG.CANVAS_SCALE);
    gameActive = false;
    gameTick = 0;

    if (gameRefresher) clearInterval(gameRefresher);
    gameRefresher = null;

    iptManager = new InputManager();
    actMapper = new ActionMap(iptManager);
}

/** Start game after setup is complete */
function startGame() {
    gameActive = true;
    if (gameRefresher) clearInterval(gameRefresher);
    gameRefresher = setInterval(refreshGame, GAME_CONFIG.REFRESH_INTERVAL_MS);
}

/** Main game update loop */
function refreshGame() {
    // Update player
    PL.update();

    // Update canvas if player moved
    if (PL.oldX !== PL.x || PL.oldY !== PL.y) {
        CV.update(PL);
    }

    // TODO: Add game logic

    CV.clearAndDraw();

    // Update game tick
    gameTick++;
}

/** Show start screen and begin game flow */
function showStartScreen() {
    screenTransitioning = true;
    resetGame();

    const startScreen = new StartScreen(
        GAME_CONFIG.GAME_TITLE,
        GAME_CONFIG.GAME_SUBTITLE,
        () => {
            buildGame();
            startGame();
            screenTransitioning = false;
        }
    );

    startScreen.show();
}

/** Build player and initialize game entities */
function buildGame() {
    const characterConfig = GAME_CONFIG.CHARACTERS[0];

    PL = new Player({
        path: characterConfig.spriteSrc,
        cv: CV,
        actMap: actMapper,
        width: characterConfig.width,
        height: characterConfig.height,
        kp: characterConfig.speed
    });

    CV.addEntity(PL);
    CV.clearAndDraw();

    // TODO: Add entity spawning logic 🫠
}

// +++++++++++++++++ Event Listeners ++++++++++++++++++++
/** Attach persistent event listeners */
function addBaseListeners() {
    // Pause/Resume with P key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'p' || e.key === 'P') {
            toggleGame();
        }
    });

    // Restart with R key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            if (!screenTransitioning) showStartScreen();
        }
    });
}

// +++++++++++++++++ Initialization ++++++++++++++++++++
/** Initialize game on page load */
function init() {
    addBaseListeners();
    showStartScreen();
}

window.addEventListener('load', init);



// 2. Shared game state (add alongside your other state vars at the top)

// 3. Declare bed variable alongside PL / CV
let bed;

// 4. One-shot interact tracker  (stops E being held down counting as repeated presses)
let interactWasDown = false;

// 5. Inside buildGame(), after creating PL:
function buildGame() {
    // ... existing player setup ...

    bed = new Bed({
        path:      'assets/img/Entities/bed/bed.png',
        width:     128,
        height:    128,
        x:         globalThis.CV_WIDTH  / 2 - 64,   // centre of screen; adjust to room layout
        y:         globalThis.CV_HEIGHT / 2 - 64,
        canvas:    CV,
        gameState: gameState
    });

    CV.addEntity(bed);
}

// 6. Inside refreshGame(), replace / extend the existing body:
function refreshGame() {
    // ── Input ──────────────────────────────────────────
    const interactDown = actMapper.isActive('interact') && !interactWasDown;
    interactWasDown    = actMapper.isActive('interact');

    // ── Update ─────────────────────────────────────────
    PL.update();

    if (PL.oldX !== PL.x || PL.oldY !== PL.y) CV.update(PL);

    bed.update(PL, interactDown);

    // ── Render ─────────────────────────────────────────
    CV.clearAndDraw();          // draws all spatial-grid entities (bed sprite + player)
    bed.drawPrompt();           // "[E] Sleep" label — only when in range
    bed.drawFade();             // black overlay — only when fading / faded

    // ── Day transition check ────────────────────────────
    if (gameState.day1End) {
        clearInterval(gameRefresher);
        gameRefresher = null;
        gameActive    = false;
        // TODO: loadDay2();
    }

    gameTick++;
}




// ─── In main.js ───────────────────────────────────────────────

// 1. Import
import { SweepTask } from './Classes/Tasks/SweepTask.js';

// 2. Declare alongside other task/entity vars
let sweepTask;

// 3. Inside buildGame(), after existing setup:
function buildGame() {
    // ... existing player + bed setup ...

    sweepTask = new SweepTask({
        canvas:     CV,
        onComplete: () => {
            console.log('Sweep task complete!');
            // TODO: trigger next Day 1 task (study task)
        }
    });

    sweepTask.start(); // Day 1 begins immediately with sweeping
}

// 4. Inside refreshGame():
function refreshGame() {
    // ── Input (existing one-shot interact tracker stays) ──
    const interactDown  = actMapper.isActive('interact') && !interactWasDown;
    interactWasDown     = actMapper.isActive('interact');

    // ── Update ────────────────────────────────────────────
    // Only let the player move freely when no task is active
    if (!sweepTask.active) {
        PL.update();
        if (PL.oldX !== PL.x || PL.oldY !== PL.y) CV.update(PL);
    }

    sweepTask.update(iptManager);   // pass the raw InputManager

    bed.update(PL, interactDown);

    // ── Render ────────────────────────────────────────────
    CV.clearAndDraw();
    sweepTask.draw();   // prompt image + progress counter — drawn on top
    bed.drawPrompt();
    bed.drawFade();

    // ── Day transition check ──────────────────────────────
    if (gameState.day1End) {
        clearInterval(gameRefresher);
        gameRefresher = null;
        gameActive    = false;
        // TODO: loadDay2();
    }

    gameTick++;
}