/**
 * By: David Fu
 */
'use strict';

/**
 * Sets an object's property to constant
 * @param {Object} obj the object being accessed
 * @param {string} attrib the property of the object
 * @param {*} val the const value to set property of the object to
 */
export function MakeConst(obj, attrib, val) {
    Object.defineProperty(obj, attrib, {value: val, writable: false});
}
