/**MARCUS K. */

'use strict';

'use strict';

import { Canvas } from '../GameScreen/Canvas.js';

export class CookTask {
    /**
     * Cooking minigame for Day 1.
     * A random arrow prompt appears in the centre of the screen.
     * Player taps the matching arrow key. Each correct tap cycles the
     * background cooking image. Must complete a random number of prompts (3–5).
     *
     * Prompt images  (centre of screen — swap paths for real sprites):
     *   assets/img/UI/cook_arrow_up.png
     *   assets/img/UI/cook_arrow_down.png
     *   assets/img/UI/cook_arrow_left.png
     *   assets/img/UI/cook_arrow_right.png
     *
     * Background images  (full-screen cooking scene — swap paths for real sprites):
     *   assets/img/BG/cook_bg_0.png  …  cook_bg_3.png   (4 frames, cycles on each correct tap)
     *
     * @param {Object}   args
     * @param {Canvas}   args.canvas      active Canvas instance
     * @param {Function} args.onComplete  callback fired when task is finished
     */
    constructor({ canvas, onComplete }) {
        /** @type {Canvas} */
        this.canvas = canvas;

        /** Called when the cook task is fully complete */
        this.onComplete = onComplete;

        /** Total number of prompts required this run (3–5) */
        this.totalPrompts = this._randomTotal();

        /** How many prompts the player has correctly tapped so far */
        this.promptsCompleted = 0;

        /** Whether the task is currently running */
        this.active = false;

        /**
         * The arrow key the player currently needs to press.
         * One of: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
         */
        this.currentPrompt = null;

        // ── One-shot key guards ───────────────────────────────────────
        this._upWasDown    = false;
        this._downWasDown  = false;
        this._leftWasDown  = false;
        this._rightWasDown = false;

        // ── Background image cycling ──────────────────────────────────
        /** Index into the background image array (advances on each correct tap) */
        this._bgIndex = 0;

        const BG_COUNT = 4;
        this._bgImages = Array.from({ length: BG_COUNT }, (_, i) =>
            this._loadImage(`assets/img/BG/cook_bg_${i}.png`)
        );

        // ── Prompt arrow images ───────────────────────────────────────
        this._arrowImgs = {
            ArrowUp:    this._loadImage('assets/img/UI/cook_arrow_up.png'),
            ArrowDown:  this._loadImage('assets/img/UI/cook_arrow_down.png'),
            ArrowLeft:  this._loadImage('assets/img/UI/cook_arrow_left.png'),
            ArrowRight: this._loadImage('assets/img/UI/cook_arrow_right.png'),
        };

        /** All four possible prompt keys for random selection */
        this._KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

        /** Size of the arrow prompt image drawn in the centre */
        this.PROMPT_SIZE = 128;
    }

    // ─────────────────────────────────────────────
    //  Public API
    // ─────────────────────────────────────────────

    /** Begin the cook task */
    start() {
        this.active           = true;
        this.promptsCompleted = 0;
        this.totalPrompts     = this._randomTotal();
        this._bgIndex         = 0;
        this._resetKeyGuards();
        this._nextPrompt();
    }

    /**
     * Call once per game tick from refreshGame().
     * @param {import('../Player/InputManager.js').InputManager} inputManager
     */
    update(inputManager) {
        if (!this.active) return;

        const upDown    = inputManager.isDown('ArrowUp');
        const downDown  = inputManager.isDown('ArrowDown');
        const leftDown  = inputManager.isDown('ArrowLeft');
        const rightDown = inputManager.isDown('ArrowRight');

        // Derive one-shot taps
        const tapped = {
            ArrowUp:    upDown    && !this._upWasDown,
            ArrowDown:  downDown  && !this._downWasDown,
            ArrowLeft:  leftDown  && !this._leftWasDown,
            ArrowRight: rightDown && !this._rightWasDown,
        };

        // Update guards
        this._upWasDown    = upDown;
        this._downWasDown  = downDown;
        this._leftWasDown  = leftDown;
        this._rightWasDown = rightDown;

        // Check if the correct key was tapped
        if (tapped[this.currentPrompt]) {
            this._registerCorrect();
        }
    }

    /**
     * Draw the cooking background and arrow prompt.
     * Call AFTER CV.clearAndDraw() so it renders on top of room entities,
     * but BEFORE bed.drawFade() so the fade still sits on top of everything.
     */
    draw() {
        if (!this.active) return;

        const ctx  = this.canvas.BRUSH;
        const W    = this.canvas.WIDTH;
        const H    = this.canvas.HEIGHT;
        const cx   = W / 2;
        const cy   = H / 2;
        const half = this.PROMPT_SIZE / 2;

        // ── Full-screen cooking background ───────────────────────────
        ctx.save();
        ctx.drawImage(this._bgImages[this._bgIndex], 0, 0, W, H);
        ctx.restore();

        // ── Arrow prompt (centred) ────────────────────────────────────
        ctx.save();
        ctx.drawImage(
            this._arrowImgs[this.currentPrompt],
            cx - half, cy - half,
            this.PROMPT_SIZE, this.PROMPT_SIZE
        );
        ctx.restore();

        // ── Progress counter  e.g. "2 / 4" ───────────────────────────
        ctx.save();
        ctx.font      = 'bold 22px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${this.promptsCompleted} / ${this.totalPrompts}`,
            cx,
            cy + half + 32
        );
        ctx.restore();
    }

    // ─────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────

    /** Advance background index, count the prompt, pick the next one */
    _registerCorrect() {
        this.promptsCompleted++;

        // Cycle background image on every correct tap
        this._bgIndex = (this._bgIndex + 1) % this._bgImages.length;

        if (this.promptsCompleted >= this.totalPrompts) {
            this.active = false;
            this.onComplete();
            return;
        }

        this._nextPrompt();
    }

    /**
     * Pick a new random prompt, guaranteed to be different from the current one
     * so the same arrow never appears twice in a row.
     */
    _nextPrompt() {
        let next;
        do {
            next = this._KEYS[Math.floor(Math.random() * this._KEYS.length)];
        } while (next === this.currentPrompt);

        this.currentPrompt = next;
        this._resetKeyGuards();
    }

    _resetKeyGuards() {
        this._upWasDown    = false;
        this._downWasDown  = false;
        this._leftWasDown  = false;
        this._rightWasDown = false;
    }

    /** @returns {number} random integer 3–5 inclusive */
    _randomTotal() {
        return Math.floor(Math.random() * 3) + 3;
    }

    /**
     * @param {string} src
     * @returns {HTMLImageElement}
     */
    _loadImage(src) {
        const img = new Image();
        img.src   = src;
        return img;
    }
}