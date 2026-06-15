/**
 *marcus k
 */

'use strict';

import { GAME_CONFIG } from '../config.js';

//shared references provided by main.js when day 1 starts
let CV;
let PL;
let input;
let actMap;
let onComplete;

//order of day 1 map stages and task interactions
const stageOrder = ['sweep', 'study', 'cook', 'bed'];

//full map images shown between minigames
const stageImages = {
    sweep: 'assets/img/Day1Img/1_Sweep.png',
    study: 'assets/img/Day1Img/1_Study.png',
    cook: 'assets/img/Day1Img/1_Cook.png',
    bed: 'assets/img/Day1Img/1_Bed.png'
};

//close up task images and arrow prompts used by the day 1 minigames
const taskAssets = {
    sweepLeft: 'assets/img/Day1Img/1_CloseSweep2.png',
    sweepRight: 'assets/img/Day1Img/1_CloseSweep1.png',
    studyIdle: 'assets/img/Day1Img/1_CloseStudy1.png',
    studyWrite: 'assets/img/Day1Img/1_CloseStudy2.png',
    cookFrames: [
        'assets/img/Day1Img/1_CloseCook1.png',
        'assets/img/Day1Img/1_CloseCook2.png',
        'assets/img/Day1Img/1_CloseCook3.png',
        'assets/img/Day1Img/1_CloseCook4.png'
    ],
    arrows: {
        up: 'assets/img/Arrows/UpArrow.png',
        down: 'assets/img/Arrows/DownArrow.png',
        left: 'assets/img/Arrows/LeftArrow.png',
        right: 'assets/img/Arrows/RightArrow.png'
    }
};

//current day 1 progress and screen mode
const state = {
    stageIndex: 0,
    mode: 'map',
    currentTask: null,
    done: false,
    fadeAlpha: 0,
    eWasDown: false
};

//runtime data for each minigame
const task = {
    sweep: {},
    study: {},
    cook: {}
};

/**
 *starts or resets the complete day 1 sequence
 *@param {object} args day 1 stuff from main.js
 *@param {object} args.canvas canvas wrapper used for drawing
 *@param {object} args.player player used during map sections
 *@param {object} args.inputManager keyboard input manager
 *@param {object} args.actionMap action map for player actions
 *@param {function} args.onDayComplete callback fired when day 1 ends
 *@returns {void}
 */
export function startDay1({ canvas, player, inputManager, actionMap, onDayComplete }) {
    CV = canvas;
    PL = player;
    input = inputManager;
    actMap = actionMap;
    onComplete = onDayComplete;

    state.stageIndex = 0;
    state.mode = 'map';
    state.currentTask = null;
    state.done = false;
    state.fadeAlpha = 0;
    state.eWasDown = false;

    buildTaskAssets();
    CV.setBackground(stageImages.sweep);
    centerPlayer();
}

/**
 *updates day 1 once per game tick
 *@returns {void}
 */
export function updateDay1() {
    if (state.done) return;

    if (state.mode === 'task') {
        updateTask();
        return;
    }

    if (state.mode === 'fade') {
        updateFade();
        return;
    }

    PL.update();
    if (PL.oldX !== PL.x || PL.oldY !== PL.y) {
        CV.update(PL);
    }

    updateMapInteraction();
}

/**
 *draws the current day 1 screen
 *@returns {void}
 */
export function drawDay1() {
    if (state.mode === 'task') {
        CV.clearCanvas();
        drawTask();
        return;
    }

    CV.clearAndDraw();

    if (canInteract()) {
        drawInteractPrompt();
    }

    if (GAME_CONFIG.DEBUG_HITBOXES) {
        drawHitbox();
    }

    if (state.mode === 'fade') {
        drawFade();
    }
}

/**
 *reports whether day 1 has finished
 *@returns {boolean} true when the bed interaction fade is complete
 */
export function isDay1Complete() {
    return state.done;
}

/**
 *loads all task image objects into the task state
 *@returns {void}
 */
function buildTaskAssets() {
    const assets = taskAssets;

    task.sweep = {
        total: 0,
        completed: 0,
        expectedKey: 'ArrowLeft',
        keyWasDown: {},
        leftImage: makeImage(assets.sweepLeft),
        rightImage: makeImage(assets.sweepRight),
        leftArrow: makeImage(assets.arrows.left),
        rightArrow: makeImage(assets.arrows.right)
    };

    task.study = {
        total: 0,
        completed: 0,
        holdCounted: false,
        downHeld: false,
        writeFrame: 0,
        animTick: 0,
        idleImage: makeImage(assets.studyIdle),
        writeImage: makeImage(assets.studyWrite),
        arrowImage: makeImage(assets.arrows.down)
    };

    task.cook = {
        total: 0,
        completed: 0,
        currentPrompt: null,
        frameIndex: 0,
        keyWasDown: {},
        frames: assets.cookFrames.map(path => makeImage(path)),
        arrows: {
            ArrowUp: makeImage(assets.arrows.up),
            ArrowDown: makeImage(assets.arrows.down),
            ArrowLeft: makeImage(assets.arrows.left),
            ArrowRight: makeImage(assets.arrows.right)
        }
    };
}

