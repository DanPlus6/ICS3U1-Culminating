/**
 * By: David Fu
 */
'use strict';

/**
 * Global game configuration
 * 
 * Customize essential values for game
 */
export const GAME_CONFIG = {
    // Canvas
    CANVAS_ID: 'game-canvas',
    CANVAS_SCALE: 96,

    // Game loop
    REFRESH_INTERVAL_MS: 20,

    // Characters
    CHARACTERS: [
        {
            id: 'mc',
            label: 'Shinichi',
            description: '████████ ████',
            spriteSrc: 'assets/img/trollge.png', // TODO: add actual sprite
            width: 140,
            height: 140,
            speed: 8
        }
    ],

    // Game state
    GAME_TITLE: 'Seishinbyo',
    GAME_SUBTITLE: 'ad finem mentis'
};
