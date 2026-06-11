'use strict';

import { CharacterSelect } from './Classes/UI/CharacterSelect.js';
import { InputManager } from './Classes/Player/InputManager.js';
import { ActionMap } from './Classes/Player/ActionMap.js';
import { Entity } from './Classes/Entities/Entity.js';
import { Player } from './Classes/Player/Player.js';
import { Canvas } from './Classes/GameScreen/Canvas.js';

import { BarrelRoll } from './functions/BarrelRoll.js';
import { Epilepsy } from './functions/Epilepsy.js';


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
        speed: 8,
        bank: {
            'cpu' : [
                'A gamer benefits from a fast mid-range or high-end CPU because games need strong single-core speed for smooth frame rates.',
                'Modern games also use multiple cores, so 6 to 8 cores is a strong target for gaming and background apps like voice chat or recording.'
            ],
            'gpu' : [
                'The GPU matters a lot for gamers because it renders the graphics, lighting, textures, and visual effects you see on screen.',
                'Higher resolutions and higher graphics settings need a stronger graphics card, especially for ray tracing or very high refresh rate monitors.'
            ],
            'ram' : [
                'Gamers should usually aim for at least 16 GB of RAM so the game, operating system, and background apps can all run comfortably.',
                'If the player likes modded games, streaming, or heavy multitasking, 32 GB can be even better.'
            ],
            'ssd' : [
                'An SSD helps games load much faster, reduces waiting times, and makes the whole system feel more responsive.',
                'Large modern games take a lot of space, so a gamer often wants a bigger SSD to store several games at once.'
            ],
            'motherboard' : [
                'A gamer needs a motherboard that supports the chosen CPU, enough RAM slots, and useful features like fast USB ports and good cooling support.',
                'It should also have room for future upgrades such as more storage or a better graphics card.'
            ],
            'mouse' : [
                'For gaming, a mouse should feel comfortable, respond quickly, and have a sensor that tracks movement accurately.',
                'Extra buttons can also help in some games by making actions easier to reach.'
            ]
        }
    }
];
/** the character config the player chose on the selection screen */
let userType;
/** player object */
let PL;

// ----------- Hardware Collection ------------
/** bank storing general information about a computer hardware part that does not vary depending on user type */
const BANK = {
    'cpu' : 'You have picked up the CPU. The CPU is the main processor of the computer and follows instructions, performs calculations, and helps run programs.',
    'gpu' : 'You have picked up the GPU. The GPU is responsible for rendering graphics, images, video, and visual effects, and it is especially important for games and 3D work.',
    'ram' : 'You have picked up the RAM. RAM is short-term memory that stores data the computer is actively using so programs can access it quickly.',
    'ssd' : 'You have picked up the SSD. An SSD is long-term storage that keeps files, programs, and the operating system saved even when the computer is turned off.',
    'motherboard' : 'You have picked up the motherboard. The motherboard is the main circuit board that connects all the computer parts together so they can communicate.',
    'mouse' : 'You have picked up the mouse. A mouse is an input device used to move the pointer, click on items, and interact with programs on the computer.'
}
/** ordered list of hardware part ids to spawn on the canvas */
const HARDWARE_TYPES = Object.keys(BANK);
/** track how many items the user has picked up so far */
let itemsPicked;
/** active spawned hardware entities */
let hardwareEntities;
/** prevent held space from re-picking items every frame */
let pickupPressed;

// Hints
/** floating hint element created in script */
let controlsHintEl;
/** single control hint shown when the player is stuck */
const CONTROL_HINT = 'Hint: Use W A S D or the arrow keys to move.';
/** single pickup hint shown when the player hasn't picked anything up */
const PICKUP_HINT = 'Walk into hardware to inspect it, then press Space to pick it up.';
/** track time when player last moved */
let lastMoveTime;
/** track time when player last picked up a hardware part */
let lastPickupTime;
/** track if player has ever moved */
let hasEverMoved;

// HTML targets
const LINE_1 = document.getElementById('text-ln1');
const LINE_2 = document.getElementById('text-ln2');
const LINE_3 = document.getElementById('text-ln3');
const H_ITEMS_COUNTER = document.getElementById('h-itemspicked');
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
/** variable to store game's clock time in seconds  */
let gameTime;
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

// Miscellaneous Global Properties
/** barrel roll state */
globalThis.barrelRolling = false;
/** epilepsy state */
globalThis.givingEpilepsy = false;
/** epilepsy "warning" state */
globalThis.epilepsyWarning = false;
/** whether the user has been warned */
globalThis.epilepsyWarned = false;

