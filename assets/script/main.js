'use strict';

import { CharacterSelect } from './Classes/UI/StartScreen.js';
import { InputManager } from './Classes/Player/InputManager.js';
import { ActionMap } from './Classes/Player/ActionMap.js';
import { Entity } from './Classes/Entities/Entity.js';
import { Player } from './Classes/Player/Player.js';
import { Canvas } from './Classes/GameScreen/Canvas.js';

// +++++++++++++++++ Init variables ++++++++++++++++++++
// ------------ Canvas -----------
/** game screen/canvas */
let CV;

// ----------- Player ------------
/** available characters for user to select */
const CHARACTERS = [
    {
        id: 'gamer',
        label: 'Gamer',
        description: 'mom I need an RTX 9090 TI for school I swear...',
        spriteSrc: 'assets/img/PlayerAvatar/trollge.png',
        width: 140,
        height: 140,
        speed: 8
    }
];
/** the character config the player chose on the selection screen */
let userType;
/** player object */
let PL;
/** active spawned hardware entities */
let hardwareEntities;
/** prevent held space from re-picking items every frame */
let pickupPressed;

// HTML targets
const DIV_WIN_OVERLAY = document.getElementById('win-overlay');
const P_WIN_MESSAGE = document.getElementById('win-message');
const IMG_WIN_COMPUTER = document.getElementById('win-computer-image');

// ---------- Game Essentials -----------
// HTML targets
const BTN_TOGGLE_CLOCK = document.getElementById('btn-toggle-clock');
const BTN_RESET_CLOCK = document.getElementById('btn-reset-clock');
const H_GAME_CLOCK = document.getElementById('h-gameclock');

/** variable to track if game is running (not paused) */
let gameActive;
/** variable storing game refresher's timeout timer */
let gameRefresher;
/** interval between game refreshes/"frames" in miliseconds */
const REFRESH_INTV = 20;
/** variable to store game's current tick ( there are 1000/REFRESH_INTV ticks per second ) */
let gameTick = 0;
/** variable to track whether selection phase is active to prevent overlap */
let charSelecting = false;

// ------- Player Movement ---------
/** input manager that listens player input (keyboard events) */
let iptManager;
/** action map that maps keyboard events to player actions (e.g. movements) */
let actMapper;

// ++++++++++++++++++++++ Game Essentials +++++++++++++++++++++++
/** toggles the game clock and pauses/unpauses the game */
function toggleGame() {
    // Ignore toggle presses while still on the selection screen
    if (charSelecting) return;
    // Do not allow the finished run to be started again.
    if (!DIV_WIN_OVERLAY.classList.contains('hidden')) return;

    // Pause the game if it is currently running.
    // Pause game if active
    if (gameActive) {
        gameActive = false;
        BTN_TOGGLE_CLOCK.textContent = 'Start';
        clearInterval(gameRefresher);
        gameRefresher = null;
    }
    // Resume game is paused 
    else {
        gameActive = true;
        BTN_TOGGLE_CLOCK.textContent = 'Pause';
        gameRefresher = setInterval(refreshGame, REFRESH_INTV);
    }
}

/** callback to clear/reset the active game elements */
function resetGame() {
    // Canvas
    CV = new Canvas('game-canvas', 96);

    // Game clock
    gameActive = false;
    gameTick = 0;
    H_GAME_CLOCK.textContent = 'Time: 0s';
    BTN_TOGGLE_CLOCK.textContent = 'Start';
    // Clear game refresher interval if already active
    if (gameRefresher) clearInterval(gameRefresher);
    gameRefresher = null;


    // Player Movement
    iptManager = new InputManager();
    actMapper  = new ActionMap(iptManager);

    // Hardware collection
    hardwareEntities = [];
    pickupPressed = false;

    P_WIN_MESSAGE.textContent = '';

    IMG_WIN_COMPUTER.removeAttribute('src');
    DIV_WIN_OVERLAY.classList.add('hidden');
}

/** start a fresh active run after the player has been built */
function startGame() {
    gameActive = true;
    BTN_TOGGLE_CLOCK.textContent = 'Pause';
    // Prevent duplicate refresh loops before starting a new one
    if (gameRefresher) clearInterval(gameRefresher);
    gameRefresher = setInterval(refreshGame, REFRESH_INTV);
}

/** stop the run and show the win overlay */
function showWinOverlay() {
    gameActive = false;
    // Stop the active refresh loop before showing the win screen
    if (gameRefresher) clearInterval(gameRefresher);
    gameRefresher = null;
    BTN_TOGGLE_CLOCK.textContent = 'Start';
}

