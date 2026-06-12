'use strict';

/**
 * Concatenates 2 arrays into 1 bigger array
 * @param {Array} array1 The first array
 * @param {Array} array2 The second array
 * @returns The bigger array
 *  
 * By: Ian Choy
 */
export function addArrays(array1, array2) {
    /** total array containing concatenation of array1 and array2 */
    let totalArray = new Array(array1.length + array2.length);

    // copy all of array1 into totalArray
    for (let i = 0; i < array1.length; i++) {
        totalArray[i] = array1[i];
    }

    /** secondary iterator for continuing totalArray traversal */
    let k = array1.length;

    // copy all of array2 into totalArray
    for (let i = 0; i < array2.length; i++) {
        totalArray[k] = array2[i];
        ++k;
    }

    return totalArray;
}
