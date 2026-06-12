/**
 * By: David Fu
 */
'use strict';

import { Program } from "../class/Program.js";

/**
 * Gets programs from local storage
 * @returns {Program[]} array of programs saved to localstorage
 */
export function getLocal() {
    return Program.fromJsonArray(JSON.parse(localStorage.getItem("programs") || "[]"));
}
