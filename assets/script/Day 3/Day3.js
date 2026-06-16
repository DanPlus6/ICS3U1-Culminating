/**
 * By: David Fu
 */
'use strict';

import { GAME_CONFIG } from '../config.js';

// +++++++++++++++++ Game Essentials ++++++++++++++++++++
let CV;
let PL;
let input;
let actMap;
let onComplete;

// +++++++++++++++++ Stage Setup ++++++++++++++++++++
/** Ordered list of task stages for day 3 */
const stageOrder = ['sticky', 'board', 'closet'];

/** Background image paths for each stage */
const stageImages = {
    sticky: 'assets/img/Day3Img/3_Sticky.png',
    board: 'assets/img/Day3Img/3_Board.png',
    closet: 'assets/img/Day3Img/3_Closet.png'
};

/** Close-up and task-specific image paths */
const taskAssets = {
    stickyClose: 'assets/img/Day3Img/3_CloseSticky.png',
    boardClose: 'assets/img/Day3Img/3_CloseBoard.png',
    woodBoard: 'assets/img/Day3Img/3_WoodBoard.png',
    closetFront: 'assets/img/Day3Img/3_ClosetFront.png',
    closetSide1: 'assets/img/Day3Img/3_ClosetSide1.png',
    closetSide2: 'assets/img/Day3Img/3_ClosetSide2.png',
    jumpscare: 'assets/img/Day3Img/3_Jumpscare.png',
    ending: 'assets/img/Mortis.jpg'
};

/** Audio file paths for day 3 */
const audioAssets = {
    ambience: 'assets/audio/Day3.mp3',
    waterDrop: 'assets/audio/Day3WaterDrop.mp3',
    knocking: 'assets/audio/KnockingSFX.mp3',
    closet: 'assets/audio/Day3Closet.mp3',
    jumpscare: 'assets/audio/JumpscareScream.mp3'
};

// +++++++++++++++++ Day State ++++++++++++++++++++
/** state of current stage, mode, and day-level flags */
const state = {
    stageIndex: 0,
    // current stage mode: map, task,  fade, ending
    mode: 'map',
    currentTask: null,
    done: false,
    fadeAlpha: 0,
    eWasDown: false,
    endDelay: 0
};

/** mouse position and button state relative to the canvas */
const mouse = {
    x: 0,
    y: 0,
    down: false
};

// +++++++++++++++++ Task State ++++++++++++++++++++
/** runtime state for tasks */
const task = {
    sticky: {},
    board: {},
    closet: {}
};

/** references to active mouse event listeners for later removal */
const listeners = {
    mouseMove: null,
    mouseDown: null,
    mouseUp: null
};

/** runtime audio objects and the water drop interval timer */
const dayAudio = {
    ambience: null,
    waterDrop: null,
    knocking: null,
    // time since last ambient sound was played
    waterDropTimerMs: 0 
};

// +++++++++++++++++ Day Mgmt Essentials ++++++++++++++++++++

/**
 * Callback for initializing/starting day 3
 * @param {Object} param destructured object containing arguments
 * @param {Canvas} param.canvas reference to game canvas for day 3
 * @param {Player} param.player reference to player object for day 3
 * @param {InputManager} param.inputManager reference to input manager object for day 3
 * @param {ActionMap} param.actionMap reference to action mapper object for day 3
 * @param {Function} param.onDayComplete callback fired when day 3 is complete
 */
export function startDay3({ canvas, player, inputManager, actionMap, onDayComplete }) {
    CV = canvas;
    PL = player;
    input = inputManager;
    actMap = actionMap;
    onComplete = onDayComplete;

    // reset all day state
    state.stageIndex = 0;
    state.mode = 'map';
    state.currentTask = null;
    state.done = false;
    state.fadeAlpha = 0;
    state.eWasDown = false;
    state.endDelay = 0;

    buildTaskAssets();
    startDay3Audio();
    installMouseListeners();
    CV.setBackground(stageImages.sticky);
    placePlayerNearBed();
}

/**
 * Callback for updating each frame of day 3
 */