/**
 *creates an image object from an asset path
 *@param {string} path relative path to the image file
 *@returns {object} loaded image object
 */
function makeImage(path) {
    const image = new Image();
    image.src = path;
    return image;
}

/**
 *checks for map interaction input and starts the correct task
 *@returns {void}
 */
function updateMapInteraction() {
    const eDown = actMap.isActive('interact');
    const eTapped = eDown && !state.eWasDown;
    state.eWasDown = eDown;

    if (!canInteract() || !eTapped) return;

    const stage = getStage();
    if (stage === 'bed') {
        state.mode = 'fade';
        state.fadeAlpha = 0;
        return;
    }

    startTask(stage);
}

/**
 *checks whether the player overlaps the current stage hitbox
 *@returns {boolean} true when the player can press e
 */
function canInteract() {
    const hitbox = GAME_CONFIG.HITBOXES.day1[getStage()];
    if (!hitbox) return false;

    return PL.x < hitbox.x + hitbox.w &&
        PL.x + PL.w > hitbox.x &&
        PL.y < hitbox.y + hitbox.h &&
        PL.y + PL.h > hitbox.y;
}

/**
 *gets the active day 1 stage name
 *@returns {string} current stage id
 */
function getStage() {
    return stageOrder[state.stageIndex];
}

/**
 *starts one of the day 1 minigames
 *@param {string} taskName name of the task to start
 *@returns {void}
 */
function startTask(taskName) {
    state.mode = 'task';
    state.currentTask = taskName;
    state.eWasDown = true;

    if (taskName === 'sweep') {
        task.sweep.total = Math.floor(Math.random() * 16) + 5;
        task.sweep.completed = 0;
        task.sweep.expectedKey = 'ArrowLeft';
        task.sweep.keyWasDown = {};
    }

    if (taskName === 'study') {
        task.study.total = Math.floor(Math.random() * 3) + 3;
        task.study.completed = 0;
        task.study.holdCounted = false;
        task.study.downHeld = false;
        task.study.writeFrame = 0;
        task.study.animTick = 0;
    }

    if (taskName === 'cook') {
        task.cook.total = Math.floor(Math.random() * 3) + 3;
        task.cook.completed = 0;
        task.cook.frameIndex = 0;
        task.cook.keyWasDown = {};
        setNextCookPrompt();
    }
}

/**
 *moves from a finished task to the next map stage
 *@returns {void}
 */
function completeTask() {
    state.mode = 'map';
    state.currentTask = null;
    state.stageIndex++;
    state.eWasDown = true;

    CV.setBackground(stageImages[getStage()]);
    centerPlayer();
}

/**
 *puts the player back in the center of the canvas
 *@returns {void}
 */
function centerPlayer() {
    CV.rmEntity(PL);
    PL.x = Math.round((CV.WIDTH - PL.w) / 2);
    PL.y = Math.round((CV.HEIGHT - PL.h) / 2);
    PL.oldX = PL.x;
    PL.oldY = PL.y;
    CV.addEntity(PL);
}

/**
 *sends updates to the active minigame
 *@returns {void}
 */
function updateTask() {
    if (state.currentTask === 'sweep') updateSweep();
    if (state.currentTask === 'study') updateStudy();
    if (state.currentTask === 'cook') updateCook();
}

/**
 *sends drawing to the active minigame
 *@returns {void}
 */
function drawTask() {
    if (state.currentTask === 'sweep') drawSweep();
    if (state.currentTask === 'study') drawStudy();
    if (state.currentTask === 'cook') drawCook();
}

/**
 *updates the sweep minigame key swapping
 *@returns {void}
 */
function updateSweep() {
    const sweep = task.sweep;
    const down = input.isDown(sweep.expectedKey);
    const tapped = down && !sweep.keyWasDown[sweep.expectedKey];

    sweep.keyWasDown.ArrowLeft = input.isDown('ArrowLeft');
    sweep.keyWasDown.ArrowRight = input.isDown('ArrowRight');

    if (!tapped) return;

    sweep.completed++;
    sweep.expectedKey = sweep.expectedKey === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';

    if (sweep.completed >= sweep.total) {
        completeTask();
    }
}

/**
 *draws the sweep minigame
 *@returns {void}
 */
function drawSweep() {
    const sweep = task.sweep;
    const cx = CV.WIDTH / 2;
    const cy = CV.HEIGHT / 2;
    const broomSize = 600;
    const arrowSize = 500;
    const broom = sweep.expectedKey === 'ArrowLeft' ? sweep.leftImage : sweep.rightImage;
    const arrow = sweep.expectedKey === 'ArrowLeft' ? sweep.leftArrow : sweep.rightArrow;

    CV.BRUSH.drawImage(broom, cx - broomSize / 2, cy - broomSize / 2, broomSize, broomSize);
    CV.BRUSH.drawImage(arrow, cx - arrowSize / 2, cy - arrowSize / 2, arrowSize, arrowSize);
    drawCounter(sweep.completed, sweep.total, cy + broomSize / 2 + 36);
}

