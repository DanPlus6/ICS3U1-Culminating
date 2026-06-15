'use strict';

import { Entity } from '../Entities/Entity.js';
import { MakeConst } from '../../functions/MakeConst.js';

export class SpatialGrid {
	/**
	 * redundant spatial grid class for efficient 2d collision detection
	 * @param {number} cellSize size of each square cell in spatial grid as an integer
	 */
	constructor(cellSize) {
		MakeConst(this, 'cellSize', cellSize);
		this.grid = new Map();
	}

	/**
	 * Add an entity to a cell in the spatial grid based on their location
	 * @param {Entity} entity object containing the entity to be added
	 */
	add(entity) {
		const cellKey = this.getCellKey(entity.x, entity.y);
		// Initialize a cell grid for entity's position if it doesn't exist
		// Create the cell bucket before pushing into it.
		if (!this.grid.has(cellKey)) this.grid.set(cellKey, []);
		this.grid.get(cellKey).push(entity);
	}

	/** 
	 * Remove an entity from the spcial grid
	 * @param {Entity} entity 
	 */
	remove(entity) {
		const cellKey = this.getCellKey(entity.x, entity.y);
		const cell = this.grid.get(cellKey);

		// Only search for the entity when the cell is present
		if (cell) {
			const index = cell.indexOf(entity);
			// Remove the entity only if it is actually in the cell
			if (index !== -1) cell.splice(index,1);
		}
	}

	/**
	 * Update an entity's position in the spatial grid if they have moved to a different cell
	 * @param {Entity} entity object containing current updated entity
	 */
	update(entity) {
		const oldKey = this.getCellKey(entity.oldX, entity.oldY);
		const newKey = this.getCellKey(entity.x,entity.y);

		// update grid only when the entity changed cells
		if (oldKey !== newKey) {
			this.remove({...entity, x: entity.oldX, y: entity.oldY});
			this.add(entity);
		}
	}

	/**
	 * Get entities nearby to an entitiy
	 * @param {*} entity the entity
	 * @returns {Entity[]} an array containing neighboring entities
	 */
	getNearby(entity) {
		const nearby = [];

		// Check adjacent cells
		for (let dx = -1; dx <= 1; dx++) {
			for (let dy = -1; dy <= 1; dy++) {
				const neighborKey = this.getCellKey(
					entity.x + dx * this.cellSize,
					entity.y + dy * this.cellSize
				);
				// only append neighbors from cells that exist
				if (this.grid.has(neighborKey)) nearby.push(...this.grid.get(neighborKey));
			}
		}

		return nearby;
	}
	
	/**
	 * Get the cellKey pointing to the cell housing a requested location in the spatial grid
	 * @param {*} x The x coordinate of the location
	 * @param {*} y The y coordinate of the location
	 * @returns cellKey of the location
	 */
	getCellKey(x, y) {
		return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
	}
}