export function updateDay3() {
    // skip all updates once the day is finished
    if (state.done) return;

    updateDay3Audio();

    // check if in task or fade mode to perform updates
    if (state.mode == 'task') {
        updateTask();
        return;
    } else if (state.mode == 'fade') {
        updateFade();
        return;
    }

    // update player movement and canvas scroll when on map mode
    PL.update();
    if (PL.oldX !== PL.x || PL.oldY !== PL.y) {
        CV.update(PL);
    }

    updateMapInteraction();
}

/**
 * Entrypoint for drawing each frame of day 3
 */
export function drawDay3() {
    // draw task view fullscreen, skip map rendering
    if (state.mode == 'task') {
        CV.clearCanvas();
        drawTask();
        return;
    }

    // draw ending screen fullscreen once fade is complete
    if (state.mode == 'ending') {
        CV.clearCanvas();
        drawEnding();
        return;
    }

    CV.clearAndDraw();

    // show interact prompt when player is in range of the current stage object
    if (canInteract()) {
        drawInteractPrompt();
    }

    // draw hitboxes on top of everything else when debug mode is enabled
    if (GAME_CONFIG.DEBUG_HITBOXES) {
        drawHitbox();
    }

    // overlay the fade-to-black while transitioning between stages
    if (state.mode == 'fade') {
        drawFade();
    }
}

/**
 * Callback for checking day 3 completion status.
 * @returns {boolean} true when the day's final fade and ending sequence are complete
 */
export function isDay3Complete() {
    return state.done;
}

// +++++++++++++++++ Asset Setup ++++++++++++++++++++

/**
 * Builds and assigns all image and audio assets needed for day 3 tasks.
 * Populates the task and dayAudio objects.
 */
function buildTaskAssets() {
    // set up looping ambience and one-shot ambient sound effects
    dayAudio.ambience = new Audio(audioAssets.ambience);
    dayAudio.ambience.loop = true;
    dayAudio.ambience.volume = 0.55;
    dayAudio.waterDrop = new Audio(audioAssets.waterDrop);
    dayAudio.waterDrop.volume = 0.8;
    dayAudio.knocking = new Audio(audioAssets.knocking);
    dayAudio.knocking.volume = 1;

    // sticky note task only needs a single close-up image
    task.sticky = {
        image: makeImage(taskAssets.stickyClose)
    };

    // board task needs a background, a board sprite, and runtime drag state
    task.board = {
        background: makeImage(taskAssets.boardClose),
        boardImage: makeImage(taskAssets.woodBoard),
        draggingIndex: -1,
        dragOffsetX: 0,
        dragOffsetY: 0,
        boards: []
    };

    // closet task needs images, audio, timing, and typing minigame state
    task.closet = {
        front: makeImage(taskAssets.closetFront),
        sideImages: [
            makeImage(taskAssets.closetSide1),
            makeImage(taskAssets.closetSide2)
        ],
        jumpscareImage: makeImage(taskAssets.jumpscare),
        endingImage: makeImage(taskAssets.ending),
        closetAudio: new Audio(audioAssets.closet),
        jumpscareAudio: new Audio(audioAssets.jumpscare),
        // randomized total hold duration
        durationMs: 0,
        // time spent holding the closet shut
        elapsedMs: 0,           
        // time left before the closet breaks open
        gaugeMs: 1000,          
        // time since last closet sound effect
        closetAudioTimerMs: 0,  
        // shuffled WASD key sequence to type
        sequence: [],           
        sequenceIndex: 0,
        currentKey: 'W',
        // previous frame key states for tap detection
        keyWasDown: {},         
        failed: false,
        finished: false,
        // delay timer after pass/fail before advancing
        endDelay: 0             
    };
}

/**
 * Creates image object with given source path
 * @param {string} path path to the image asset
 * @returns {HTMLImageElement} the image element with src set
 */
function makeImage(path) {
    const image = new Image();
    image.src = path;
    return image;
}

// +++++++++++++++++ Audio ++++++++++++++++++++

/**
 * Resets the water drop timer and starts the day 3 ambience track from the beginning.
 */
