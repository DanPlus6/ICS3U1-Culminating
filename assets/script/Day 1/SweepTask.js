/**MARCUS K. */

'use strict';

import { Canvas } from '../GameScreen/Canvas.js';

export class SweepTask {
    /**
     * Sweep the broom minigame for Day 1.
     * Player taps LEFT arrow (image 1) then RIGHT arrow (image 2), alternating,
     * for a random number of times between 5 and 20.
     *
     * @param {Object} args
     * @param {Canvas}   args.canvas       active Canvas instance
     * @param {Function} args.onComplete   callback fired when task is finished
     */
    constructor({ canvas, onComplete }) {
        /** @type {Canvas} */
        this.canvas = canvas;

        /** Called when the sweep task is fully complete */
        this.onComplete = onComplete;

        /** Total number of sweeps required this run (5–20) */
        this.totalSweeps = Math.floor(Math.random() * 16) + 5; // 5 inclusive, 20 inclusive

        /** How many sweeps the player has completed so far */
        this.sweepsCompleted = 0;

        /**
         * Which key the player must press next.
         * Alternates:  'ArrowLeft' → 'ArrowRight' → 'ArrowLeft' → ...
         * Always starts on ArrowLeft.
         */
        this.expectedKey = 'ArrowLeft';

        /** Whether the task is currently running */
        this.active = false;

        /** One-shot guards so holding a key doesn't count as multiple taps */
        this._leftWasDown  = false;
        this._rightWasDown = false;

        // ── Placeholder images ──────────────────────────────────────────
        // Swap src strings for your real arrow sprites whenever ready.
        this._imgLeft  = this._loadImage('assets/img/UI/sweep_left.png');   // placeholder 1
        this._imgRight = this._loadImage('assets/img/UI/sweep_right.png');  // placeholder 2

        /** Size of the prompt image drawn in the centre of the screen */
        this.PROMPT_SIZE = 128;
    }

    // ─────────────────────────────────────────────
    //  Public API
    // ─────────────────────────────────────────────

    /** Begin the sweep task */
    start() {
        this.active           = true;
        this.sweepsCompleted  = 0;
        this.totalSweeps      = Math.floor(Math.random() * 16) + 5;
        this.expectedKey      = 'ArrowLeft';
        this._leftWasDown     = false;
        this._rightWasDown    = false;
    }

    /**
     * Call once per game tick from refreshGame().
     * Pass the raw InputManager so we can read arrow key state directly.
     *
     * @param {import('../Player/InputManager.js').InputManager} inputManager
     */
    update(inputManager) {
        if (!this.active) return;

        const leftDown  = inputManager.isDown('ArrowLeft');
        const rightDown = inputManager.isDown('ArrowRight');

        // One-shot: only register on the frame the key first goes down
        const leftTapped  = leftDown  && !this._leftWasDown;
        const rightTapped = rightDown && !this._rightWasDown;

        // Update one-shot trackers
        this._leftWasDown  = leftDown;
        this._rightWasDown = rightDown;

        if (this.expectedKey === 'ArrowLeft'  && leftTapped)  this._registerSweep();
        if (this.expectedKey === 'ArrowRight' && rightTapped) this._registerSweep();
    }

    /**
     * Draw the prompt image in the centre of the screen.
     * Call this AFTER CV.clearAndDraw() so it renders on top.
     */
    draw() {
        if (!this.active) return;

        const ctx  = this.canvas.BRUSH;
        const cx   = this.canvas.WIDTH  / 2;
        const cy   = this.canvas.HEIGHT / 2;
        const half = this.PROMPT_SIZE   / 2;

        // Draw the arrow placeholder image for the expected direction
        const img = this.expectedKey === 'ArrowLeft' ? this._imgLeft : this._imgRight;

        ctx.save();
        ctx.drawImage(img, cx - half, cy - half, this.PROMPT_SIZE, this.PROMPT_SIZE);
        ctx.restore();

        // Progress counter  e.g.  "3 / 12"
        ctx.save();
        ctx.font      = 'bold 22px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${this.sweepsCompleted} / ${this.totalSweeps}`,
            cx,
            cy + half + 32
        );
        ctx.restore();
    }

    // ─────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────

    /** Count one sweep and flip the expected direction */
    _registerSweep() {
        this.sweepsCompleted++;

        // Alternate expected key
        this.expectedKey = this.expectedKey === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';

        if (this.sweepsCompleted >= this.totalSweeps) {
            this.active = false;
            this.onComplete();
        }
    }

    /**
     * Helper to create and return an Image object from a src path
     * @param {string} src
     * @returns {HTMLImageElement}
     */
    _loadImage(src) {
        const img = new Image();
        img.src   = src;
        return img;
    }
}