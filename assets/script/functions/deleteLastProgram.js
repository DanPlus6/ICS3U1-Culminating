/**
 * By: David Fu
 */
'use strict';

import { getLocal } from "./getLocal.js";

/**
 * Deletes the last saved program from local storage after confirmation
 */
export function deleteLastProgram() {
    /** fetch local programs */
    let programs = getLocal();

    if (programs.length === 0) { // check if no local programs
        alert("No saved programs to delete!");
        return;
    }

    /** last saved program */
    const last = programs[programs.length - 1];
    /** get user confirmation for program deletion */
    const confirmed = confirm(`Delete "${last.programName}" at "${last.schoolName}"?`);

    if (confirmed) { // if user confirmed deletion, remove last saved program
        programs.pop();
        localStorage.setItem("programs", JSON.stringify(programs));
        alert("Last program deleted successfully.");
    }
}