function startDay3Audio() {
    dayAudio.waterDropTimerMs = 0;

    // catch edge case: ambience not built
    if (!dayAudio.ambience) return;

    dayAudio.ambience.currentTime = 0;
    dayAudio.ambience.play().catch(() => {});
}

/**
 * fire random ambient sound (knocking or water drop) on periodic interval
 */
function updateDay3Audio() {
    dayAudio.waterDropTimerMs += GAME_CONFIG.REFRESH_INTERVAL_MS;

    // only play a sound every 6 seconds
    if (dayAudio.waterDropTimerMs < 6000) return;

    dayAudio.waterDropTimerMs = 0;
    // 30% chance of knocking, otherwise a water drop
    const ambienceSound = Math.random() < 0.3 ? dayAudio.knocking : dayAudio.waterDrop;
    if (ambienceSound) playSound(ambienceSound);
}

/**
 * stops and resets all day 3 ambient audio tracks
 */
function stopDay3Audio() {
    // stop each track and rewind so it can be replayed cleanly on restart
    for (const audio of [dayAudio.ambience, dayAudio.waterDrop, dayAudio.knocking]) {
        if (!audio) continue;
        audio.pause();
        audio.currentTime = 0;
    }
}

// +++++++++++++++++ Mouse Listeners ++++++++++++++++++++

/**
 * Attach mouse listeners to canvas
 */
function installMouseListeners() {
    removeMouseListeners();

    // track scaled mouse position relative to canvas
    listeners.mouseMove = event => {
        const rect = CV.CANVAS.getBoundingClientRect();
        mouse.x = (event.clientX - rect.left) * (CV.WIDTH / rect.width);
        mouse.y = (event.clientY - rect.top) * (CV.HEIGHT / rect.height);
    };

    listeners.mouseDown = () => {
        mouse.down = true;
        // only start a board drag while the board task is active
        if (state.mode == 'task' && state.currentTask == 'board') {
            startBoardDrag();
        }
    };

    listeners.mouseUp = () => {
        mouse.down = false;
        // only resolve a board drag while the board task is active
        if (state.mode == 'task' && state.currentTask == 'board') {
            stopBoardDrag();
        }
    };

    CV.CANVAS.addEventListener('mousemove', listeners.mouseMove);
    CV.CANVAS.addEventListener('mousedown', listeners.mouseDown);
    // mouseup is on window so releasing outside the canvas still registers
    window.addEventListener('mouseup', listeners.mouseUp);
}

/**
 * removes all mouse listeners attached by installMouseListeners and clears their references
 */
function removeMouseListeners() {
    // skip if listeners were never installed
    if (!CV || !listeners.mouseMove) return;

    CV.CANVAS.removeEventListener('mousemove', listeners.mouseMove);
    CV.CANVAS.removeEventListener('mousedown', listeners.mouseDown);
    window.removeEventListener('mouseup', listeners.mouseUp);

    listeners.mouseMove = null;
    listeners.mouseDown = null;
    listeners.mouseUp = null;
}

// +++++++++++++++++ Map Interaction ++++++++++++++++++++

/**
 * Check for a tap of the interact key while on the map and starts the current stage's task
 */
function updateMapInteraction() {
    const eDown = actMap.isActive('interact');
    const eTapped = eDown && !state.eWasDown; // true only on the frame E is first pressed
    state.eWasDown = eDown;

    // ignore if not in range or E wasn't freshly tapped
    if (!canInteract() || !eTapped) return;

    startTask(getStage());
}

/**
 * Check whether player's bounding box overlaps the current stage's hitbox.
 * @returns {boolean} true if the player is within interact range
 */
function canInteract() {
    const hitbox = GAME_CONFIG.HITBOXES.day3[getHitboxName()];
    if (!hitbox) return false;

    // AABB overlap check between player and hitbox
    return PL.x < hitbox.x + hitbox.w &&
        PL.x + PL.w > hitbox.x &&
        PL.y < hitbox.y + hitbox.h &&
        PL.y + PL.h > hitbox.y;
}

/**
 * Get name of the current stage based on stageIndex
 * @returns {string} the current stage name
 */
function getStage() {
    return stageOrder[state.stageIndex];
}

