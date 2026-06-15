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
            spriteSrc: 'assets/img/PlayerAvatar/p_IdleFront.png',
            sprites: {
                idle: ['assets/img/PlayerAvatar/p_IdleFront.png'],
                up: [
                    'assets/img/PlayerAvatar/p_Up1.png',
                    'assets/img/PlayerAvatar/p_Up2.png'
                ],
                down: [
                    'assets/img/PlayerAvatar/p_Down1.png',
                    'assets/img/PlayerAvatar/p_Down2.png'
                ],
                left: [
                    'assets/img/PlayerAvatar/p_Left1.png',
                    'assets/img/PlayerAvatar/p_Left2.png'
                ],
                right: [
                    'assets/img/PlayerAvatar/p_Right1.png',
                    'assets/img/PlayerAvatar/p_Right2.png'
                ]
            },
            width: 100,
            height: 200,
            speed: 8
        }
    ],

    // Shared interaction hitboxes for every day.
    // x and y are the top-left corner. w and h are width and height.
    // Add day2 and day3 sections here when those day files are ready.
    DEBUG_HITBOXES: false,
    HITBOXES: {
        day1: {
            sweep: { x: 820, y: 300, w: 180, h: 180 },
            study: { x: 940, y: 210, w: 220, h: 180 },
            cook: { x: 260, y: 210, w: 240, h: 220 },
            bed: { x: 680, y: 520, w: 260, h: 220 }
        },
        day2: {},
        day3: {}
    },

    // Game state
    GAME_TITLE: 'Seishinbyo',
    GAME_SUBTITLE: 'ad finem mentis'
};
