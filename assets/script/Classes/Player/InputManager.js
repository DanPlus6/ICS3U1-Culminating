/**
 * By: David Fu
 */
'use strict';

export class InputManager {
    /** class for managing user/player inputs */
    constructor() {
        /** map to store status of keys */
        this.keys = {};

        // listen for keydown and keyup events
        window.addEventListener('keydown', keydownEvent => this.keys[keydownEvent.key] = true);
        window.addEventListener('keyup', keyupEvent => this.keys[keyupEvent.key] = false);
    }

    /**
     * check if a key is currently pressed
     * @param {string} key querying key
     * @returns `true` if requested key is currently pressed
     */
    isDown(key) {
        // check truthfulness -- prevent non-existence/not-pressed-before cases
        return !!this.keys[key];
    }
}