/**
 * maps current stage name to corresponding hitbox config key
 * @returns {string} the hitbox key to look up in GAME_CONFIG.HITBOXES.day3
 */
function getHitboxName() {
    const stage = getStage();
    if (stage == 'sticky') return 'note2';
    if (stage == 'board') return 'blinds';
    return 'closet';
}

// +++++++++++++++++ Task Flow ++++++++++++++++++++

/**
 * Transitions into task mode and initializes state for the given task if needed.
 * @param {string} taskName the task to start (sticky, board, closet)
 */
function startTask(taskName) {
    state.mode = 'task';
    state.currentTask = taskName;
    state.eWasDown = true; // prevent the same E press from immediately completing the task

    // only board and closet tasks need initialization
    if (taskName == 'board') {
        resetBoardTask();
    } else if (taskName == 'closet') {
        resetClosetTask();
    }
}

/**
 * Marks the current task as complete, advances the stage, and either begins
 * the end-of-day fade or transitions the map to the next stage.
 */
function completeTask() {
    state.currentTask = null;
    state.stageIndex++;
    state.eWasDown = true; // prevent immediate re-interaction on the next map frame

    // begin fade to ending if stages/tasks done
    if (state.stageIndex >= stageOrder.length) {
        state.mode = 'fade';
        state.fadeAlpha = 0;
        return;
    }

    // advance to the next stage's map background and player position
    state.mode = 'map';
    CV.setBackground(stageImages[getStage()]);
    placePlayerForStage(getStage());
}

// +++++++++++++++++ Player Placement ++++++++++++++++++++

/**
 * places player at the starting position near bed
 */
function placePlayerNearBed() {
    placePlayer(1220, 700);
}

/**
 * places player at the appropriate starting position for the given stage
 * @param {string} stage the stage name to position the player for
 */
function placePlayerForStage(stage) {
    // check task to place player after completion
    if (stage == 'board') {
        placePlayer(900, 280);
        return;
    } else if (stage == 'closet') {
        placePlayer(1450, 480);
        return;
    }

    // default to the bed position for any other stage
    placePlayerNearBed();
}

/**
 * Remove player from the canvas, sets their position clamped to canvas bounds, and readd player
 * @param {number} x desired world x coordinate
 * @param {number} y desired world y coordinate
 */
function placePlayer(x, y) {
    CV.rmEntity(PL);
    PL.x = Math.max(0, Math.min(CV.WIDTH - PL.w, x));
    PL.y = Math.max(0, Math.min(CV.HEIGHT - PL.h, y));
    PL.oldX = PL.x;
    PL.oldY = PL.y;
    CV.addEntity(PL);
}

// +++++++++++++++++ Task Update ++++++++++++++++++++

/**
 * Call update callback to task handler of current task
 */
function updateTask() {
    if (state.currentTask == 'sticky') updateSticky();
    if (state.currentTask == 'board') updateBoard();
    if (state.currentTask == 'closet') updateCloset();
}

/**
 * Call draw callback to task handler of current task
 */
function drawTask() {
    if (state.currentTask == 'sticky') drawSticky();
    if (state.currentTask == 'board') drawBoard();
    if (state.currentTask == 'closet') drawCloset();
}

// +++++++++++++++++ Sticky Task ++++++++++++++++++++

/**
 * Update sticky note task, wait for the player to press E to dismiss the note
 */
function updateSticky() {
    const eDown = actMap.isActive('interact');
    const eTapped = eDown && !state.eWasDown;
    state.eWasDown = eDown;

    // complete the task on a fresh E press
    if (eTapped) {
        completeTask();
    }
}

/**
 * Draw the sticky note close-up and a prompt to continue.
 */
function drawSticky() {
    CV.BRUSH.drawImage(task.sticky.image, 0, 0, CV.WIDTH, CV.HEIGHT);
    drawPromptText('Press E after reading');
}

// +++++++++++++++++ Board Task ++++++++++++++++++++

/**
 * Reset the board task by repositioning all boards to their starting locations.
 */
