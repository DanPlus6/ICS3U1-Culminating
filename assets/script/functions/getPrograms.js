/**
 * By: David Fu
 */
'use strict';

import { Program } from "../class/Program.js";
import { loadJSON } from "./loadJSON.js";
import { addArrays } from "./addArrays.js";
import { getLocal } from "./getLocal.js";

/** path to json file containing baseline research data */
const PATH = '../../data/programs.json';
/** array to store fetched cumulative programs research data */
let programs = null;

/** 
 * Gets all the programs research data as an array of 'Program' objects
 * @returns {Promise<Program[]>} array containing all the program research data
 */
export async function getPrograms() {
    // check if programs are already fetched
    if (programs) return programs;

    /** Fetch baseline programs */
    const raw = await loadJSON(PATH);
    /** Fetch locally saved programs */
    const savedPrograms = getLocal();

    programs = addArrays(Program.fromJsonArray(raw), Program.fromJsonArray(savedPrograms));
    
    return programs;
}
