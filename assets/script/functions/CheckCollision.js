/**
 * By: David Fu
 */
'use strict';

import { Entity } from "../Classes/Entities/Entity";

/**
 * Check collision between two entities using AABB checking method
 * @param {Entity} a the first entity
 * @param {Entity} b the second entity
 * @returns 
 */
export function CheckCollision(a,b) {
    return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}