function resetBoardTask() {
    const boardW = 680;
    const boardH = 250;
    const startY = CV.HEIGHT - 310;

    task.board.draggingIndex = -1;
    // create three boards with staggered start positions and angled targets
    task.board.boards = [
        makeBoard(120, startY, boardW, boardH, 440, 205, -16),
        makeBoard(620, startY, boardW, boardH, 620, 320, 9),
        makeBoard(1120, startY, boardW, boardH, 780, 435, -8)
    ];
}

/**
 * Create board data object with the given transform and target position.
 * @param {number} x initial x position
 * @param {number} y initial y position
 * @param {number} w board width
 * @param {number} h board height
 * @param {number} targetX x position the board snaps to when close enough
 * @param {number} targetY y position the board snaps to when close enough
 * @param {number} angle rotation angle in degrees when drawn at the target
 * @returns {{
 *  x: number, y: number, w: number, h: number,
 *  targetX: number, targetY: number, angle: number,
 *  placed: boolean }}
 */
function makeBoard(x, y, w, h, targetX, targetY, angle) {
    return {
        x,
        y,
        w,
        h,
        targetX,
        targetY,
        angle,
        placed: false
    };
}

/**
 * Update board task each frame, moves dragged board with mouse
 */
function updateBoard() {
    // follow the mouse if a board is being dragged
    if (task.board.draggingIndex >= 0) {
        const board = task.board.boards[task.board.draggingIndex];
        board.x = mouse.x - task.board.dragOffsetX;
        board.y = mouse.y - task.board.dragOffsetY;
    }

    // complete the task once every board has been placed in its target zone
    if (task.board.boards.every(board => board.placed)) {
        completeTask();
    }
}

/**
 * Picks up the topmost unplaced board under the mouse cursor on mouse down.
 */
function startBoardDrag() {
    // iterate in reverse so the topmost (last-drawn) board is picked up first
    for (let i = task.board.boards.length - 1; i >= 0; i--) {
        const board = task.board.boards[i];
        if (board.placed || !pointInRect(mouse.x, mouse.y, board)) continue;

        task.board.draggingIndex = i;
        task.board.dragOffsetX = mouse.x - board.x;
        task.board.dragOffsetY = mouse.y - board.y;
        return;
    }
}

/**
 * Releases the currently dragged board, snaps to target location if close enough
 */
function stopBoardDrag() {
    const index = task.board.draggingIndex;
    if (index < 0) return;

    const board = task.board.boards[index];
    const targetCenterX = board.targetX + board.w / 2;
    const targetCenterY = board.targetY + board.h / 2;
    const boardCenterX = board.x + board.w / 2;
    const boardCenterY = board.y + board.h / 2;
    const distance = Math.hypot(targetCenterX - boardCenterX, targetCenterY - boardCenterY);

    // snap to target if dropped within 230px of the target center
    if (distance < 230) {
        board.x = board.targetX;
        board.y = board.targetY;
        board.placed = true;
    }

    task.board.draggingIndex = -1;
}

/**
 * Returns true if the point (x, y) is inside the given rectangle.
 * @param {number} x the x coordinate to test
 * @param {number} y the y coordinate to test
 * @param {{ x: number, y: number, w: number, h: number }} rect the rectangle to test against
 * @returns {boolean}
 */
function pointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w &&
        y >= rect.y && y <= rect.y + rect.h;
}

/**
 * Draws the board task: the background, all board pieces, and the placement progress prompt.
 */
function drawBoard() {
    CV.BRUSH.drawImage(task.board.background, 0, 0, CV.WIDTH, CV.HEIGHT);

    // draw each board piece with its current position and rotation
    for (const board of task.board.boards) {
        drawBoardPiece(board);
    }

    drawPromptText(`drag boards to barricade the window    ${task.board.boards.filter(board => board.placed).length} / 3`);
}

/**
 * Draws a single board piece rotated around its center, slightly transparent if placed.
 * @param {{ x: number, y: number, w: number, h: number, angle: number, placed: boolean }} board the board to draw
 */
