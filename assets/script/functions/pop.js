/**
 * By: David Fu
 */
'use strict';

/**
 * Pops the last element of an array
 * @param {Array} arr the array to operate on
 * @returns Last element of array that is popped
 */
export function pop(arr) {
    /** Last element in array */
    const lElem = arr[arr.length-1];
    --arr.length;
    return lElem;
}
