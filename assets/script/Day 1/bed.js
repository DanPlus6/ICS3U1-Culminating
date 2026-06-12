/**MARCUS K. */

'use strict';

import { Entity } from '../Entities/Entity.js';
import { Canvas } from '../GameScreen/Canvas.js';
import { Player } from '../Player/Player.js';

export class Bed extends Entity {
    /**
     * Interactable bed entity for Day 1 sleep task.
     * When the player is colliding with the bed and presses E,
     * the screen fades to black and day1End is set to true.
     *
     * @param {Object} args
     * @param {string}  [args.path] sprite path for the bed
     * @param {number}  [args.width] width  of the bed sprite
     * @param {number}  [args.height] height of the bed sprite
     * @param {number}  [args.x] initial x position
     * @param {number}  [args.y] initial y position
     * @param {Canvas}  args.canvas active Canvas instance
     * @param {Object}  args.gameState shared game-state object 
     */
    constructor({ path = 'assets/img/Entities/bed/bed.png', width = 128, height = 128, x = 0, y = 0, canvas, gameState }) {
        super({ path, width, height });

        this.x = x;
        this.y = y;

        /** @type {Canvas} */
        this.canvas = canvas;

        /**
         * Shared game-state object.
         * Day 2 should check gameState.day1End before loading.
         * @type {{ day1End: boolean }}
         */
        this.gameState = gameState;

        /** Whether the fade-out animation is currently running */
        this.fading = false;

        /** Opacity for the black overlay (0 = transparent, 1 = fully black) */
        this.fadeAlpha = 0;

        /** How fast the alpha increases per frame */
        this.FADE_SPEED = 0.02;

        /** Prompt text shown when player is in range */
        this.promptVisible = false;
    }

    // ─────────────────────────────────────────────
    //  Collision
    // ─────────────────────────────────────────────

    /**
     * AABB collision check between this bed and a player entity.
     * (Uses .w / .h to match the Entity class convention.)
     * @param {Player} player
     * @returns {boolean}
     */
    isTouching(player) {
        return (
            player.x             < this.x + this.w &&
            player.x + player.w > this.x           &&
            player.y             < this.y + this.h &&
            player.y + player.h > this.y
        );
    }

    // ─────────────────────────────────────────────
    //  Per-frame update
    // ─────────────────────────────────────────────

    /**
     * Call once per game tick from the main refreshGame loop.
     *
     * @param {Player} player        the active player entity
     * @param {boolean} interactDown true only on the frame E was first pressed
     *                               (pass InputManager.isDown('e') debounced, or use
     *                               ActionMap 'interact' with a one-shot wrapper)
     */
    update(player, interactDown) {
        if (this.fading) {
            this._tickFade();
            return;
        }

        const inRange = this.isTouching(player);
        this.promptVisible = inRange;

        if (inRange && interactDown) {
            this._startFade();
        }
    }

    // ─────────────────────────────────────────────
    //  Draw helpers  (call from your render step)
    // ─────────────────────────────────────────────

    /**
     * Draw the "Press E to sleep" prompt above the bed.
     * Only renders when the player is in range and no fade is active.
     */
    drawPrompt() {
        if (!this.promptVisible || this.fading) return;

        const ctx = this.canvas.BRUSH;

        ctx.save();
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(
            '[E] Sleep',
            this.x + this.w / 2,
            this.y - 12
        );
        ctx.restore();
    }

    /**
     * Draw the black fade overlay.
     * Call this LAST in your render pipeline so it sits on top of everything.
     */
    drawFade() {
        if (this.fadeAlpha <= 0) return;

        const ctx = this.canvas.BRUSH;
        ctx.save();
        ctx.globalAlpha = this.fadeAlpha;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.canvas.WIDTH, this.canvas.HEIGHT);
        ctx.restore();
    }

    // ─────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────

    /** Begin the fade-to-black sequence */
    #startFade() {
        this.fading       = true;
        this.promptVisible = false;
        this.fadeAlpha    = 0;
    }

    /**
     * Advance fade animation one tick.
     * When fully black, mark day1End and stop ticking.
     */
    #tickFade() {
        this.fadeAlpha = Math.min(1, this.fadeAlpha + this.FADE_SPEED);

        if (this.fadeAlpha >= 1) {
            this.fading            = false;
            this.gameState.day1End = true;   // Day 2 checks this flag
            // The overlay stays at alpha=1 (fully black) until Day 2 takes over.
        }
    }
}