function drawBoardPiece(board) {
    const cx = board.x + board.w / 2;
    const cy = board.y + board.h / 2;

    CV.BRUSH.save();
    CV.BRUSH.translate(cx, cy);
    CV.BRUSH.rotate(board.angle * Math.PI / 180);
    // slightly fade placed boards to indicate they're locked in
    CV.BRUSH.globalAlpha = board.placed ? 0.95 : 1;
    CV.BRUSH.drawImage(task.board.boardImage, -board.w / 2, -board.h / 2, board.w, board.h);
    CV.BRUSH.restore();
}

// +++++++++++++++++ Closet Task ++++++++++++++++++++

/**
 * Resets all closet task state and generates a new randomized hold duration and key sequence.
 */
function resetClosetTask() {
    const closet = task.closet;

    // randomize how long the player must hold the closet shut (5–15 seconds)
    closet.durationMs = (Math.floor(Math.random() * 11) + 5) * 1000;
    closet.elapsedMs = 0;
    closet.gaugeMs = 1000;
    closet.closetAudioTimerMs = 0;
    closet.sequence = shuffleKeys();
    closet.sequenceIndex = 0;
    closet.currentKey = closet.sequence[closet.sequenceIndex];
    closet.keyWasDown = getWasdState();
    closet.failed = false;
    closet.finished = false;
    closet.endDelay = 0;
}

/**
 * Updates the closet task each frame. Handles the end-delay after pass/fail,
 * advances timers, triggers ambient audio, and checks win/fail conditions.
 */
function updateCloset() {
    const closet = task.closet;

    // wait a second after finishing or failing before advancing
    if (closet.failed || closet.finished) {
        closet.endDelay += GAME_CONFIG.REFRESH_INTERVAL_MS;
        if (closet.endDelay >= 1000) {
            completeTask();
        }
        return;
    }

    const dt = GAME_CONFIG.REFRESH_INTERVAL_MS;
    closet.elapsedMs += dt;
    closet.gaugeMs -= dt;
    closet.closetAudioTimerMs += dt;

    // play a random closet sound every 3 seconds with 50% probability
    if (closet.closetAudioTimerMs >= 3000) {
        closet.closetAudioTimerMs = 0;
        if (Math.random() < 0.5) {
            playSound(closet.closetAudio);
        }
    }

    updateClosetTyping();

    // trigger jumpscare and fail if the gauge runs out
    if (closet.gaugeMs <= 0) {
        closet.failed = true;
        closet.gaugeMs = 0;
        playSound(closet.jumpscareAudio);
        return;
    }

    // mark as finished once the player has held on long enough
    if (closet.elapsedMs >= closet.durationMs) {
        closet.finished = true;
    }
}

/**
 * Checks if the player pressed the expected key and advances the typing sequence 
 * and reset gauge on each correct key press
 */
function updateClosetTyping() {
    const closet = task.closet;
    const expected = closet.currentKey;
    const down = input.isDown(expected) || input.isDown(expected.toLowerCase());
    const tapped = down && !closet.keyWasDown[expected];

    closet.keyWasDown = getWasdState();

    // ignore held keys, only respond to fresh taps
    if (!tapped) return;
    
    // reset the gauge on a correct press
    closet.gaugeMs = 1000; 
    closet.sequenceIndex++;

    // loop back to a new shuffled sequence when the current one is exhausted
    if (closet.sequenceIndex >= closet.sequence.length) {
        closet.sequence = shuffleKeys();
        closet.sequenceIndex = 0;
    }

    closet.currentKey = closet.sequence[closet.sequenceIndex];
}

/**
 * Returns an object mapping each WASD key to whether it is currently held down.
 * @returns {{ W: boolean, A: boolean, S: boolean, D: boolean }}
 */
function getWasdState() {
    const states = {};

    // check both uppercase and lowercase for each WASD key
    for (const key of ['W', 'A', 'S', 'D']) {
        states[key] = input.isDown(key) || input.isDown(key.toLowerCase());
    }

    return states;
}

/**
 * Returns a new array of WASD keys in a random order using a Fisher-Yates shuffle.
 * @returns {string[]} shuffled key press sequence
 */
