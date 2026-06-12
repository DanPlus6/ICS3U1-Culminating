/**
 * By: David Fu
 */
'use strict';

/**
 * Gets clean HTML for a user-editable list
 * @param {HTMLUListElement|HTMLOListElement} list list to serialize
 * @returns {string} raw HTML string of list item elements
 */
export function getListHTML(list) {
    /** Temporary container for list */
    const container = document.createElement('div');
    // iterate through list items and append them to temporary container
    for (const item of list.children) {
        // if list item is empty, continue
        if (item.textContent.trim() === '') continue;
        /** Clone of list item to clean */
        const cleanItem = item.cloneNode(true);
        cleanItem.removeAttribute('contenteditable');
        cleanItem.removeAttribute('spellcheck');
        container.append(cleanItem);
    }

    return container.innerHTML;
}
