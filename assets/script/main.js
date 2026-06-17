/**
 * By: David Fu
 */
'use strict';

import { StartScreen } from './Classes/UI/StartScreen.js';
import { InputManager } from './Classes/Player/InputManager.js';
import { ActionMap } from './Classes/Player/ActionMap.js';
import { Player } from './Classes/Player/Player.js';
import { Canvas } from './Classes/GameScreen/Canvas.js';
import { GAME_CONFIG } from './config.js';
import { startDay1, updateDay1, drawDay1, isDay1Complete } from './Day 1/Day1.js';
import { startDay2, updateDay2, drawDay2, isDay2Complete, isDay2SecretGameOver, stopDay2 } from './Day 2/Day2.js';
import { startDay3, updateDay3, drawDay3, isDay3Complete, stopDay3 } from './Day 3/Day3.js';

// +++++++++++++++++ Game State ++++++++++++++++++++
let CV;
let PL;
let gameActive = false;
let gameRefresher = null;
let gameTick = 0;
let screenTransitioning = false;
const gameState = {
    activeDay: 1,
    day1End: false,
    day3End: false
};

// +++++++++++++++++ Input System ++++++++++++++++++++
let iptManager;
let actMapper;

// +++++++++++++++++ Game Loop ++++++++++++++++++++
/** Reset game to initial state */
function resetGame() {
    CV = new Canvas(GAME_CONFIG.CANVAS_ID, GAME_CONFIG.CANVAS_SCALE);
    gameActive = false;
    gameTick = 0;
    gameState.currentDay = 1;
    gameState.day1End = false;
    gameState.day2End = false;
    stopDay2();
    stopDay3();

    // clear game refresher interval if active
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
    // run update/draw for the active day (1)
    if (gameState.currentDay == 1) {
        updateDay1();
        drawDay1();

        // advance to day 2 once day 1 tasks are done
        if (isDay1Complete()) {
            startDay2({
                canvas: CV,
                player: PL,
                inputManager: iptManager,
                actionMap: actMapper,
                onDayComplete: () => { gameState.day2End = true; }
            });
            gameState.currentDay = 2;
        }
    } else if (gameState.currentDay == 2) { // run update/draw for the active day (2)
        updateDay2();
        drawDay2();

        // trigger secret game over if secret condition is met
        if (isDay2SecretGameOver()) {
            gameActive = false;
            if (gameRefresher) clearInterval(gameRefresher);
            gameRefresher = null;
        } else if (isDay2Complete()) { // advance to day 2 once day 1 tasks are done
            startDay3({
                canvas: CV,
                player: PL,
                inputManager: iptManager,
                actionMap: actMapper,
                onDayComplete: () => { gameState.day3End = true; }
            });
            gameState.currentDay = 3;
            gameActive = true;
        }
    } else if (gameState.currentDay == 3) { // run update/draw for the active day (3)
        updateDay3();
        drawDay3();

        // end game loop once day 3 objectives are met
        if (isDay3Complete()) {
            gameActive = false;
            if (gameRefresher) clearInterval(gameRefresher);
            gameRefresher = null;
        }
    }

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
        sprites: characterConfig.sprites,
        cv: CV,
        actMap: actMapper,
        width: characterConfig.width,
        height: characterConfig.height,
        kp: characterConfig.speed
    });

    PL.x = Math.round((CV.WIDTH - PL.w) / 2);
    PL.y = Math.round((CV.HEIGHT - PL.h) / 2);

    CV.addEntity(PL);
    gameState.activeDay = 1;
    gameState.day1End = false;
    gameState.day3End = false;
    startDay1({
        canvas: CV,
        player: PL,
        inputManager: iptManager,
        actionMap: actMapper,
        onDayComplete: () => { gameState.day1End = true; }
    });
    CV.clearAndDraw();
}

/** Callback to directly start day 3, skipping previous days and states */
function startDay3Sequence() {
    gameState.activeDay = 3;
    startDay3({
        canvas: CV,
        player: PL,
        inputManager: iptManager,
        actionMap: actMapper,
        onDayComplete: () => { gameState.day3End = true; }
    });
}

// +++++++++++++++++ Event Listeners ++++++++++++++++++++
/** Attach persistent event listeners */
function addBaseListeners() {
    // Restart with R key
    window.addEventListener('keydown', (e) => {
        // check if restart key is pressed to restart game
        if (e.key == 'r' || e.key == 'R') {
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
