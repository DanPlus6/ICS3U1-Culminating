'use strict';

import { StartScreen } from './Classes/UI/StartScreen.js';
import { InputManager } from './Classes/Player/InputManager.js';
import { ActionMap } from './Classes/Player/ActionMap.js';
import { Player } from './Classes/Player/Player.js';
import { Canvas } from './Classes/GameScreen/Canvas.js';
import { GAME_CONFIG } from './config.js';

// +++++++++++++++++ Game State ++++++++++++++++++++
let CV;
let PL;
let gameActive = false;
let gameRefresher = null;
let gameTick = 0;
let screenTransitioning = false;

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