/** restart the game as if it's the beginning */
function restartGame() {
    // Prevent overlap if character selection is already active
    if (charSelecting) return;
    charSelecting = true;

    // Game reset
    resetGame();

    // Character selection
    const charSelect = new CharacterSelect(CHARACTERS, (chosen) => {
        userType = chosen;
        build();
        startGame();
        charSelecting = false;
    });

    charSelect.show();
}

/**
 * Check whether two entities overlap using AABB collision
 * @param {Entity} a first entity
 * @param {Entity} b second entity
 * @returns {boolean} whether the entities overlap
 */
function isOverlapping(a, b) {
    return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;
}

/**
 * Place an entity at a random position that does not overlap anything already placed
 * @param {Entity} entity the entity to place
 * @param {Entity[]} existingEntities entities already placed on the canvas
 */
function placeEntityRandomly(entity, existingEntities) {
    const maxX = CV.WIDTH - entity.w;
    const maxY = CV.HEIGHT - entity.h;
    const maxAttempts = 500;

    // Attempt within a limited number of tries to spawn a random entity without overlap
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        entity.x = Math.floor(Math.random() * (maxX + 1));
        entity.y = Math.floor(Math.random() * (maxY + 1));

        // accept current random position only if it does not overlap an existing entity
        if (!existingEntities.some(existing => isOverlapping(entity, existing))) return;
    }

    throw new Error(`Unable to place ${entity.id} without overlap 🤡.`);
}

/** spawn all hardware entities for the selected character */
function spawnHardwareEntities() {
    const placedEntities = [PL];

    // loop through hardware entities for selected character and attempt to spawn them randomly w/o overlap
    for (const hardwareType of HARDWARE_TYPES) {
        const entity = new Entity({
            path: `assets/img/Entities/${userType.id}/${hardwareType}.png`
        });
        entity.pickedUp = false;

        placeEntityRandomly(entity, placedEntities);
        CV.addEntity(entity);
        placedEntities.push(entity);
        hardwareEntities.push(entity);
    }
}

/**
 * Get all hardware entities the player is currently touching
 * @returns {Entity[]} touched hardware entities
 */
function getTouchedHardware() {
    return hardwareEntities.filter(entity => isOverlapping(PL, entity));
}

/** handle hardware touch display and pickup behavior */
function handleHardwareInteractions() {
    const touchedHardware = getTouchedHardware();
    const infoTarget = touchedHardware[0] || null;

    // only process pickup logic while the pickup key is being held.
    if (actMapper.isActive('pickupItem')) {
        // Only count the pickup once per key press.
        if (!pickupPressed) {
            const touchedSet = new Set(touchedHardware);

            for (const entity of touchedHardware) {
                CV.rmEntity(entity);
            }

            hardwareEntities = hardwareEntities.filter(entity => !touchedSet.has(entity));
        }
        pickupPressed = true;
    }
    else {
        pickupPressed = false;
    }
}

/** refresh game, ran on each frame */
function refreshGame() {
    // Update entities and game screen
    PL.update();
    // update player grid cell only after actual position change
    if (PL.oldX != PL.x || PL.oldY != PL.y) {
        CV.update(PL);
        lastMoveTime = gameTime;
        hasEverMoved = true;
    }
    handleHardwareInteractions();

    CV.clearAndDraw();

    // Game clock
    gameTick = (gameTick + 1) % (1000 / REFRESH_INTV);
    // If enough ticks have passed (a second has elapsed), increment the visual game clock
    if (gameTick === 0) gameTime++;
    H_GAME_CLOCK.textContent = `Time: ${gameTime.toString()}s`;
}

/** attaches base event listeners that persist between game resets */
function addBaseListeners() {
    // Game toggling
    BTN_TOGGLE_CLOCK.addEventListener('click', toggleGame);
    window.addEventListener('keydown', e=>{
        // Toggle the game only when the P key is pressed.
        if(e.key == 'p' || e.key == 'P') toggleGame();
    });

    // Game resetting
    BTN_RESET_CLOCK.addEventListener('click', restartGame);
    window.addEventListener('keydown', e=>{
        // Restart the game only when the R key is pressed.
        if(e.key == 'r' || e.key == 'R') restartGame();
    });
}

// ++++++++++++++++++++ Initialization +++++++++++++++++++++
/** page onload callback */
function init() {
    addBaseListeners();
    restartGame();
}

/** build the user set by the selection screen */
function build() {
    // Build player from whichever character the player selected
    PL = new Player({ 
        path: userType.spriteSrc, cv: CV, actMap: actMapper,
        width: userType.width, height: userType.height, kp: userType.speed
    });
    CV.addEntity(PL);
    spawnHardwareEntities();

    CV.clearAndDraw();
}

// run onload initialization function once page loads
window.addEventListener('load', init);