/**
 *updates the study minigame hold input
 *@returns {void}
 */
function updateStudy() {
    const study = task.study;
    const downHeld = input.isDown('ArrowDown');

    if (downHeld) {
        study.downHeld = true;
        study.animTick++;

        if (!study.holdCounted) {
            study.holdCounted = true;
            study.completed++;
        }

        if (study.animTick >= 8) {
            study.animTick = 0;
            study.writeFrame = study.writeFrame === 0 ? 1 : 0;
        }
    } else {
        study.downHeld = false;
        study.holdCounted = false;
        study.animTick = 0;
        study.writeFrame = 0;
    }

    if (study.completed >= study.total) {
        completeTask();
    }
}

/**
 *draws the study minigame
 *@returns {void}
 */
function drawStudy() {
    const study = task.study;
    const cx = CV.WIDTH / 2;
    const cy = CV.HEIGHT / 2;
    const studySize = 600;
    const arrowSize = 200;
    const image = study.downHeld && study.writeFrame === 1 ? study.writeImage : study.idleImage;

    CV.BRUSH.drawImage(image, cx - studySize / 2, cy - studySize / 2, studySize, studySize);
    if (!study.downHeld) {
        CV.BRUSH.drawImage(study.arrowImage, cx - arrowSize / 2, cy - arrowSize / 2, arrowSize, arrowSize);
    }
    drawCounter(study.completed, study.total, cy + studySize / 2 + 36);
}

/**
 *updates the cooking prompt minigame
 *@returns {void}
 */
function updateCook() {
    const cook = task.cook;
    const down = input.isDown(cook.currentPrompt);
    const tapped = down && !cook.keyWasDown[cook.currentPrompt];

    //record each arrow key state so one held key only counts once
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
        cook.keyWasDown[key] = input.isDown(key);
    }

    if (!tapped) return;

    cook.completed++;
    cook.frameIndex = (cook.frameIndex + 1) % cook.frames.length;

    if (cook.completed >= cook.total) {
        completeTask();
        return;
    }

    setNextCookPrompt();
}

/**
 *picks the next random cooking arrow prompt
 *@returns {void}
 */
function setNextCookPrompt() {
    const options = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    let next;

    //keep rolling until the next prompt is different
    do {
        next = options[Math.floor(Math.random() * options.length)];
    } while (next === task.cook.currentPrompt);

    task.cook.currentPrompt = next;
    task.cook.keyWasDown = {};
}

/**
 *draws the cooking minigame
 *@returns {void}
 */
function drawCook() {
    const cook = task.cook;
    const cx = CV.WIDTH / 2;
    const cy = CV.HEIGHT / 2;
    const arrowSize = 400;

    CV.BRUSH.drawImage(cook.frames[cook.frameIndex], 0, 0, CV.WIDTH, CV.HEIGHT);
    CV.BRUSH.drawImage(cook.arrows[cook.currentPrompt], cx - arrowSize / 2, cy - arrowSize / 2, arrowSize, arrowSize);
    drawCounter(cook.completed, cook.total, cy + arrowSize / 2 + 36);
}

/**
 *updates the end of day fade
 *@returns {void}
 */
function updateFade() {
    state.fadeAlpha = Math.min(1, state.fadeAlpha + 0.02);

    if (state.fadeAlpha < 1) return;

    state.done = true;
    if (onComplete) onComplete();
}

/**
 *draws the interact prompt at the bottom of the screen
 *@returns {void}
 */
function drawInteractPrompt() {
    const text = 'Interact [E]';
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

/**
 *draws the current shared hitbox for manual tuning
 *@returns {void}
 */
function drawHitbox() {
    const hitbox = GAME_CONFIG.HITBOXES.day1[getStage()];
    if (!hitbox) return;

    CV.BRUSH.save();
    CV.BRUSH.strokeStyle = 'lime';
    CV.BRUSH.lineWidth = 3;
    CV.BRUSH.strokeRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
    CV.BRUSH.restore();
}

/**
 *draws a progress counter for the active minigame
 *@param {number} completed number of successful inputs
 *@param {number} total number of required inputs
 *@param {number} y vertical screen position for the counter
 *@returns {void}
 */
function drawCounter(completed, total, y) {
    CV.BRUSH.save();
    CV.BRUSH.font = 'bold 22px sans-serif';
    CV.BRUSH.fillStyle = 'white';
    CV.BRUSH.textAlign = 'center';
    CV.BRUSH.fillText(`${completed} / ${total}`, CV.WIDTH / 2, y);
    CV.BRUSH.restore();
}

/**
 *draws the fade to black overlay
 *@returns {void}
 */
function drawFade() {
    CV.BRUSH.save();
    CV.BRUSH.globalAlpha = state.fadeAlpha;
    CV.BRUSH.fillStyle = 'black';
    CV.BRUSH.fillRect(0, 0, CV.WIDTH, CV.HEIGHT);
    CV.BRUSH.restore();
}
