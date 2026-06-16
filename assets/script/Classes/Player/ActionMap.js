/** 
 * By: David Fu
 */
'use strict';

import { InputManager } from "./InputManager.js";

export class ActionMap {
    /**
     * maps key presses from an active InputManager object to an action for player momvenet
     * @param {InputManager} inputManager active input manager object
     */
    constructor(inputManager) {
        this.input = inputManager;
        this.bindings = {
            mvUp: ['ArrowUp', 'W', 'w'],
            mvDown: ['ArrowDown', 'S', 's'],
            mvLeft: ['ArrowLeft', 'A', 'a'],
            mvRight: ['ArrowRight', 'D', 'd'],

            interact: ['E', 'e'],
            pickupItem: [' ']
        };
    }

    /**
     * Check if a requested player action is active
     * @param {string} action player action to query for 
     * @returns `true` if a valid key for requested action is pressed
     */
    isActive(action) {
        return this.bindings[action].some(key => this.input.isDown(key));
    }
}
