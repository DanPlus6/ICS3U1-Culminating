/**
 * By: David Fu
 */
'use strict';

import { sortArray } from "./sortArray.js";
import { pop } from "./pop.js";

/**
 * Removes all the duplicated data in an array
 * @param {Array} arr An array to remove duplicates from
 * @returns The array with no duplicate data
 */
export function removeDuplicates(arr) {
    // sort array first to make it easier to find duplicate elements
    sortArray(arr);

    /** result array -- copy of array without duplicates */
    let resArr = new Array(arr.length);

    /** secondary iterator for traversing through resArr */
    let k = 0;

    /** last element, for duplicates checking */
    let last = arr[0];
    resArr[0] = last; 

    // iterate through original array
    for (let i = 1; i < arr.length; i++) {
        // copy over element if not duplicate
        if (arr[i] != last) {
            ++k;
            newArr[k] = arr[i];
            last = arr[i];
        }
    }

    // pop empty space resulted from duplicate elements
    for (let i = 0; i < arr.length-k-1; i++) pop(resArr);
    
    return resArr;
}
