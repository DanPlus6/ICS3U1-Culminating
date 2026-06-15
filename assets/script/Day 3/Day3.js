/**
 * Day 3 sequence
 */
'use strict';

import { GAME_CONFIG } from '../config.js';

let CV;
let PL;
let input;
let actMap;
let onComplete;

const stageOrder = ['sticky', 'board', 'closet'];

const stageImages = {
    sticky: 'assets/img/Day3Img/3_Sticky.png',
    board: 'assets/img/Day3Img/3_Board.png',
    closet: 'assets/img/Day3Img/3_Closet.png'
};

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

const audioAssets = {
    ambience: 'assets/audio/Day3.mp3',
    waterDrop: 'assets/audio/Day3WaterDrop.mp3',
    knocking: 'assets/audio/KnockingSFX.mp3',
    closet: 'assets/audio/Day3Closet.mp3',
    jumpscare: 'assets/audio/JumpscareScream.mp3'
};

const state = {
    stageIndex: 0,
    mode: 'map',
    currentTask: null,
    done: false,
    fadeAlpha: 0,
    eWasDown: false,
    endDelay: 0
};

const mouse = {
    x: 0,
    y: 0,
    down: false
};

const task = {
    sticky: {},
    board: {},
    closet: {}
};

const dayAudio = {
    ambience: null,
    waterDrop: null,
    knocking: null,
    waterDropTimerMs: 0
};

const listeners = {
    mouseMove: null,
    mouseDown: null,
    mouseUp: null
};

export function startDay3({ canvas, player, inputManager, actionMap, onDayComplete }) {
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
    state.endDelay = 0;

    buildTaskAssets();
    startDay3Audio();
    installMouseListeners();
    CV.setBackground(stageImages.sticky);
    placePlayerNearBed();
}

