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
            speed: 10
        }
    ],

    // Shared interaction hitboxes for every day 
    // (x,y) --> top-left corner
    DEBUG_HITBOXES: true,
    HITBOXES: {
        day1: {
            sweep: { x: 1000, y: 50, w: 180, h: 180 },
            study: { x: 1200, y: 120, w: 220, h: 180 },
            cook: { x: 80, y: 90, w: 240, h: 220 },
            bed: { x: 1050, y: 450, w: 400, h: 300 }
        },
        day2: {
            closet: { x: 1300, y: 300, w: 180, h: 180 },
            phone: { x: 250, y: 50, w: 180, h: 180 },
            blinds: { x: 600, y: 50, w: 400, h: 180 },
            door: { x: 100, y: 490, w: 180, h: 180 },
            door2: { x: 1200, y: 120, w: 220, h: 180 },
            wires: { x: 1050, y: 450, w: 400, h: 300 }
        },
        day3: {
            note2:  { x:  330/1536, y: 450/864, w: 180/1536, h: 180/864 },
            blinds: { x:  600/1536, y:  50/864, w: 400/1536, h: 180/864 },
            closet: { x: 1300/1536, y: 340/864, w: 180/1536, h: 210/864 }
        }
    },
    AUX_HITBOXES: {
        day2: {
            note: { x: 1200/1536, y: 120/864, w: 220/1536, h: 180/864 }
        }
    },

    // Game state
    GAME_TITLE: 'Seishinbyo',
    GAME_SUBTITLE: 'ad finem mentis'
};

/**
 * Gets hitbox scaled to the current canvas dimensions
 * Fractions in GAME_CONFIG.HITBOXES are multiplied by live canvas size
 * @param {string} day current day key
 * @param {string} name the hitbox/task/stage key
 * @returns {{ x: number, y: number, w: number, h: number } | null}
 */
export function getHitbox(day, name) {
    const f = GAME_CONFIG.HITBOXES[day]?.[name];
    
    const W = globalThis.CV_WIDTH,
    H = globalThis.CV_HEIGHT;
    return { x: f.x * W, y: f.y * H, w: f.w * W, h: f.h * H };
}
 