/**
 * By: David Fu
 */
'use strict';

import { makeElem } from "./makeElem.js";

/**
 * Creates a labelled paragraph for one field of program information
 * @param {string} label field label
 * @param {string} value field value
 * @returns {HTMLParagraphElement} paragraph containing the label and value
 */
export function makeDetails(label, value) {
    /** Paragraph contain label */
    const p = makeElem({tag:'p', htmlContent:`${label}: `});
    /** Span containing value */
    const span = makeElem({tag:'span', htmlContent:value});
    p.append(span);

    return p;
}
