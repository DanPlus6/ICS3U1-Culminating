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
            id: 'protagonist',
            label: 'Character',
            description: 'Your game character here',
            spriteSrc: 'assets/img/player.png',
            width: 140,
            height: 140,
            speed: 8
        }
    ],

    // Game state
    GAME_TITLE: 'Seishinbyo',
    GAME_SUBTITLE: 'Press Start'
};
