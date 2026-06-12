'use strict';

import { pop } from './pop.js';

/**
 * Searches for all occurences of a value in an array
 * @param {Array} arr the input array
 * @param {*} searchVal the search value
 * @returns {number[]} -1 if there are no indices where value is found -- all indices where value is found
 * 
 * By: Ian Choy
 */
export function searchAllMatches(arr, searchVal) {
    /** array to contain the indexes of the original array that contains the search value */
    let indexes = new Array(arr.length);
    /** secondary iterator to traverse through newArr */
    let count = 0;

    // traverse through the original array to find the indexes of what contains search value
    for (i = 0; i < arr.length; i++) {
        // search if current element is equal to search value
        if (arr[i] == searchVal) {
            indexes[count] = i;
            ++count;
        }
    }
    //check if there are no elements that suffice the event
    if (count == 0) return -1;
    //iterator to remove undefined elements
    let k = arr.length;
    //find the difference between the count and the array length
    for (k; k > count; k--){
        pop(arr);
    } 

    return indexes;
}