export function updateDay3() {
    if (state.done) return;

    updateDay3Audio();

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

export function drawDay3() {
    if (state.mode === 'task') {
        CV.clearCanvas();
        drawTask();
        return;
    }

    if (state.mode === 'ending') {
        CV.clearCanvas();
        drawEnding();
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

export function isDay3Complete() {
    return state.done;
}

function buildTaskAssets() {
    dayAudio.ambience = new Audio(audioAssets.ambience);
    dayAudio.ambience.loop = true;
    dayAudio.ambience.volume = 0.55;
    dayAudio.waterDrop = new Audio(audioAssets.waterDrop);
    dayAudio.waterDrop.volume = 0.8;
    dayAudio.knocking = new Audio(audioAssets.knocking);
    dayAudio.knocking.volume = 0.8;

    task.sticky = {
        image: makeImage(taskAssets.stickyClose)
    };

    task.board = {
        background: makeImage(taskAssets.boardClose),
        boardImage: makeImage(taskAssets.woodBoard),
        draggingIndex: -1,
        dragOffsetX: 0,
        dragOffsetY: 0,
        boards: []
    };

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
        durationMs: 0,
        elapsedMs: 0,
        gaugeMs: 1000,
        closetAudioTimerMs: 0,
        sequence: [],
        sequenceIndex: 0,
        currentKey: 'W',
        keyWasDown: {},
        failed: false,
        finished: false,
        endDelay: 0
    };
}

function makeImage(path) {
    const image = new Image();
    image.src = path;
    return image;
}

function startDay3Audio() {
    dayAudio.waterDropTimerMs = 0;

    if (!dayAudio.ambience) return;

    dayAudio.ambience.currentTime = 0;
    dayAudio.ambience.play().catch(() => {});
}

function updateDay3Audio() {
    dayAudio.waterDropTimerMs += GAME_CONFIG.REFRESH_INTERVAL_MS;

    if (dayAudio.waterDropTimerMs < 6000) return;

    dayAudio.waterDropTimerMs = 0;
    const ambienceSound = Math.random() < 0.3 ? dayAudio.knocking : dayAudio.waterDrop;
    if (ambienceSound) playSound(ambienceSound);
}

function stopDay3Audio() {
    for (const audio of [dayAudio.ambience, dayAudio.waterDrop, dayAudio.knocking]) {
        if (!audio) continue;
        audio.pause();
        audio.currentTime = 0;
    }
}

function installMouseListeners() {
    removeMouseListeners();

    listeners.mouseMove = event => {
        const rect = CV.CANVAS.getBoundingClientRect();
        mouse.x = (event.clientX - rect.left) * (CV.WIDTH / rect.width);
        mouse.y = (event.clientY - rect.top) * (CV.HEIGHT / rect.height);
    };
    listeners.mouseDown = () => {
        mouse.down = true;
        if (state.mode === 'task' && state.currentTask === 'board') {
            startBoardDrag();
        }
    };
    listeners.mouseUp = () => {
        mouse.down = false;
        if (state.mode === 'task' && state.currentTask === 'board') {
            stopBoardDrag();
        }
    };

    CV.CANVAS.addEventListener('mousemove', listeners.mouseMove);
    CV.CANVAS.addEventListener('mousedown', listeners.mouseDown);
    window.addEventListener('mouseup', listeners.mouseUp);
}

function removeMouseListeners() {
    if (!CV || !listeners.mouseMove) return;

    CV.CANVAS.removeEventListener('mousemove', listeners.mouseMove);
    CV.CANVAS.removeEventListener('mousedown', listeners.mouseDown);
    window.removeEventListener('mouseup', listeners.mouseUp);

    listeners.mouseMove = null;
    listeners.mouseDown = null;
    listeners.mouseUp = null;
}

function updateMapInteraction() {
    const eDown = actMap.isActive('interact');
    const eTapped = eDown && !state.eWasDown;
    state.eWasDown = eDown;

    if (!canInteract() || !eTapped) return;

    startTask(getStage());
}

function canInteract() {
    const hitbox = GAME_CONFIG.HITBOXES.day3[getHitboxName()];
    if (!hitbox) return false;

    return PL.x < hitbox.x + hitbox.w &&
        PL.x + PL.w > hitbox.x &&
        PL.y < hitbox.y + hitbox.h &&
        PL.y + PL.h > hitbox.y;
}

function getStage() {
    return stageOrder[state.stageIndex];
}

function getHitboxName() {
    const stage = getStage();
    if (stage === 'sticky') return 'note2';
    if (stage === 'board') return 'blinds';
    return 'closet';
}

function startTask(taskName) {
    state.mode = 'task';
    state.currentTask = taskName;
    state.eWasDown = true;

    if (taskName === 'board') {
        resetBoardTask();
    }

    if (taskName === 'closet') {
        resetClosetTask();
    }
}

function completeTask() {
    state.currentTask = null;
    state.stageIndex++;
    state.eWasDown = true;

    if (state.stageIndex >= stageOrder.length) {
        state.mode = 'fade';
        state.fadeAlpha = 0;
        return;
    }

    state.mode = 'map';
    CV.setBackground(stageImages[getStage()]);
    placePlayerForStage(getStage());
}

function placePlayerNearBed() {
    placePlayer(1220, 700);
}

function placePlayerForStage(stage) {
    if (stage === 'board') {
        placePlayer(900, 280);
        return;
    }

    if (stage === 'closet') {
        placePlayer(1450, 480);
        return;
    }

    placePlayerNearBed();
}

function placePlayer(x, y) {
    CV.rmEntity(PL);
    PL.x = Math.max(0, Math.min(CV.WIDTH - PL.w, x));
    PL.y = Math.max(0, Math.min(CV.HEIGHT - PL.h, y));
    PL.oldX = PL.x;
    PL.oldY = PL.y;
    CV.addEntity(PL);
}

function updateTask() {
    if (state.currentTask === 'sticky') updateSticky();
    if (state.currentTask === 'board') updateBoard();
    if (state.currentTask === 'closet') updateCloset();
}

function drawTask() {
    if (state.currentTask === 'sticky') drawSticky();
    if (state.currentTask === 'board') drawBoard();
    if (state.currentTask === 'closet') drawCloset();
}

function updateSticky() {
    const eDown = actMap.isActive('interact');
    const eTapped = eDown && !state.eWasDown;
    state.eWasDown = eDown;

    if (eTapped) {
        completeTask();
    }
}

function drawSticky() {
    CV.BRUSH.drawImage(task.sticky.image, 0, 0, CV.WIDTH, CV.HEIGHT);
    drawPromptText('Press E after reading');
}

function resetBoardTask() {
    const boardW = 680;
    const boardH = 250;
    const startY = CV.HEIGHT - 310;

    task.board.draggingIndex = -1;
    task.board.boards = [
        makeBoard(120, startY, boardW, boardH, 440, 205, -16),
        makeBoard(620, startY, boardW, boardH, 620, 320, 9),
        makeBoard(1120, startY, boardW, boardH, 780, 435, -8)
    ];
}

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

function updateBoard() {
    if (task.board.draggingIndex >= 0) {
        const board = task.board.boards[task.board.draggingIndex];
        board.x = mouse.x - task.board.dragOffsetX;
        board.y = mouse.y - task.board.dragOffsetY;
    }

    if (task.board.boards.every(board => board.placed)) {
        completeTask();
    }
}

function startBoardDrag() {
    for (let i = task.board.boards.length - 1; i >= 0; i--) {
        const board = task.board.boards[i];
        if (board.placed || !pointInRect(mouse.x, mouse.y, board)) continue;

        task.board.draggingIndex = i;
        task.board.dragOffsetX = mouse.x - board.x;
        task.board.dragOffsetY = mouse.y - board.y;
        return;
    }
}

function stopBoardDrag() {
    const index = task.board.draggingIndex;
    if (index < 0) return;

    const board = task.board.boards[index];
    const targetCenterX = board.targetX + board.w / 2;
    const targetCenterY = board.targetY + board.h / 2;
    const boardCenterX = board.x + board.w / 2;
    const boardCenterY = board.y + board.h / 2;
    const distance = Math.hypot(targetCenterX - boardCenterX, targetCenterY - boardCenterY);

    if (distance < 230) {
        board.x = board.targetX;
        board.y = board.targetY;
        board.placed = true;
    }

    task.board.draggingIndex = -1;
}

function pointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w &&
        y >= rect.y && y <= rect.y + rect.h;
}

function drawBoard() {
    CV.BRUSH.drawImage(task.board.background, 0, 0, CV.WIDTH, CV.HEIGHT);

    for (const board of task.board.boards) {
        drawBoardPiece(board);
    }

    drawPromptText(`drag boards to barricade the window    ${task.board.boards.filter(board => board.placed).length} / 3`);
}

function drawBoardPiece(board) {
    const cx = board.x + board.w / 2;
    const cy = board.y + board.h / 2;

    CV.BRUSH.save();
    CV.BRUSH.translate(cx, cy);
    CV.BRUSH.rotate(board.angle * Math.PI / 180);
    CV.BRUSH.globalAlpha = board.placed ? 0.95 : 1;
    CV.BRUSH.drawImage(task.board.boardImage, -board.w / 2, -board.h / 2, board.w, board.h);
    CV.BRUSH.restore();
}

function resetClosetTask() {
    const closet = task.closet;

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

function updateCloset() {
    const closet = task.closet;

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

    if (closet.closetAudioTimerMs >= 3000) {
        closet.closetAudioTimerMs = 0;
        if (Math.random() < 0.5) {
            playSound(closet.closetAudio);
        }
    }

    updateClosetTyping();

    if (closet.gaugeMs <= 0) {
        closet.failed = true;
        closet.gaugeMs = 0;
        playSound(closet.jumpscareAudio);
        return;
    }

    if (closet.elapsedMs >= closet.durationMs) {
        closet.finished = true;
    }
}

function updateClosetTyping() {
    const closet = task.closet;
    const expected = closet.currentKey;
    const down = input.isDown(expected) || input.isDown(expected.toLowerCase());
    const tapped = down && !closet.keyWasDown[expected];

    closet.keyWasDown = getWasdState();

    if (!tapped) return;

    closet.gaugeMs = 1000;
    closet.sequenceIndex++;

    if (closet.sequenceIndex >= closet.sequence.length) {
        closet.sequence = shuffleKeys();
        closet.sequenceIndex = 0;
    }

    closet.currentKey = closet.sequence[closet.sequenceIndex];
}

function getWasdState() {
    const states = {};

    for (const key of ['W', 'A', 'S', 'D']) {
        states[key] = input.isDown(key) || input.isDown(key.toLowerCase());
    }

    return states;
}

function shuffleKeys() {
    const keys = ['W', 'A', 'S', 'D'];

    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    return keys;
}

function drawCloset() {
    const closet = task.closet;

    if (closet.failed) {
        CV.BRUSH.drawImage(closet.jumpscareImage, 0, 0, CV.WIDTH, CV.HEIGHT);
        return;
    }

    CV.BRUSH.drawImage(closet.front, 0, 0, CV.WIDTH, CV.HEIGHT);
    drawClosetTypingPrompt();
    drawClosetBars();
    drawBottomCaption('Keep. The. Closet. Closed.');
}

function drawClosetTypingPrompt() {
    const closet = task.closet;
    const cx = CV.WIDTH / 2;
    const cy = CV.HEIGHT / 2;

    CV.BRUSH.save();
    CV.BRUSH.textAlign = 'center';
    CV.BRUSH.textBaseline = 'middle';

    CV.BRUSH.fillStyle = 'rgba(0, 0, 0, 0.64)';
    CV.BRUSH.beginPath();
    CV.BRUSH.roundRect(cx - 160, cy - 150, 320, 300, 10);
    CV.BRUSH.fill();

    CV.BRUSH.font = 'bold 132px sans-serif';
    CV.BRUSH.fillStyle = 'white';
    CV.BRUSH.fillText(closet.currentKey, cx, cy - 36);

    CV.BRUSH.font = 'bold 24px sans-serif';
    CV.BRUSH.fillText(closet.sequence.join('  '), cx, cy + 96);
    CV.BRUSH.restore();
}

function drawClosetBars() {
    const closet = task.closet;

    drawBar({
        x: (CV.WIDTH - 520) / 2,
        y: CV.HEIGHT - 120,
        w: 520,
        h: 22,
        progress: closet.gaugeMs / 1000,
        fill: 'rgba(220, 40, 40, 0.92)'
    });

    drawBar({
        x: (CV.WIDTH - 520) / 2,
        y: CV.HEIGHT - 78,
        w: 520,
        h: 14,
        progress: closet.elapsedMs / closet.durationMs,
        fill: 'rgba(235, 235, 235, 0.92)'
    });
}

function drawBar({ x, y, w, h, progress, fill }) {
    CV.BRUSH.save();
    CV.BRUSH.fillStyle = 'rgba(0, 0, 0, 0.62)';
    CV.BRUSH.fillRect(x, y, w, h);
    CV.BRUSH.fillStyle = fill;
    CV.BRUSH.fillRect(x, y, w * Math.max(0, Math.min(1, progress)), h);
    CV.BRUSH.restore();
}

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

function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

function updateFade() {
    state.fadeAlpha = Math.min(1, state.fadeAlpha + 0.02);

    if (state.fadeAlpha < 1) return;

    state.mode = 'ending';
    state.done = true;
    stopDay3Audio();
    removeMouseListeners();
    if (onComplete) onComplete();
}

function drawEnding() {
    CV.BRUSH.drawImage(task.closet.endingImage, 0, 0, CV.WIDTH, CV.HEIGHT);

    CV.BRUSH.save();
    CV.BRUSH.fillStyle = 'rgba(0, 0, 0, 0.56)';
    CV.BRUSH.fillRect(0, 0, CV.WIDTH, CV.HEIGHT);

    CV.BRUSH.font = 'bold 38px sans-serif';
    CV.BRUSH.fillStyle = 'white';
    CV.BRUSH.textAlign = 'center';
    CV.BRUSH.textBaseline = 'middle';
    CV.BRUSH.fillText('Press [R] to restart.', CV.WIDTH / 2, CV.HEIGHT - 96);
    CV.BRUSH.restore();
}

function drawInteractPrompt() {
    drawPromptText('Interact [E]');
}

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

function drawHitbox() {
    const hitbox = GAME_CONFIG.HITBOXES.day3[getHitboxName()];
    if (!hitbox) return;

    CV.BRUSH.save();
    CV.BRUSH.strokeStyle = 'lime';
    CV.BRUSH.lineWidth = 3;
    CV.BRUSH.strokeRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
    CV.BRUSH.restore();
}

function drawFade() {
    CV.BRUSH.save();
    CV.BRUSH.globalAlpha = state.fadeAlpha;
    CV.BRUSH.fillStyle = 'black';
    CV.BRUSH.fillRect(0, 0, CV.WIDTH, CV.HEIGHT);
    CV.BRUSH.restore();
}