function shuffleKeys() {
    const keys = ['W', 'A', 'S', 'D'];

    // shuffle key press sequence using Fisher-Yates shuffle
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    return keys;
}

/**
 * Draws the closet task. Shows the jumpscare image on failure,
 * otherwise draws the closet front with typing prompt and progress bars.
 */
function drawCloset() {
    const closet = task.closet;

    // show jumpscare fullscreen on failure
    if (closet.failed) {
        CV.BRUSH.drawImage(closet.jumpscareImage, 0, 0, CV.WIDTH, CV.HEIGHT);
        return;
    }

    CV.BRUSH.drawImage(closet.front, 0, 0, CV.WIDTH, CV.HEIGHT);
    drawClosetTypingPrompt();
    drawClosetBars();
    drawBottomCaption('Keep. The. Closet. Closed.');
}

/**
 * Draws the centered typing prompt box showing the current expected key and upcoming sequence.
 */
function drawClosetTypingPrompt() {
    const closet = task.closet;
    const cx = CV.WIDTH / 2;
    const cy = CV.HEIGHT / 2;

    CV.BRUSH.save();
    CV.BRUSH.textAlign = 'center';
    CV.BRUSH.textBaseline = 'middle';

    // semi-transparent background panel
    CV.BRUSH.fillStyle = 'rgba(0, 0, 0, 0.64)';
    CV.BRUSH.beginPath();
    CV.BRUSH.roundRect(cx - 160, cy - 150, 320, 300, 10);
    CV.BRUSH.fill();

    // large current key
    CV.BRUSH.font = 'bold 132px sans-serif';
    CV.BRUSH.fillStyle = 'white';
    CV.BRUSH.fillText(closet.currentKey, cx, cy - 36);

    // smaller upcoming sequence below
    CV.BRUSH.font = 'bold 24px sans-serif';
    CV.BRUSH.fillText(closet.sequence.join('  '), cx, cy + 96);
    CV.BRUSH.restore();
}

/**
 * Draws the two progress bars: a gauge bar (time before door breaks open)
 * and a survival bar (total time held).
 */
function drawClosetBars() {
    const closet = task.closet;

    // red gauge bar — depletes if the player stops pressing keys
    drawBar({
        x: (CV.WIDTH - 520) / 2,
        y: CV.HEIGHT - 120,
        w: 520,
        h: 22,
        progress: closet.gaugeMs / 1000,
        fill: 'rgba(220, 40, 40, 0.92)'
    });

    // white survival bar — fills as the player holds on
    drawBar({
        x: (CV.WIDTH - 520) / 2,
        y: CV.HEIGHT - 78,
        w: 520,
        h: 14,
        progress: closet.elapsedMs / closet.durationMs,
        fill: 'rgba(235, 235, 235, 0.92)'
    });
}

/**
 * Draws a progress bar with a dark background and a filled foreground.
 * @param {{ x: number, y: number, w: number, h: number, progress: number, fill: string }} param bar config
 */
function drawBar({ x, y, w, h, progress, fill }) {
    CV.BRUSH.save();
    CV.BRUSH.fillStyle = 'rgba(0, 0, 0, 0.62)';
    CV.BRUSH.fillRect(x, y, w, h); // background track
    CV.BRUSH.fillStyle = fill;
    CV.BRUSH.fillRect(x, y, w * Math.max(0, Math.min(1, progress)), h); // clamped fill
    CV.BRUSH.restore();
}

/**
 * Draws a centered caption with a rounded semi-transparent background at the bottom of the screen.
 * @param {string} text the caption text to display
 */
function drawBottomCaption(text) {
    const cx = CV.WIDTH / 2;
    const cy = CV.HEIGHT - 34;
    const paddingX = 22;

    CV.BRUSH.save();
    CV.BRUSH.font = 'bold 22px sans-serif';
    CV.BRUSH.textAlign = 'center';

    const textWidth = CV.BRUSH.measureText(text).width;
    CV.BRUSH.fillStyle = 'rgba(0, 0, 0, 0.68)';
    CV.BRUSH.beginPath();
    CV.BRUSH.roundRect(cx - textWidth / 2 - paddingX, cy - 25, textWidth + paddingX * 2, 40, 8);
    CV.BRUSH.fill();

    CV.BRUSH.fillStyle = 'white';
    CV.BRUSH.fillText(text, cx, cy);
    CV.BRUSH.restore();
}

