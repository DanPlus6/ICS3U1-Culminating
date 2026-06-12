'use strict';

/**
 * Finds the amount of times this event happens in an array
 * @param {Array} anArray an array to search through
 * @param {number} lowestInput the lowest range -- or if there is no highest range, if the number is equal
 * @param {number} highestInput the highest range -- 0 if there is no highest range
 * @returns the amount of times it occurs 
 * 
 * By: Ian Choy
 */
export function countOccurrances(anArray, lowestInput, highestInput){
    /** The amount the event occurs */
    let countAmount = 0;
    //check if there is no highest input
    if (highestInput == 0){
        //traverse through the array to count the amount of times the array element is equal to the lowest bound
        for (let i; i < anArray.length; i++){
            // check if the current element is equal to the lowestInput
            if (anArray[i] == lowestInput){
                countAmount++;
            }
        }
    }
    else {
         //traverse through the array to count the amount of times the array element is inside the ranges
        for (let i; i < anArray.length; i++){
            // check if the current element is inside the range between highest and lowest input
            if (anArray[i] >= lowestInput && anArray[i] <= highestInput){
                countAmount++;
            }
        }
    }
    return countAmount;
}
