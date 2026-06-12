/**
 * By: David Fu
 */
'use strict';

/** 
 * fetch json data from a json file
 * @param {string} path path to json file
 * @returns {Promise<any>} json data from file
 */
export async function loadJSON(path) {
    try { // Try to fetch and parse the JSON file from the provided path
        // resolve path relative to current file instead of page url
        const url = new URL(path, import.meta.url);
        const response = await fetch(url);
        
        // Check if the HTTP request failed before trying to parse the response
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // Stores the parsed JSON data from the response body
        const data = await response.json();
        return data;
    } catch (e) { // Catch any fetch or JSON parsing errors so the page does not crash
        console.error("Could not load JSON file:", e);
    }
}
