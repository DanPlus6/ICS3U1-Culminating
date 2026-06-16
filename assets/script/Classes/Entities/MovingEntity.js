/**
 * By: David Fu
 */
'use strict';

import { Canvas } from "../GameScreen/Canvas.js";
import { Entity } from "./Entity.js";
import { MakeConst } from "../../functions/MakeConst.js";

export class MovingEntity extends Entity {
    /**
     * Object representing a movable entity
     * @param {Object} args destructured object containing arguments
     * @param {string} args.path path to the image for player's sprite
     * @param {number} [args.width] width for player avatar
     * @param {number} [args.height] height for player avatar
     * @param {number} [args.kpMin] minimum movement speed for player
     * @param {number} [args.kpMax] maximum movement speed for player
     */
    constructor({path='assets/img/PlayerAvatar/trollge.png', width=96, height=96, kp=4}) {
        // inherit properties from Entity class
        super({path:path, width:width, height:height});

        // entity movement
        MakeConst(this, 'kp', kp);
        this.oldX = 0;
        this.oldY = 0;
    }
}
