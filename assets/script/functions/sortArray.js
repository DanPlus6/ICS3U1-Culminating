/**
 * By: Ian Choy and David Fu
 */
'use strict';

/**
 * Sorts an array in ascending order, in-place, using selection sort algorithm
 * @param {Array} arr 
 */
export function sortArray(arr) {
    // iterate through array
    for (let i = 0; i < arr.length; i++) {
        /** index of our running minimum */
        let minIdx = i;

        // iterate through right half of array
        for (let j = i+1; j < arr.length; j++) {
            // update (index of) running minimum if current element is smaller
            if (arr[j] < arr[minIdx]) minIdx = j;
        }

        // swap minimum element and current element
        [arr[minIdx],arr[i]] = [arr[i],arr[minIdx]];
    }
}
