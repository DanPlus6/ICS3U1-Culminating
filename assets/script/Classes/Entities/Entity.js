/**
 * By: David Fu
 */
'use strict';

import { MakeConst } from "../../functions/MakeConst.js";

export class Entity {
    /**
     * Object representing an entity
     * @param {Object} args destructured object containing arguments
     * @param {string} args.path path to the image for entities sprite
     * @param {number} [args.width] width for avatar
     * @param {number} [args.height] height for avatar
     */
    constructor({path, width = 96, height = 96}) {
        // entity avatar's image object
        this.sprite = new Image();
        this.sprite.src = path;

        // hardcoded oversized meme dimensions only for the gamer's GPU sprite 🤡
        if (path == 'assets/img/Entities/gamer/gpu.png') {
            this.w = 312;
            this.h = 312;
        }
        else {
            // entity avatar's width and height, use default size of invalid dimensions provided and downscale if too large
            let stagingW = (width>0 ? width : this.sprite.naturalWidth);
            let stagingH = (height>0 ? height : this.sprite.naturalHeight);

            MakeConst(this, 'w', (stagingW>globalThis.CV_WIDTH ? Math.round(globalThis.CV_WIDTH/10) : stagingW));
            MakeConst(this, 'h', (stagingH>globalThis.CV_HEIGHT ? Math.round(globalThis.CV_HEIGHT/10) : stagingH));
        }

        // entity avatar's top-left x and y coordinates
        this.x = 0;
        this.y = 0;

        // entity id for displaying information about it
        MakeConst(this, 'id', path.split('/').pop().split('.')[0]);
    } 
}