/** create the floating hint element once without relying on pre-existing HTML */
function ensureControlsHint() {
    if (controlsHintEl) return;

    controlsHintEl = document.createElement('div');
    controlsHintEl.className = 'controls-hint hidden';
    document.body.appendChild(controlsHintEl);
}

/** show a hint message in the floating hint element */
function showControlsHint(message) {
    ensureControlsHint();
    controlsHintEl.textContent = message;
    controlsHintEl.classList.remove('hidden');
}

/** hide the floating hint element */
function hideControlsHint() {
    ensureControlsHint();
    controlsHintEl.classList.add('hidden');
}


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
    gameTime = 0;
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
    itemsPicked = 0;
    hardwareEntities = [];
    pickupPressed = false;

    LINE_1.textContent = '';
    LINE_2.textContent = '';
    LINE_3.textContent = '';

    H_ITEMS_COUNTER.textContent = '';
    P_WIN_MESSAGE.textContent = '';

    IMG_WIN_COMPUTER.removeAttribute('src');
    DIV_WIN_OVERLAY.classList.add('hidden');
    
    lastMoveTime  = 0;
    lastPickupTime = 0;
    hasEverMoved  = false;

    hideControlsHint();
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

    P_WIN_MESSAGE.textContent = `You built the computer in ${gameTime} seconds.`;
    IMG_WIN_COMPUTER.src = `assets/img/Entities/${userType.id}/computer.png`;
    DIV_WIN_OVERLAY.classList.remove('hidden');
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
 * Show three text lines for the currently touched hardware entity
 * @param {Entity|null} entity touched hardware entity
 */
function displayHardwareInfo(entity) {
    // clear text display when the player is not touching any hardware.
    if (!entity) {
        LINE_1.textContent = '';
        LINE_2.textContent = '';
        LINE_3.textContent = '';
        return;
    }

    const specificBank = userType.bank[entity.id] || [];
    LINE_1.textContent = BANK[entity.id] || '';
    LINE_2.textContent = specificBank[0] || '';
    LINE_3.textContent = specificBank[1] || '';
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

    displayHardwareInfo(infoTarget);

    // only process pickup logic while the pickup key is being held.
    if (actMapper.isActive('pickupItem')) {
        // Only count the pickup once per key press.
        if (!pickupPressed) {
            const touchedSet = new Set(touchedHardware);

            for (const entity of touchedHardware) {
                itemsPicked++;
                CV.rmEntity(entity);
            }
            lastPickupTime = gameTime;

            hardwareEntities = hardwareEntities.filter(entity => !touchedSet.has(entity));
            H_ITEMS_COUNTER.textContent = `Items Picked up: ${itemsPicked}/${HARDWARE_TYPES.length}`;
            hideControlsHint();

            // end run once every required hardware part has been collected.
            if (itemsPicked === HARDWARE_TYPES.length) showWinOverlay();
        }
        pickupPressed = true;
    }
    else {
        pickupPressed = false;
    }
}

/** show control hints only if the player appears to be stuck/not know how to play the game */
function handleControlsHints() {
    if (!gameActive || charSelecting || itemsPicked >= HARDWARE_TYPES.length) {
        hideControlsHint();
        return;
    }

    const timeSinceMove = gameTime - lastMoveTime;
    const timeSincePickup = gameTime - lastPickupTime;

    // if player has been idle for 5s, remind them how to move
    if (timeSinceMove >= 5) {
        showControlsHint(CONTROL_HINT);
    } // if player is moving but hasn't collected anything for 10s
    else if (hasEverMoved && timeSincePickup >= 10) {
        showControlsHint(PICKUP_HINT);
    } else {
        hideControlsHint();
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

    // Miscellaneous
    // Trigger the barrel roll effect only when its hotkey is active.
    if (actMapper.isActive('barrelRoll')) BarrelRoll();
    // Give the user a jumpscare if they press the key they were told not to press
    if (actMapper.isActive('epilespy')) Epilepsy();
    handleControlsHints();
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
    ensureControlsHint();
    addBaseListeners();
    restartGame();
}

/** build the user set by the selection screen */
function build() {
    H_ITEMS_COUNTER.textContent = `Items Picked up: ${itemsPicked}/${HARDWARE_TYPES.length}`;

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
