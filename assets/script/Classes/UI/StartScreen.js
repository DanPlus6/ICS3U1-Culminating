'use strict';

export class StartScreen {
    /**
     * A simple start screen with title and start button
     * @param {string} title Game title
     * @param {string} subtitle Subtitle/instruction text
     * @param {Function} onStart callback fired when player clicks start
     */
    constructor(title, subtitle, onStart) {
        this.title = title;
        this.subtitle = subtitle;
        this.onStart = onStart;
        this.overlay = null;
    }

    /** Display the start screen overlay */
    show() {
        this.#injectStyles();

        this.overlay = document.createElement('div');
        this.overlay.id = 'start-screen-overlay';

        // Title
        const titleEl = document.createElement('h1');
        titleEl.className = 'ss-title';
        titleEl.textContent = this.title;
        this.overlay.appendChild(titleEl);

        // Subtitle
        const subtitleEl = document.createElement('p');
        subtitleEl.className = 'ss-subtitle';
        subtitleEl.textContent = this.subtitle;
        this.overlay.appendChild(subtitleEl);

        // Start button
        const startBtn = document.createElement('button');
        startBtn.className = 'ss-button';
        startBtn.textContent = 'Start Game';
        startBtn.addEventListener('click', () => {
            this.onStart();
            this.hide();
        });
        this.overlay.appendChild(startBtn);

        document.body.appendChild(this.overlay);
    }

    /** Hide the start screen overlay */
    hide() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    #injectStyles() {
        if (document.getElementById('start-screen-styles')) return;

        const style = document.createElement('style');
        style.id = 'start-screen-styles';
        style.textContent = `
            #start-screen-overlay {
                position: fixed;
                inset: 0;
                z-index: 100;
                background: rgba(20, 20, 20, 0.95);
                backdrop-filter: blur(4px);

                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2rem;
            }

            .ss-title {
                color: #fff;
                font-size: 3.5rem;
                font-weight: bold;
                letter-spacing: 0.15em;
                text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
                margin: 0;
            }

            .ss-subtitle {
                color: #aaa;
                font-size: 1.2rem;
                letter-spacing: 0.08em;
                margin: 0;
            }

            .ss-button {
                padding: 1rem 2.5rem;
                font-size: 1.1rem;
                font-weight: bold;
                letter-spacing: 0.06em;
                color: #fff;
                background: rgba(100, 150, 255, 0.8);
                border: 2px solid rgba(100, 150, 255, 1);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .ss-button:hover {
                background: rgba(100, 150, 255, 1);
                box-shadow: 0 0 20px rgba(100, 150, 255, 0.6);
                transform: scale(1.05);
            }

            .ss-button:active {
                transform: scale(0.98);
            }
        `;

        document.head.appendChild(style);
    }
}
