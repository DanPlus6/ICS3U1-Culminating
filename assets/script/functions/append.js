/**
 * By: David Fu
 */
'use strict';

/**
 * Appends an element to the end of an array
 * @param {Array} arr the array to operate on
 * @param {*} elem the element to be appended
 */
export function append(arr, elem) {
    ++arr.length;
    arr[arr.length-1] = elem;
}
