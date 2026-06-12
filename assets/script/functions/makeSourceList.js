/**
 * By: David Fu
 */
'use strict';

import { makeElem } from "./makeElem.js";

/**
 * Creates a list of research source links
 * @param {string[]|string} sources array of source urls
 * @returns {HTMLUListElement} list containing source links
 */
export function makeSourceList(sources) {
    /** List to add resource links to */
    const sourceList = makeElem({tag:'ul'});
    // check if sources is HTML as string literal
    if (typeof sources === 'string') {
        sourceList.innerHTML = sources;
        return sourceList;
    }
    // iterate through sources
    for (const source of sources) {
        /** List item for source link */
        const sourceItem = makeElem({tag:'li'});
        /** Anchor for source link */
        const sourceLink = makeElem({tag:'a', href:source, htmlContent:source});
        sourceItem.append(sourceLink);
        sourceList.append(sourceItem);
    }

    return sourceList;
}
