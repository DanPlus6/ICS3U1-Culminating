'use strict';

import { pop } from './pop.js';

/**
 * Finds the indexes of an array within the highest and lowest input
 * @param {Array} anArray an array to search through
 * @param {number} lowestInput the lowest range
 * @param {number} highestInput the highest range
 * @returns -1 if there is no index between these ranges, an array with the indexes if there are elements within these ranges
 * 
 * By: Ian Choy
 */
function rangeSearch(anArray, lowestInput, highestInput) {
    // contains the indexes inside the ranges
    let rangeIndexes = new Array(anArray.length);
    // secondary iterator that traverses through the rangeIndexes array -- contains the amont of index within the ranges
    let indexCount = 0;

    //check if the lowest input is larger than the highest input
    if (lowestInput > highestInput){
        //contains the lowest input for swaping
        let temp = lowestInput;
        lowestInput = highestInput;
        highestInput = temp;
    }

    // traverse through the array to find the indexes that are inside the ranges
    for (let i; i < anArray.length; i++) {
        // find if the current element is inside the ranges
        if (anArray[i] >= lowestInput && anArray[i] <= highestInput) {
            rangeIndexes[indexCount] = i;
            ++indexCount;
        }
    }
    //check if there are no elements that suffice the event
    if (indexCount == 0) return -1;

    // iterator to remove undefined elements
    let k = anArray.length;

    // find the difference between the current count and the array length
    for (k; k > indexCount; k--){ 
        pop(rangeIndexes);
    } 

    return rangeIndexes;
}
