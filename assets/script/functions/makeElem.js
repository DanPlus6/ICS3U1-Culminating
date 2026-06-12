/**
 * By: David Fu
 */
'use strict';

/**
 * Creates html element optionally with a value
 * @param {Object} args object of arguments passed
 * @param {HTMLElementType} args.tag type of html tag/element to create
 * @param {string} [args.className] optional classname to assign to the element
 * @param {string} [args.id] optional id to assign to the element
 * @param {string} [args.htmlContent] optional innerHTML content to assign to element
 * @param {string} [args.src] optional source to assign to element
 * @param {string} [args.href] optional link reference to assign to element
 * @param {string} [args.alt] optional alt text to assign to element
 * @returns {HTMLElement} target to created html element
 */
export function makeElem({tag, className, id, htmlContent, src, href, alt}) {
    /** 
     * target to created html element
     * @type {HTMLElement}
     */
    const elem = document.createElement(tag);
    
    // check if class name was specified to assign it
    if (className) elem.className = className;
    // check if id was specified to assign it
    if (id) elem.id = id;
    // check if innerHTML content was specified to assign it
    if (htmlContent != null) elem.innerHTML = htmlContent;
    // check if src content was specified to assign it
    if (src) elem.src = src;
    // check if href content was specified to assign it
    if (href) elem.href = href;
    // check if alt content was specified to assign it
    if (alt) elem.alt = alt;


    return elem;
}
