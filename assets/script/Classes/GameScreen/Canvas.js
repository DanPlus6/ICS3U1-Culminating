'use strict';

import { Entity } from '../Entities/Entity.js';
import { SpatialGrid } from './SpatialGrid.js';
import { MakeConst } from '../../functions/MakeConst.js';

export class Canvas {
    /**
     * canvas/screen class for the game, replaces basic HTML5 canvas
     * @param {string} canvasId id for the canvas html element  
     * @param {number} cellSize size for each spatial grid cell as an integer
     */
    constructor(canvasId, cellSize=128) {
        // HTML5 canvas
        MakeConst(this, 'CANVAS', document.getElementById(canvasId));
        MakeConst(this, 'BRUSH', this.CANVAS.getContext('2d'));

        // sync HTML5 canvas dimensions with CSS/client dimensions
        this.CANVAS.width = this.CANVAS.clientWidth;
        this.CANVAS.height = this.CANVAS.clientHeight;

        globalThis.CV_WIDTH = this.CANVAS.clientWidth;
        globalThis.CV_HEIGHT = this.CANVAS.clientHeight;

        
        // redundant vlaues for storing dimensions of canvas
        MakeConst(this, 'WIDTH', this.CANVAS.width);
        MakeConst(this, 'HEIGHT', this.CANVAS.height);

        /** spatial grid to store active entities on the page */
        this.spatGrid = new SpatialGrid(cellSize);

        this.background = null;
    }

    /** Set the current full-canvas background image. */
    setBackground(path) {
        this.background = new Image();
        this.background.src = path;
    }

    /**
     * Append an entity to spatial grid storing entities on the page
     * @param {Entity} entity a valid entity object
     */
    addEntity(entity) {
        this.spatGrid.add(entity);
    }

    /**
     * Remove an entity from the spatial grid storing entities on the page
     * @param {Entity} entity
     */
    rmEntity(entity) {
        this.spatGrid.remove(entity);
    }

    /** clear visual canvas */
    clearCanvas() {
        this.BRUSH.clearRect(0,0,this.WIDTH,this.HEIGHT);
    }

    /** clear entities/empty spatial grid */
    clearEntities() {
        this.spatGrid.grid.clear();
    }

	/**
	 * Update an entity's position in the spatial grid if they have moved to a different cell
	 * @param {Entity} entity object containing current updated entity
	 */
    update(entity) {
        this.spatGrid.update(entity);
    }

    /** draws provided entities onto screen */
    clearAndDraw() {
        this.clearCanvas();
        if (this.background) {
            this.BRUSH.drawImage(this.background, 0, 0, this.WIDTH, this.HEIGHT);
        }
        for (const cell of this.spatGrid.grid.values()) {
            for (const entity of cell) {
                this.BRUSH.drawImage(entity.sprite, entity.x, entity.y, entity.w, entity.h);
            }
        }
    }
}