// +++++++++++++++++ Audio ++++++++++++++++++++

/**
 * Rewinds and plays an audio element, ignoring any autoplay rejection errors.
 * @param {HTMLAudioElement} audio the audio element to play
 */
function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

// +++++++++++++++++ Transition / Ending ++++++++++++++++++++

/**
 * Advances fade-to-black overlay each frame
 */
function updateFade() {
    state.fadeAlpha = Math.min(1, state.fadeAlpha + 0.02);

    // wait until the screen is fully black before switching to ending mode
    if (state.fadeAlpha < 1) return;

    state.mode = 'ending';
    state.done = true;
    stopDay3Audio();
    removeMouseListeners();
    if (onComplete) onComplete();
}

/**
 * Draws the ending screen: the ending image with a dark overlay and a restart prompt.
 */
function drawEnding() {
    CV.BRUSH.drawImage(task.closet.endingImage, 0, 0, CV.WIDTH, CV.HEIGHT);

    CV.BRUSH.save();
    // dark overlay to improve text legibility over the ending image
    CV.BRUSH.fillStyle = 'rgba(0, 0, 0, 0.56)';
    CV.BRUSH.fillRect(0, 0, CV.WIDTH, CV.HEIGHT);

    CV.BRUSH.font = 'bold 38px sans-serif';
    CV.BRUSH.fillStyle = 'white';
    CV.BRUSH.textAlign = 'center';
    CV.BRUSH.textBaseline = 'middle';
    CV.BRUSH.fillText('Press [R] to restart.', CV.WIDTH / 2, CV.HEIGHT - 96);
    CV.BRUSH.restore();
}

// +++++++++++++++++ Shared UI Utilities ++++++++++++++++++++

/**
 * Draws the standard "Interact [E]" prompt at the bottom of the screen.
 */
function drawInteractPrompt() {
    drawPromptText('Interact [E]');
}

/**
 * Draws a centered prompt pill with a semi-transparent background near the bottom of the screen.
 * @param {string} text the text to display in the prompt
 */
function drawPromptText(text) {
    const cx = CV.WIDTH / 2;
    const cy = CV.HEIGHT - 44;
    const paddingX = 24;

    CV.BRUSH.save();
    CV.BRUSH.font = 'bold 20px sans-serif';
    CV.BRUSH.textAlign = 'center';

    const textWidth = CV.BRUSH.measureText(text).width;
    const boxX = cx - textWidth / 2 - paddingX;
    const boxY = cy - 24;
    const boxW = textWidth + paddingX * 2;
    const boxH = 38;

    CV.BRUSH.fillStyle = 'rgba(0, 0, 0, 0.65)';
    CV.BRUSH.beginPath();
    CV.BRUSH.roundRect(boxX, boxY, boxW, boxH, 8);
    CV.BRUSH.fill();

    CV.BRUSH.fillStyle = 'white';
    CV.BRUSH.fillText(text, cx, cy);
    CV.BRUSH.restore();
}

// +++++++++++++++++ Debug ++++++++++++++++++++

/**
 * Draw a lime-green outline around current stage's hitbox for debugging
 */
function drawHitbox() {
    const hitbox = GAME_CONFIG.HITBOXES.day3[getHitboxName()];
    if (!hitbox) return;

    CV.BRUSH.save();
    CV.BRUSH.strokeStyle = 'lime';
    CV.BRUSH.lineWidth = 3;
    CV.BRUSH.strokeRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
    CV.BRUSH.restore();
}

/**
 * Draw current fade-to-black overlay (state.fadeAlpha = opacity)
 */
function drawFade() {
    CV.BRUSH.save();
    CV.BRUSH.globalAlpha = state.fadeAlpha;
    CV.BRUSH.fillStyle = 'black';
    CV.BRUSH.fillRect(0, 0, CV.WIDTH, CV.HEIGHT);
    CV.BRUSH.restore();
}
