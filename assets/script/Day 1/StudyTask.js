/**MARCUS K. */

'use strict';

import { Canvas } from '../GameScreen/Canvas.js';

export class StudyTask {
    /**
     * Study minigame for Day 1.
     * Player holds UP arrow to write. While held, the image alternates between
     * two "writing" frames. On release the pen returns to the idle/stationary image.
     * Must complete a random number of "writes" (3–5) to finish.
     *
     * Image states:
     *   idle    — pen stationary, not writing       (assets/img/UI/study_idle.png)
     *   writeA  — writing frame 1                   (assets/img/UI/study_write_a.png)
     *   writeB  — writing frame 2                   (assets/img/UI/study_write_b.png)
     *
     * @param {Object}   args
     * @param {Canvas}   args.canvas      active Canvas instance
     * @param {Function} args.onComplete  callback fired when task is finished
     */
    constructor({ canvas, onComplete }) {
        /** @type {Canvas} */
        this.canvas = canvas;

        /** Called when the study task is fully complete */
        this.onComplete = onComplete;

        /** Total number of writes required this run (3–5) */
        this.totalWrites = this._randomTotal();

        /** How many writes the player has completed so far */
        this.writesCompleted = 0;

        /** Whether the task is currently running */
        this.active = false;

        // ── Hold-detection state ──────────────────────────────────────
        /** Is UP currently being held? */
        this._upHeld = false;

        /**
         * How many consecutive ticks UP has been held this press.
         * A "write" is counted once per unbroken hold — not per tick —
         * so we register the write on the FIRST tick of each new hold.
         */
        this._holdTicks = 0;

        /** Whether the current hold has already been counted as a write */
        this._holdCounted = false;

        // ── Animation ────────────────────────────────────────────────
        /**
         * Which write image is currently showing: 'A' or 'B'.
         * Alternates every ANIM_INTERVAL ticks while UP is held.
         */
        this._writeFrame = 'A';

        /** Ticks between write-frame flips */
        this.ANIM_INTERVAL = 8;

        /** Internal tick counter for animation timing */
        this._animTick = 0;

        // ── Placeholder images ────────────────────────────────────────
        this._imgIdle   = this._loadImage('assets/img/UI/study_idle.png');    // pen stationary
        this._imgWriteA = this._loadImage('assets/img/UI/study_write_a.png'); // writing frame 1
        this._imgWriteB = this._loadImage('assets/img/UI/study_write_b.png'); // writing frame 2

        /** Size of the prompt image drawn in the centre of the screen */
        this.PROMPT_SIZE = 128;
    }

    // ─────────────────────────────────────────────
    //  Public API
    // ─────────────────────────────────────────────

    /** Begin the study task */
    start() {
        this.active          = true;
        this.writesCompleted = 0;
        this.totalWrites     = this._randomTotal();
        this._upHeld         = false;
        this._holdTicks      = 0;
        this._holdCounted    = false;
        this._writeFrame     = 'A';
        this._animTick       = 0;
    }

    /**
     * Call once per game tick from refreshGame().
     * @param {import('../Player/InputManager.js').InputManager} inputManager
     */
    update(inputManager) {
        if (!this.active) return;

        const upDown = inputManager.isDown('ArrowUp');

        if (upDown) {
            this._holdTicks++;
            this._animTick++;

            // Count ONE write the moment the player starts a new hold
            if (!this._holdCounted) {
                this._holdCounted = true;
                this._registerWrite();
                // Check if task just completed inside _registerWrite
                if (!this.active) return;
            }

            // Alternate write frames while held
            if (this._animTick >= this.ANIM_INTERVAL) {
                this._animTick   = 0;
                this._writeFrame = this._writeFrame === 'A' ? 'B' : 'A';
            }
        } else {
            // Key released — reset hold state, return to idle image
            this._upHeld      = false;
            this._holdTicks   = 0;
            this._holdCounted = false;
            this._animTick    = 0;
            this._writeFrame  = 'A';
        }

        this._upHeld = upDown;
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

        // Pick the correct image based on hold state and current frame
        let img;
        if (!this._upHeld && !this._holdCounted) {
            img = this._imgIdle;
        } else {
            img = this._writeFrame === 'A' ? this._imgWriteA : this._imgWriteB;
        }

        ctx.save();
        ctx.drawImage(img, cx - half, cy - half, this.PROMPT_SIZE, this.PROMPT_SIZE);
        ctx.restore();

        // "Hold UP to write" hint while idle
        if (!this._upHeld && !this._holdCounted) {
            ctx.save();
            ctx.font      = 'bold 18px sans-serif';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('[↑] Hold to write', cx, cy - half - 14);
            ctx.restore();
        }

        // Progress counter  e.g.  "2 / 4"
        ctx.save();
        ctx.font      = 'bold 22px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${this.writesCompleted} / ${this.totalWrites}`,
            cx,
            cy + half + 32
        );
        ctx.restore();
    }

    // ─────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────

    /** Count one completed write; fire onComplete if target reached */
    _registerWrite() {
        this.writesCompleted++;

        if (this.writesCompleted >= this.totalWrites) {
            this.active = false;
            this.onComplete();
        }
    }

    /** @returns {number} random integer 3–5 inclusive */
    _randomTotal() {
        return Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
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