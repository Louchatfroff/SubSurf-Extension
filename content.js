/**
 * Subway Surfers Hacks Menu v4.2 - Browser Extension
 * For yell0wsuit.page/assets/games/subway-surfers-unity/*
 * Features: Speed Hack, Key Mapper, Macro Recorder, Auto Clicker, Visual Filters, NoCoin Mode, Resolution Switcher
 */

(function() {
    'use strict';

    const EXTENSION_URL = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.getURL('') : '';

    // ============== CONFIGURATION ==============
    const CONFIG = {
        menuKey: 'Tab',
        timerKey: 'KeyT',
        restartKey: 'KeyR',
    };

    // ============== STATE ==============
    const state = {
        menuVisible: false,
        timerRunning: false,
        timerStartTime: 0,
        timerElapsed: 0,
        fpsVisible: false,
        keystrokeVisible: false,
        godmodeActive: false,
        noSideWallActive: false,
        noCoinModeActive: false,
        gameInstance: null,
        unityModule: null,
        isResolutionForced: false,
        currentResolution: null,
        blackBarsEnabled: true,
        barsColor: '#000000',
        pressedKeys: new Set(),
        // Speed Hack
        speedHackEnabled: false,
        gameSpeed: 1.0,
        // Key Mapper
        keyMapperEnabled: false,
        keyMappings: {},
        // Macro
        macroRecording: false,
        macroPlaying: false,
        macroData: [],
        macroStartTime: 0,
        macroLoop: false,
        // Auto Clicker
        autoClickerEnabled: false,
        autoClickerKeys: [],
        autoClickerInterval: 100,
        autoClickerTimers: [],
        // Visual Filters
        filtersEnabled: false,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        sharpness: 0,
        antialiasing: true,
    };

    const RESOLUTIONS = {
        '608x1080': { width: 608, height: 1080, label: '608×1080 // TIKTOK' },
        '890x1080': { width: 890, height: 1080, label: '890×1080 // LARGE' },
        '1080x1920': { width: 1080, height: 1920, label: '1080×1920 // VERTICAL' },
        '1920x1080': { width: 1920, height: 1080, label: '1920×1080 // LANDSCAPE' },
        '1280x720': { width: 1280, height: 720, label: '1280×720 // 720P' },
        'custom': { width: 0, height: 0, label: 'CUSTOM' },
    };

    // ============== STYLES ==============
    const STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root {
            --hack-bg-primary: #000000;
            --hack-bg-secondary: #0a0a0a;
            --hack-text-primary: #ffffff;
            --hack-text-secondary: #808080;
            --hack-accent: #ff0000;
            --hack-border: #1a1a1a;
            --hack-hover: #141414;
        }

        #hack-menu {
            position: fixed;
            top: 50%;
            left: 20px;
            transform: translateY(-50%);
            width: 400px;
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-border);
            padding: 0;
            z-index: 2147483647;
            font-family: 'JetBrains Mono', monospace;
            color: var(--hack-text-primary);
            display: none;
            user-select: none;
            overflow: hidden;
        }

        #hack-menu.visible { display: block; animation: hackFadeIn 0.4s ease; }

        @keyframes hackFadeIn {
            from { opacity: 0; transform: translateY(-50%) translateX(-20px); }
            to { opacity: 1; transform: translateY(-50%) translateX(0); }
        }

        #hack-menu::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--hack-accent), transparent);
            animation: scanline 3s infinite;
        }

        @keyframes scanline { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

        #hack-menu-header {
            background: var(--hack-bg-secondary);
            padding: 15px 20px;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--hack-border);
        }

        #hack-menu-title {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        #hack-menu-title::before { content: '// '; color: var(--hack-accent); }

        .menu-version { font-size: 9px; color: var(--hack-text-secondary); margin-left: 8px; }

        #hack-menu-close {
            background: transparent;
            border: 1px solid var(--hack-border);
            color: var(--hack-text-secondary);
            width: 28px; height: 28px;
            cursor: pointer;
            font-size: 12px;
            font-family: inherit;
            transition: all 0.2s ease;
        }

        #hack-menu-close:hover { border-color: var(--hack-accent); color: var(--hack-accent); }

        #hack-menu-content {
            padding: 12px;
            max-height: 70vh;
            overflow-y: auto;
        }

        #hack-menu-content::-webkit-scrollbar { width: 4px; }
        #hack-menu-content::-webkit-scrollbar-track { background: var(--hack-bg-primary); }
        #hack-menu-content::-webkit-scrollbar-thumb { background: var(--hack-accent); }

        .hack-section { margin-bottom: 15px; }

        .hack-section-title {
            font-size: 9px;
            font-weight: 700;
            color: var(--hack-accent);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 1px solid var(--hack-border);
        }

        .hack-section-title::before { content: '> '; color: var(--hack-text-secondary); }

        .hack-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            background: var(--hack-bg-secondary);
            border: 1px solid var(--hack-border);
            margin-bottom: 6px;
            transition: all 0.2s ease;
        }

        .hack-item:hover { background: var(--hack-hover); border-color: var(--hack-text-secondary); }

        .hack-item-info { flex: 1; }
        .hack-item-name { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .hack-item-desc { font-size: 9px; color: var(--hack-text-secondary); margin-top: 2px; }

        .hack-switch { position: relative; width: 44px; height: 22px; margin-left: 10px; flex-shrink: 0; }
        .hack-switch input { opacity: 0; width: 0; height: 0; }
        .hack-slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-border);
            transition: 0.3s ease;
        }
        .hack-slider::before {
            position: absolute;
            content: "";
            height: 14px; width: 14px;
            left: 3px; bottom: 3px;
            background: var(--hack-text-secondary);
            transition: 0.3s ease;
        }
        .hack-switch input:checked + .hack-slider { border-color: var(--hack-accent); }
        .hack-switch input:checked + .hack-slider::before { transform: translateX(22px); background: var(--hack-accent); }

        .hack-btn {
            background: var(--hack-bg-secondary);
            border: 1px solid var(--hack-border);
            color: var(--hack-text-primary);
            padding: 10px 14px;
            cursor: pointer;
            font-size: 10px;
            font-weight: 600;
            font-family: inherit;
            width: 100%;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.2s ease;
        }
        .hack-btn:hover { border-color: var(--hack-text-secondary); background: var(--hack-hover); }
        .hack-btn.accent { border-color: var(--hack-accent); color: var(--hack-accent); }
        .hack-btn.accent:hover { background: var(--hack-accent); color: var(--hack-bg-primary); }
        .hack-btn.recording { background: var(--hack-accent); color: white; animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0.7; } }

        .hack-btn-row { display: flex; gap: 6px; margin-top: 8px; }
        .hack-btn-row .hack-btn { flex: 1; }

        .hack-select {
            width: 100%;
            padding: 10px;
            background: var(--hack-bg-secondary);
            border: 1px solid var(--hack-border);
            color: var(--hack-text-primary);
            font-size: 10px;
            font-family: inherit;
            cursor: pointer;
            margin-bottom: 6px;
        }
        .hack-select:focus { outline: none; border-color: var(--hack-accent); }
        .hack-select option { background: var(--hack-bg-primary); }

        .hack-input-row { display: flex; gap: 6px; margin-bottom: 6px; }
        .hack-input {
            flex: 1;
            padding: 8px 10px;
            background: var(--hack-bg-secondary);
            border: 1px solid var(--hack-border);
            color: var(--hack-text-primary);
            font-size: 10px;
            font-family: inherit;
        }
        .hack-input:focus { outline: none; border-color: var(--hack-accent); }
        .hack-input::placeholder { color: var(--hack-text-secondary); }

        .hack-slider-container { margin: 8px 0; }
        .hack-range {
            width: 100%;
            height: 6px;
            background: var(--hack-bg-secondary);
            border: 1px solid var(--hack-border);
            outline: none;
            -webkit-appearance: none;
        }
        .hack-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px; height: 14px;
            background: var(--hack-accent);
            cursor: pointer;
            border: none;
        }
        .hack-range-label {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: var(--hack-text-secondary);
            margin-top: 4px;
        }
        .hack-range-value { color: var(--hack-accent); font-weight: 600; }

        .hack-checkbox-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
            font-size: 10px;
            color: var(--hack-text-secondary);
        }
        .hack-checkbox-row input[type="checkbox"] { width: 14px; height: 14px; accent-color: var(--hack-accent); }

        .hack-color-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .hack-color-input { width: 35px; height: 25px; border: 1px solid var(--hack-border); background: none; cursor: pointer; }
        .hack-color-label { font-size: 10px; color: var(--hack-text-secondary); }

        .hack-key-list { margin-top: 8px; }
        .hack-key-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: var(--hack-bg-secondary);
            border: 1px solid var(--hack-border);
            margin-bottom: 4px;
            font-size: 10px;
        }
        .hack-key-item .key-from, .hack-key-item .key-to {
            padding: 4px 10px;
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-border);
            min-width: 50px;
            text-align: center;
        }
        .hack-key-item .key-arrow { color: var(--hack-accent); }
        .hack-key-item .key-remove {
            margin-left: auto;
            background: transparent;
            border: none;
            color: var(--hack-text-secondary);
            cursor: pointer;
            font-size: 12px;
        }
        .hack-key-item .key-remove:hover { color: var(--hack-accent); }

        .injection-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px;
            background: var(--hack-bg-secondary);
            border: 1px solid var(--hack-border);
            margin-bottom: 12px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .injection-dot { width: 6px; height: 6px; background: var(--hack-accent); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* Overlays */
        #speedrun-timer {
            position: fixed;
            top: 20px; right: 20px;
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-border);
            color: var(--hack-text-primary);
            padding: 12px 20px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 28px;
            font-weight: 700;
            z-index: 2147483646;
            display: none;
        }
        #speedrun-timer.visible { display: block; }
        #speedrun-timer.running { border-color: var(--hack-accent); }
        #speedrun-timer.nocoin-fail { animation: failShake 0.5s ease; }
        @keyframes failShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }

        #fps-counter {
            position: fixed;
            top: 20px; left: 20px;
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-border);
            color: var(--hack-text-primary);
            padding: 8px 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            z-index: 2147483646;
            display: none;
        }
        #fps-counter.visible { display: block; }
        #fps-counter .fps-value { color: var(--hack-accent); }

        #speed-indicator {
            position: fixed;
            top: 60px; left: 20px;
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-accent);
            color: var(--hack-accent);
            padding: 8px 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            z-index: 2147483646;
            display: none;
        }
        #speed-indicator.visible { display: block; }

        #keystroke-viewer {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            z-index: 2147483646;
        }
        #keystroke-viewer.visible { display: flex; }
        .keystroke-row { display: flex; gap: 6px; }
        .keystroke-key {
            width: 45px; height: 45px;
            background: var(--hack-bg-primary);
            border: 2px solid var(--hack-border);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            font-weight: 700;
            color: var(--hack-text-secondary);
            transition: all 0.1s ease;
        }
        .keystroke-key.active { background: var(--hack-accent); border-color: var(--hack-accent); color: var(--hack-bg-primary); transform: scale(0.95); }
        .keystroke-key.space { width: 140px; }

        #nocoin-status, #macro-status, #autoclicker-status {
            position: fixed;
            right: 20px;
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-accent);
            color: var(--hack-accent);
            padding: 8px 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1px;
            z-index: 2147483646;
            display: none;
        }
        #nocoin-status { top: 80px; }
        #macro-status { top: 110px; }
        #autoclicker-status { top: 140px; }
        #nocoin-status.visible, #macro-status.visible, #autoclicker-status.visible { display: block; }

        #resolution-indicator {
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-accent);
            color: var(--hack-text-primary);
            padding: 6px 16px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            z-index: 2147483646;
            display: none;
        }
        #resolution-indicator.visible { display: block; }

        #hack-status {
            position: fixed;
            bottom: 20px; right: 20px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 2147483646;
        }
        .hack-status-item {
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-border);
            padding: 6px 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            display: none;
        }
        .hack-status-item.active { display: flex; }
        .hack-status-item.godmode { border-color: var(--hack-accent); color: var(--hack-accent); }
        .hack-status-item.nowall { border-color: #00ff00; color: #00ff00; }

        #hack-notification {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--hack-bg-primary);
            border: 1px solid var(--hack-border);
            color: var(--hack-text-primary);
            padding: 12px 25px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            z-index: 2147483647;
            opacity: 0;
            transition: all 0.3s ease;
        }
        #hack-notification.visible { opacity: 1; transform: translateX(-50%) translateY(-10px); }
        #hack-notification::before { content: '// '; color: var(--hack-accent); }

        #hack-menu-footer {
            padding: 12px;
            border-top: 1px solid var(--hack-border);
            font-size: 8px;
            color: var(--hack-text-secondary);
            text-align: center;
            letter-spacing: 1px;
        }
        #hack-menu-footer a { color: var(--hack-accent); text-decoration: none; }
    `;

    // ============== SPEED HACK ==============
    const SpeedHack = {
        originalRAF: null,
        originalSetTimeout: null,
        originalSetInterval: null,
        originalDateNow: null,
        originalPerfNow: null,
        startTime: 0,
        startPerfTime: 0,
        enabled: false,

        init() {
            this.originalRAF = window.requestAnimationFrame.bind(window);
            this.originalSetTimeout = window.setTimeout.bind(window);
            this.originalSetInterval = window.setInterval.bind(window);
            this.originalDateNow = Date.now.bind(Date);
            this.originalPerfNow = performance.now.bind(performance);
            this.startTime = this.originalDateNow();
            this.startPerfTime = this.originalPerfNow();
        },

        enable() {
            if (this.enabled) return;
            this.enabled = true;
            const self = this;
            const speed = () => state.gameSpeed;

            // Override time functions
            Date.now = function() {
                const elapsed = self.originalDateNow() - self.startTime;
                return self.startTime + (elapsed * speed());
            };

            performance.now = function() {
                const elapsed = self.originalPerfNow() - self.startPerfTime;
                return self.startPerfTime + (elapsed * speed());
            };

            console.log('[SpeedHack] Enabled');
        },

        disable() {
            if (!this.enabled) return;
            this.enabled = false;
            Date.now = this.originalDateNow;
            performance.now = this.originalPerfNow;
            console.log('[SpeedHack] Disabled');
        },

        setSpeed(multiplier) {
            // Reset timing base when speed changes
            this.startTime = this.originalDateNow();
            this.startPerfTime = this.originalPerfNow();
            state.gameSpeed = multiplier;
            updateSpeedIndicator();
        }
    };

    // ============== KEY MAPPER ==============
    const KeyMapper = {
        listening: false,
        listenTarget: null,
        listenCallback: null,

        init() {
            document.addEventListener('keydown', (e) => {
                if (this.listening) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.listenCallback) {
                        this.listenCallback(e.code);
                    }
                    this.listening = false;
                    return;
                }

                if (!state.keyMapperEnabled) return;

                const mapped = state.keyMappings[e.code];
                if (mapped) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.simulateKey(mapped, 'keydown');
                }
            }, true);

            document.addEventListener('keyup', (e) => {
                if (!state.keyMapperEnabled) return;

                const mapped = state.keyMappings[e.code];
                if (mapped) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.simulateKey(mapped, 'keyup');
                }
            }, true);
        },

        simulateKey(code, type) {
            const keyMap = {
                'KeyW': 'w', 'KeyA': 'a', 'KeyS': 's', 'KeyD': 'd',
                'ArrowUp': 'ArrowUp', 'ArrowDown': 'ArrowDown', 'ArrowLeft': 'ArrowLeft', 'ArrowRight': 'ArrowRight',
                'Space': ' ', 'Enter': 'Enter', 'Escape': 'Escape'
            };
            const key = keyMap[code] || code.replace('Key', '').toLowerCase();

            const event = new KeyboardEvent(type, {
                code: code,
                key: key,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(event);
        },

        addMapping(from, to) {
            state.keyMappings[from] = to;
            this.updateUI();
            showNotification(`MAPPED: ${from} → ${to}`);
        },

        removeMapping(from) {
            delete state.keyMappings[from];
            this.updateUI();
        },

        listenForKey(target, callback) {
            this.listening = true;
            this.listenTarget = target;
            this.listenCallback = callback;
        },

        updateUI() {
            const list = document.getElementById('key-mapping-list');
            if (!list) return;

            list.innerHTML = '';
            for (const [from, to] of Object.entries(state.keyMappings)) {
                const item = document.createElement('div');
                item.className = 'hack-key-item';
                item.innerHTML = `
                    <span class="key-from">${from.replace('Key', '')}</span>
                    <span class="key-arrow">→</span>
                    <span class="key-to">${to.replace('Key', '')}</span>
                    <button class="key-remove" data-key="${from}">×</button>
                `;
                list.appendChild(item);
            }

            list.querySelectorAll('.key-remove').forEach(btn => {
                btn.addEventListener('click', () => this.removeMapping(btn.dataset.key));
            });
        }
    };

    // ============== MACRO RECORDER ==============
    const MacroRecorder = {
        init() {
            document.addEventListener('keydown', (e) => {
                if (state.macroRecording && !e.repeat) {
                    const time = Date.now() - state.macroStartTime;
                    state.macroData.push({ type: 'down', code: e.code, time });
                }
            }, true);

            document.addEventListener('keyup', (e) => {
                if (state.macroRecording) {
                    const time = Date.now() - state.macroStartTime;
                    state.macroData.push({ type: 'up', code: e.code, time });
                }
            }, true);
        },

        startRecording() {
            state.macroData = [];
            state.macroStartTime = Date.now();
            state.macroRecording = true;
            document.getElementById('macro-status').textContent = 'RECORDING...';
            document.getElementById('macro-status').classList.add('visible');
            document.getElementById('btn-record-macro').classList.add('recording');
            document.getElementById('btn-record-macro').textContent = 'STOP RECORDING';
            showNotification('MACRO: RECORDING STARTED');
        },

        stopRecording() {
            state.macroRecording = false;
            document.getElementById('macro-status').classList.remove('visible');
            document.getElementById('btn-record-macro').classList.remove('recording');
            document.getElementById('btn-record-macro').textContent = 'RECORD MACRO';
            showNotification(`MACRO: RECORDED ${state.macroData.length} EVENTS`);
        },

        play() {
            if (state.macroData.length === 0) {
                showNotification('MACRO: NO DATA RECORDED');
                return;
            }

            state.macroPlaying = true;
            document.getElementById('macro-status').textContent = 'PLAYING...';
            document.getElementById('macro-status').classList.add('visible');

            const playEvents = () => {
                let index = 0;
                const startTime = Date.now();

                const tick = () => {
                    if (!state.macroPlaying) return;

                    const elapsed = Date.now() - startTime;

                    while (index < state.macroData.length && state.macroData[index].time <= elapsed) {
                        const event = state.macroData[index];
                        KeyMapper.simulateKey(event.code, event.type === 'down' ? 'keydown' : 'keyup');
                        index++;
                    }

                    if (index < state.macroData.length) {
                        requestAnimationFrame(tick);
                    } else if (state.macroLoop && state.macroPlaying) {
                        index = 0;
                        playEvents();
                    } else {
                        this.stop();
                    }
                };

                tick();
            };

            playEvents();
        },

        stop() {
            state.macroPlaying = false;
            document.getElementById('macro-status').classList.remove('visible');
            showNotification('MACRO: STOPPED');
        },

        clear() {
            state.macroData = [];
            showNotification('MACRO: CLEARED');
        }
    };

    // ============== AUTO CLICKER ==============
    const AutoClicker = {
        start() {
            this.stop();

            if (state.autoClickerKeys.length === 0) {
                showNotification('AUTOCLICKER: NO KEYS SET');
                return;
            }

            state.autoClickerEnabled = true;
            document.getElementById('autoclicker-status').textContent = `AUTO: ${state.autoClickerKeys.join(', ')}`;
            document.getElementById('autoclicker-status').classList.add('visible');

            state.autoClickerKeys.forEach(key => {
                const timer = setInterval(() => {
                    if (!state.autoClickerEnabled) return;
                    KeyMapper.simulateKey(key, 'keydown');
                    setTimeout(() => KeyMapper.simulateKey(key, 'keyup'), 50);
                }, state.autoClickerInterval);
                state.autoClickerTimers.push(timer);
            });

            showNotification(`AUTOCLICKER: STARTED (${state.autoClickerInterval}ms)`);
        },

        stop() {
            state.autoClickerEnabled = false;
            state.autoClickerTimers.forEach(t => clearInterval(t));
            state.autoClickerTimers = [];
            document.getElementById('autoclicker-status').classList.remove('visible');
        },

        setKeys(keys) {
            state.autoClickerKeys = keys.split(',').map(k => k.trim()).filter(k => k);
        },

        setInterval(ms) {
            state.autoClickerInterval = Math.max(10, parseInt(ms) || 100);
        }
    };

    // ============== VISUAL FILTERS ==============
    const VisualFilters = {
        svgFilter: null,

        init() {
            // Create SVG filter for sharpening
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '0');
            svg.setAttribute('height', '0');
            svg.style.position = 'absolute';
            svg.innerHTML = `
                <defs>
                    <filter id="sharpen-filter">
                        <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"/>
                    </filter>
                    <filter id="sharpen-strong">
                        <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="-1 -1 -1 -1 9 -1 -1 -1 -1"/>
                    </filter>
                </defs>
            `;
            document.body.appendChild(svg);
            this.svgFilter = svg;
        },

        apply() {
            const canvas = document.querySelector('canvas');
            if (!canvas) return;

            if (!state.filtersEnabled) {
                canvas.style.filter = '';
                canvas.style.imageRendering = '';
                return;
            }

            // Build CSS filter string
            const filters = [];

            if (state.brightness !== 100) {
                filters.push(`brightness(${state.brightness}%)`);
            }
            if (state.contrast !== 100) {
                filters.push(`contrast(${state.contrast}%)`);
            }
            if (state.saturation !== 100) {
                filters.push(`saturate(${state.saturation}%)`);
            }
            if (state.hue !== 0) {
                filters.push(`hue-rotate(${state.hue}deg)`);
            }
            if (state.sharpness > 0) {
                if (state.sharpness > 50) {
                    filters.push('url(#sharpen-strong)');
                } else {
                    filters.push('url(#sharpen-filter)');
                }
            }

            canvas.style.filter = filters.join(' ');

            // Anti-aliasing
            if (state.antialiasing) {
                canvas.style.imageRendering = 'auto';
            } else {
                canvas.style.imageRendering = 'pixelated';
            }
        },

        setBrightness(value) {
            state.brightness = Math.max(0, Math.min(200, value));
            this.apply();
        },

        setContrast(value) {
            state.contrast = Math.max(0, Math.min(200, value));
            this.apply();
        },

        setSaturation(value) {
            state.saturation = Math.max(0, Math.min(200, value));
            this.apply();
        },

        setHue(value) {
            state.hue = Math.max(-180, Math.min(180, value));
            this.apply();
        },

        setSharpness(value) {
            state.sharpness = Math.max(0, Math.min(100, value));
            this.apply();
        },

        setAntialiasing(enabled) {
            state.antialiasing = enabled;
            this.apply();
        },

        reset() {
            state.brightness = 100;
            state.contrast = 100;
            state.saturation = 100;
            state.hue = 0;
            state.sharpness = 0;
            state.antialiasing = true;
            this.apply();
            this.updateUI();
            showNotification('FILTERS: RESET');
        },

        updateUI() {
            const setSlider = (id, value) => {
                const slider = document.getElementById(id);
                const valueEl = document.getElementById(id + '-value');
                if (slider) slider.value = value;
                if (valueEl) valueEl.textContent = value + (id === 'filter-hue' ? '°' : '%');
            };

            setSlider('filter-brightness', state.brightness);
            setSlider('filter-contrast', state.contrast);
            setSlider('filter-saturation', state.saturation);
            setSlider('filter-hue', state.hue);
            setSlider('filter-sharpness', state.sharpness);

            const aaCheckbox = document.getElementById('filter-antialiasing');
            if (aaCheckbox) aaCheckbox.checked = state.antialiasing;
        },

        // Presets
        applyPreset(preset) {
            switch(preset) {
                case 'vibrant':
                    state.brightness = 105;
                    state.contrast = 115;
                    state.saturation = 130;
                    state.hue = 0;
                    state.sharpness = 30;
                    break;
                case 'cinematic':
                    state.brightness = 95;
                    state.contrast = 120;
                    state.saturation = 90;
                    state.hue = -10;
                    state.sharpness = 20;
                    break;
                case 'retro':
                    state.brightness = 100;
                    state.contrast = 110;
                    state.saturation = 70;
                    state.hue = 20;
                    state.sharpness = 0;
                    break;
                case 'sharp':
                    state.brightness = 100;
                    state.contrast = 105;
                    state.saturation = 100;
                    state.hue = 0;
                    state.sharpness = 80;
                    break;
                case 'soft':
                    state.brightness = 105;
                    state.contrast = 90;
                    state.saturation = 95;
                    state.hue = 0;
                    state.sharpness = 0;
                    break;
                default:
                    this.reset();
                    return;
            }
            this.apply();
            this.updateUI();
            showNotification(`PRESET: ${preset.toUpperCase()}`);
        }
    };

    // ============== UNITY HACKS ==============
    const UnityHacks = {
        module: null,
        gameInstance: null,
        injected: false,
        lastCoinCount: 0,
        baselineCoins: 0,
        idbCheckInterval: null,

        init() {
            this.waitForUnity();
            this.setupNoCoinDetection();
        },

        waitForUnity() {
            const check = setInterval(() => {
                if (window.unityGame) this.gameInstance = window.unityGame;
                if (window.my4399UnityModule) this.module = window.my4399UnityModule;
                if (window.UnityLoader?.Instantiated) {
                    for (let key in window.UnityLoader.Instantiated) {
                        const inst = window.UnityLoader.Instantiated[key];
                        if (inst?.Module) {
                            this.module = inst.Module;
                            this.gameInstance = inst;
                            break;
                        }
                    }
                }
                if (this.module || this.gameInstance) {
                    clearInterval(check);
                    this.inject();
                }
            }, 500);

            setTimeout(() => {
                clearInterval(check);
                if (!this.injected) this.injectFallback();
            }, 30000);
        },

        inject() {
            if (this.injected) return;
            this.injected = true;
            this.hookSendMessage();
            this.updateStatus(true);
        },

        injectFallback() {
            this.injected = true;
            if (typeof SendMessage === 'function') this.hookGlobalSendMessage();
            this.updateStatus(true, 'MONITOR');
        },

        // FIXED: NoCoin detection with reduced polling (500ms instead of 50ms)
        setupNoCoinDetection() {
            // Only poll every 500ms to avoid lag
            this.idbCheckInterval = setInterval(() => {
                if (!state.noCoinModeActive || !state.timerRunning) return;
                this.checkIndexedDBForCoins();
            }, 500);
        },

        async checkIndexedDBForCoins() {
            if (!state.noCoinModeActive) return;

            try {
                const dbRequest = indexedDB.open('/idbfs');
                dbRequest.onsuccess = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('FILE_DATA')) {
                        db.close();
                        return;
                    }

                    const tx = db.transaction('FILE_DATA', 'readonly');
                    const store = tx.objectStore('FILE_DATA');

                    const getReq = store.get('/idbfs/5bc32e1a17c4bdfdd5da57ab99ff0a2c/Save/cloud');
                    getReq.onsuccess = () => {
                        if (getReq.result?.contents) {
                            this.parseSaveForCoins(getReq.result.contents);
                        }
                    };

                    tx.oncomplete = () => db.close();
                };
            } catch (e) {}
        },

        parseSaveForCoins(contents) {
            if (!state.noCoinModeActive || !state.timerRunning) return;

            try {
                const data = contents instanceof Uint8Array ? contents : new Uint8Array(contents);
                const text = new TextDecoder('utf-8', { fatal: false }).decode(data);

                const coinMatch = text.match(/obfuscatedCoins[^\d]*(\d+)/i);
                if (coinMatch) {
                    const coins = parseInt(coinMatch[1]);

                    if (this.baselineCoins === 0 && coins > 0) {
                        this.baselineCoins = coins;
                        this.lastCoinCount = coins;
                        return;
                    }

                    if (coins > this.lastCoinCount && this.lastCoinCount > 0) {
                        console.log('[NOCOIN] COIN DETECTED:', this.lastCoinCount, '->', coins);
                        this.lastCoinCount = coins;
                        onCoinCollected();
                        return;
                    }

                    this.lastCoinCount = coins;
                }
            } catch (e) {}
        },

        resetCoinBaseline() {
            this.baselineCoins = 0;
            this.lastCoinCount = 0;
        },

        hookSendMessage() {
            const self = this;
            const targets = [window, this.gameInstance, this.module].filter(Boolean);

            targets.forEach(target => {
                if (target.SendMessage && !target.SendMessage._hooked) {
                    const original = target.SendMessage.bind(target);
                    target.SendMessage = function(obj, method, param) {
                        return self.intercept(obj, method, param, original);
                    };
                    target.SendMessage._hooked = true;
                }
            });
        },

        hookGlobalSendMessage() {
            const self = this;
            if (window.SendMessage && !window.SendMessage._hooked) {
                const original = window.SendMessage;
                window.SendMessage = function(obj, method, param) {
                    return self.intercept(obj, method, param, original);
                };
                window.SendMessage._hooked = true;
            }
        },

        intercept(obj, method, param, original) {
            const m = (method || '').toLowerCase();
            const o = (obj || '').toLowerCase();
            const p = String(param || '').toLowerCase();

            if (state.godmodeActive) {
                const deathKeywords = ['die', 'death', 'dead', 'kill', 'gameover', 'crash', 'hit', 'collide', 'damage', 'hurt', 'fail', 'stumble', 'fall'];
                if (deathKeywords.some(k => m.includes(k) || o.includes(k) || p.includes(k))) {
                    return;
                }
            }

            if (state.noSideWallActive) {
                const wallKeywords = ['side', 'wall', 'barrier', 'obstacle', 'leftwall', 'rightwall', 'sideimpact'];
                if (wallKeywords.some(k => m.includes(k) || p.includes(k))) {
                    return;
                }
            }

            if (state.noCoinModeActive) {
                const coinKeywords = ['coin', 'collect', 'pickup', 'loot'];
                if (coinKeywords.some(k => m.includes(k) || p.includes(k))) {
                    onCoinCollected();
                }
            }

            if (m.includes('start') || m.includes('begin') || m.includes('play')) {
                if (state.noCoinModeActive && !state.timerRunning) {
                    setTimeout(startTimer, 100);
                }
            }

            if (original) return original(obj, method, param);
        },

        send(obj, method, param = '') {
            const targets = [this.gameInstance, window.unityGame, window].filter(t => t?.SendMessage);
            for (const t of targets) {
                try {
                    t.SendMessage(obj, method, param);
                    return true;
                } catch (e) {}
            }
            return false;
        },

        updateStatus(success, mode = 'DIRECT') {
            const el = document.getElementById('injection-status');
            if (el) {
                el.innerHTML = `<div class="injection-dot"></div> ENGINE: ${mode} // ACTIVE`;
            }
        },

        async getIDBVersion() {
            return new Promise((resolve) => {
                const request = indexedDB.open('/idbfs');
                request.onsuccess = (e) => {
                    const version = e.target.result.version;
                    e.target.result.close();
                    resolve(version);
                };
                request.onerror = () => resolve(21);
            });
        },

        async unlockAll() {
            showNotification('UNLOCK_ALL: IMPORTING...');

            try {
                const response = await fetch(EXTENSION_URL + 'unlockall.bin');
                if (!response.ok) {
                    this.unlockAllFallback();
                    return;
                }

                const saveExport = await response.json();
                if (!saveExport.indexedDB) {
                    this.unlockAllFallback();
                    return;
                }

                const idbVersion = await this.getIDBVersion();
                const dbRequest = indexedDB.open('/idbfs', idbVersion);

                dbRequest.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('FILE_DATA')) {
                        db.createObjectStore('FILE_DATA');
                    }
                };

                dbRequest.onsuccess = (e) => {
                    const db = e.target.result;
                    const tx = db.transaction('FILE_DATA', 'readwrite');
                    const store = tx.objectStore('FILE_DATA');

                    for (const [path, data] of Object.entries(saveExport.indexedDB)) {
                        if (data.contents) {
                            store.put({
                                timestamp: new Date(data.timestamp),
                                mode: data.mode,
                                contents: new Uint8Array(data.contents)
                            }, path);
                        } else {
                            store.put({ timestamp: new Date(data.timestamp), mode: data.mode }, path);
                        }
                    }

                    tx.oncomplete = () => {
                        db.close();
                        showNotification('UNLOCK_ALL: SUCCESS // RELOAD');
                        setTimeout(() => {
                            if (confirm('Save imported! Reload page?')) location.reload();
                        }, 500);
                    };
                };
            } catch (e) {
                this.unlockAllFallback();
            }
        },

        unlockAllFallback() {
            this.send('GameManager', 'AddCoins', '99999999');
            this.send('GameManager', 'AddKeys', '9999');
            showNotification('UNLOCK_ALL: FALLBACK');
        }
    };

    // ============== RESOLUTION MANAGER ==============
    const ResolutionManager = {
        apply(key, blackBars = true, color = '#000000') {
            let w, h;
            if (key === 'custom') {
                w = parseInt(document.getElementById('custom-width')?.value) || 608;
                h = parseInt(document.getElementById('custom-height')?.value) || 1080;
            } else if (RESOLUTIONS[key]) {
                w = RESOLUTIONS[key].width;
                h = RESOLUTIONS[key].height;
            } else return;

            state.isResolutionForced = true;
            state.currentResolution = `${w}x${h}`;

            document.body.style.cssText = `margin:0!important;padding:0!important;width:${w}px!important;height:${h}px!important;overflow:hidden!important;position:fixed!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;`;
            document.documentElement.style.cssText = `margin:0!important;padding:0!important;width:100vw!important;height:100vh!important;overflow:hidden!important;background:${blackBars ? color : 'transparent'}!important;`;

            const canvas = document.querySelector('canvas');
            if (canvas) { canvas.style.width = '100%'; canvas.style.height = '100%'; }

            setTimeout(() => window.dispatchEvent(new Event('resize')), 100);

            const ind = document.getElementById('resolution-indicator');
            if (ind) { ind.textContent = `RES: ${w}×${h}`; ind.classList.add('visible'); }

            showNotification(`RESOLUTION: ${w}×${h}`);
        },

        reset() {
            document.body.style.cssText = '';
            document.documentElement.style.cssText = '';
            state.isResolutionForced = false;
            window.dispatchEvent(new Event('resize'));
            document.getElementById('resolution-indicator')?.classList.remove('visible');
            showNotification('RESOLUTION: RESET');
        }
    };

    // ============== UI ==============
    function createUI() {
        const style = document.createElement('style');
        style.textContent = STYLES;
        document.head.appendChild(style);

        const menu = document.createElement('div');
        menu.id = 'hack-menu';
        menu.innerHTML = `
            <div id="hack-menu-header">
                <div id="hack-menu-title">SUBWAY_HACKS<span class="menu-version">v4.2</span></div>
                <button id="hack-menu-close">×</button>
            </div>
            <div id="hack-menu-content">
                <div id="injection-status" class="injection-status">
                    <div class="injection-dot"></div>CONNECTING...
                </div>

                <div class="hack-section">
                    <div class="hack-section-title">SPEED HACK</div>
                    <div class="hack-item">
                        <div class="hack-item-info">
                            <div class="hack-item-name">ENABLE SPEED HACK</div>
                            <div class="hack-item-desc">Modify game speed</div>
                        </div>
                        <label class="hack-switch"><input type="checkbox" id="toggle-speedhack"><span class="hack-slider"></span></label>
                    </div>
                    <div class="hack-slider-container">
                        <input type="range" class="hack-range" id="speed-slider" min="0.1" max="5" step="0.1" value="1">
                        <div class="hack-range-label">
                            <span>0.1x</span>
                            <span class="hack-range-value" id="speed-value">1.0x</span>
                            <span>5x</span>
                        </div>
                    </div>
                    <div class="hack-btn-row">
                        <button class="hack-btn" data-speed="0.5">0.5x</button>
                        <button class="hack-btn" data-speed="1">1x</button>
                        <button class="hack-btn" data-speed="2">2x</button>
                        <button class="hack-btn" data-speed="3">3x</button>
                    </div>
                </div>

                <div class="hack-section">
                    <div class="hack-section-title">KEY MAPPER</div>
                    <div class="hack-item">
                        <div class="hack-item-info">
                            <div class="hack-item-name">ENABLE KEY MAPPER</div>
                            <div class="hack-item-desc">Remap game keys</div>
                        </div>
                        <label class="hack-switch"><input type="checkbox" id="toggle-keymapper"><span class="hack-slider"></span></label>
                    </div>
                    <div class="hack-input-row">
                        <input type="text" class="hack-input" id="key-from" placeholder="FROM (click)" readonly>
                        <input type="text" class="hack-input" id="key-to" placeholder="TO (click)" readonly>
                    </div>
                    <button class="hack-btn" id="btn-add-mapping">ADD MAPPING</button>
                    <div id="key-mapping-list" class="hack-key-list"></div>
                </div>

                <div class="hack-section">
                    <div class="hack-section-title">MACRO RECORDER</div>
                    <div class="hack-btn-row">
                        <button class="hack-btn accent" id="btn-record-macro">RECORD MACRO</button>
                        <button class="hack-btn" id="btn-play-macro">PLAY</button>
                        <button class="hack-btn" id="btn-stop-macro">STOP</button>
                    </div>
                    <div class="hack-checkbox-row">
                        <input type="checkbox" id="macro-loop">
                        <span>LOOP PLAYBACK</span>
                    </div>
                    <button class="hack-btn" id="btn-clear-macro" style="margin-top:6px;">CLEAR MACRO</button>
                </div>

                <div class="hack-section">
                    <div class="hack-section-title">AUTO CLICKER</div>
                    <div class="hack-input-row">
                        <input type="text" class="hack-input" id="autoclicker-keys" placeholder="KEYS (e.g. Space,KeyW)">
                        <input type="number" class="hack-input" id="autoclicker-interval" placeholder="MS" value="100" style="width:80px;">
                    </div>
                    <div class="hack-btn-row">
                        <button class="hack-btn accent" id="btn-start-autoclicker">START</button>
                        <button class="hack-btn" id="btn-stop-autoclicker">STOP</button>
                    </div>
                </div>

                <div class="hack-section">
                    <div class="hack-section-title">VISUAL FILTERS</div>
                    <div class="hack-item">
                        <div class="hack-item-info">
                            <div class="hack-item-name">ENABLE FILTERS</div>
                            <div class="hack-item-desc">Color correction & effects</div>
                        </div>
                        <label class="hack-switch"><input type="checkbox" id="toggle-filters"><span class="hack-slider"></span></label>
                    </div>
                    <div class="hack-slider-container">
                        <div class="hack-range-label"><span>BRIGHTNESS</span><span class="hack-range-value" id="filter-brightness-value">100%</span></div>
                        <input type="range" class="hack-range" id="filter-brightness" min="0" max="200" value="100">
                    </div>
                    <div class="hack-slider-container">
                        <div class="hack-range-label"><span>CONTRAST</span><span class="hack-range-value" id="filter-contrast-value">100%</span></div>
                        <input type="range" class="hack-range" id="filter-contrast" min="0" max="200" value="100">
                    </div>
                    <div class="hack-slider-container">
                        <div class="hack-range-label"><span>SATURATION</span><span class="hack-range-value" id="filter-saturation-value">100%</span></div>
                        <input type="range" class="hack-range" id="filter-saturation" min="0" max="200" value="100">
                    </div>
                    <div class="hack-slider-container">
                        <div class="hack-range-label"><span>HUE</span><span class="hack-range-value" id="filter-hue-value">0°</span></div>
                        <input type="range" class="hack-range" id="filter-hue" min="-180" max="180" value="0">
                    </div>
                    <div class="hack-slider-container">
                        <div class="hack-range-label"><span>SHARPNESS</span><span class="hack-range-value" id="filter-sharpness-value">0%</span></div>
                        <input type="range" class="hack-range" id="filter-sharpness" min="0" max="100" value="0">
                    </div>
                    <div class="hack-checkbox-row">
                        <input type="checkbox" id="filter-antialiasing" checked>
                        <span>ANTI-ALIASING</span>
                    </div>
                    <div class="hack-btn-row" style="margin-top:10px;">
                        <button class="hack-btn" data-preset="vibrant">VIBRANT</button>
                        <button class="hack-btn" data-preset="cinematic">CINEMA</button>
                        <button class="hack-btn" data-preset="retro">RETRO</button>
                    </div>
                    <div class="hack-btn-row">
                        <button class="hack-btn" data-preset="sharp">SHARP</button>
                        <button class="hack-btn" data-preset="soft">SOFT</button>
                        <button class="hack-btn accent" id="btn-reset-filters">RESET</button>
                    </div>
                </div>

                <div class="hack-section">
                    <div class="hack-section-title">RESOLUTION</div>
                    <select class="hack-select" id="resolution-select">
                        <option value="">// SELECT</option>
                        ${Object.entries(RESOLUTIONS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
                    </select>
                    <div id="custom-res-inputs" style="display:none;">
                        <div class="hack-input-row">
                            <input type="number" class="hack-input" id="custom-width" placeholder="WIDTH">
                            <input type="number" class="hack-input" id="custom-height" placeholder="HEIGHT">
                        </div>
                    </div>
                    <div class="hack-color-row">
                        <input type="color" class="hack-color-input" id="bars-color" value="#000000">
                        <span class="hack-color-label">BARS COLOR</span>
                    </div>
                    <div class="hack-checkbox-row">
                        <input type="checkbox" id="black-bars" checked>
                        <span>BLACK BARS</span>
                    </div>
                    <div class="hack-btn-row">
                        <button class="hack-btn accent" id="btn-apply-res">APPLY</button>
                        <button class="hack-btn" id="btn-reset-res">RESET</button>
                    </div>
                </div>

                <div class="hack-section">
                    <div class="hack-section-title">OVERLAYS</div>
                    <div class="hack-item">
                        <div class="hack-item-info"><div class="hack-item-name">TIMER</div></div>
                        <label class="hack-switch"><input type="checkbox" id="toggle-timer"><span class="hack-slider"></span></label>
                    </div>
                    <div class="hack-item">
                        <div class="hack-item-info"><div class="hack-item-name">FPS</div></div>
                        <label class="hack-switch"><input type="checkbox" id="toggle-fps"><span class="hack-slider"></span></label>
                    </div>
                    <div class="hack-item">
                        <div class="hack-item-info"><div class="hack-item-name">KEYSTROKES</div></div>
                        <label class="hack-switch"><input type="checkbox" id="toggle-keys"><span class="hack-slider"></span></label>
                    </div>
                </div>

                <div class="hack-section">
                    <div class="hack-section-title">ENGINE HACKS // WIP</div>
                    <div class="hack-item" style="opacity:0.6;">
                        <div class="hack-item-info"><div class="hack-item-name">GODMODE [WIP]</div></div>
                        <label class="hack-switch"><input type="checkbox" id="toggle-godmode"><span class="hack-slider"></span></label>
                    </div>
                    <div class="hack-item" style="opacity:0.6;">
                        <div class="hack-item-info"><div class="hack-item-name">NO SIDEWALL [WIP]</div></div>
                        <label class="hack-switch"><input type="checkbox" id="toggle-nowall"><span class="hack-slider"></span></label>
                    </div>
                    <button class="hack-btn accent" id="btn-unlock-all">UNLOCK ALL</button>
                </div>

                <div class="hack-section">
                    <div class="hack-section-title">NOCOIN MODE</div>
                    <div class="hack-item">
                        <div class="hack-item-info">
                            <div class="hack-item-name">NOCOIN CHALLENGE</div>
                            <div class="hack-item-desc">Auto-restart on pickup</div>
                        </div>
                        <label class="hack-switch"><input type="checkbox" id="toggle-nocoin"><span class="hack-slider"></span></label>
                    </div>
                    <button class="hack-btn" id="btn-reset-timer">RESET TIMER</button>
                </div>
            </div>
            <div id="hack-menu-footer">MADE BY <a href="https://github.com/Louchatfroff" target="_blank">LOUCHAT</a></div>
        `;
        document.body.appendChild(menu);

        createOverlays();
        makeDraggable(menu);
        setupListeners();

        setTimeout(() => showNotification('PRESS TAB TO OPEN MENU'), 2000);
    }

    function createOverlays() {
        const overlays = `
            <div id="speedrun-timer">0.00</div>
            <div id="fps-counter">FPS: <span class="fps-value">--</span></div>
            <div id="speed-indicator">SPEED: 1.0x</div>
            <div id="keystroke-viewer">
                <div class="keystroke-row"><div class="keystroke-key" data-key="KeyW">W</div></div>
                <div class="keystroke-row">
                    <div class="keystroke-key" data-key="KeyA">A</div>
                    <div class="keystroke-key" data-key="KeyS">S</div>
                    <div class="keystroke-key" data-key="KeyD">D</div>
                </div>
                <div class="keystroke-row"><div class="keystroke-key space" data-key="Space">SPACE</div></div>
            </div>
            <div id="nocoin-status">NOCOIN ACTIVE</div>
            <div id="macro-status">MACRO</div>
            <div id="autoclicker-status">AUTO</div>
            <div id="resolution-indicator"></div>
            <div id="hack-status">
                <div class="hack-status-item godmode" id="status-godmode">GODMODE</div>
                <div class="hack-status-item nowall" id="status-nowall">NO_WALL</div>
            </div>
            <div id="hack-notification"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', overlays);
    }

    function makeDraggable(el) {
        const header = el.querySelector('#hack-menu-header');
        let dragging = false, startX, startY, initX, initY;

        header.addEventListener('mousedown', e => {
            if (e.target.id === 'hack-menu-close') return;
            dragging = true;
            startX = e.clientX; startY = e.clientY;
            const rect = el.getBoundingClientRect();
            initX = rect.left; initY = rect.top;
            el.style.transform = 'none';
        });

        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            el.style.left = `${initX + e.clientX - startX}px`;
            el.style.top = `${initY + e.clientY - startY}px`;
        });

        document.addEventListener('mouseup', () => dragging = false);
    }

    function setupListeners() {
        document.getElementById('hack-menu-close').addEventListener('click', toggleMenu);

        // Speed Hack
        document.getElementById('toggle-speedhack').addEventListener('change', e => {
            state.speedHackEnabled = e.target.checked;
            if (e.target.checked) {
                SpeedHack.enable();
                document.getElementById('speed-indicator').classList.add('visible');
            } else {
                SpeedHack.disable();
                document.getElementById('speed-indicator').classList.remove('visible');
            }
        });

        document.getElementById('speed-slider').addEventListener('input', e => {
            const speed = parseFloat(e.target.value);
            SpeedHack.setSpeed(speed);
            document.getElementById('speed-value').textContent = speed.toFixed(1) + 'x';
        });

        document.querySelectorAll('[data-speed]').forEach(btn => {
            btn.addEventListener('click', () => {
                const speed = parseFloat(btn.dataset.speed);
                document.getElementById('speed-slider').value = speed;
                SpeedHack.setSpeed(speed);
                document.getElementById('speed-value').textContent = speed.toFixed(1) + 'x';
            });
        });

        // Key Mapper
        document.getElementById('toggle-keymapper').addEventListener('change', e => {
            state.keyMapperEnabled = e.target.checked;
            showNotification(e.target.checked ? 'KEY MAPPER: ON' : 'KEY MAPPER: OFF');
        });

        document.getElementById('key-from').addEventListener('click', function() {
            this.value = 'Press a key...';
            KeyMapper.listenForKey(this, (code) => { this.value = code; });
        });

        document.getElementById('key-to').addEventListener('click', function() {
            this.value = 'Press a key...';
            KeyMapper.listenForKey(this, (code) => { this.value = code; });
        });

        document.getElementById('btn-add-mapping').addEventListener('click', () => {
            const from = document.getElementById('key-from').value;
            const to = document.getElementById('key-to').value;
            if (from && to && !from.includes('Press') && !to.includes('Press')) {
                KeyMapper.addMapping(from, to);
                document.getElementById('key-from').value = '';
                document.getElementById('key-to').value = '';
            }
        });

        // Macro
        document.getElementById('btn-record-macro').addEventListener('click', () => {
            if (state.macroRecording) {
                MacroRecorder.stopRecording();
            } else {
                MacroRecorder.startRecording();
            }
        });

        document.getElementById('btn-play-macro').addEventListener('click', () => MacroRecorder.play());
        document.getElementById('btn-stop-macro').addEventListener('click', () => MacroRecorder.stop());
        document.getElementById('btn-clear-macro').addEventListener('click', () => MacroRecorder.clear());
        document.getElementById('macro-loop').addEventListener('change', e => { state.macroLoop = e.target.checked; });

        // Auto Clicker
        document.getElementById('btn-start-autoclicker').addEventListener('click', () => {
            AutoClicker.setKeys(document.getElementById('autoclicker-keys').value);
            AutoClicker.setInterval(document.getElementById('autoclicker-interval').value);
            AutoClicker.start();
        });
        document.getElementById('btn-stop-autoclicker').addEventListener('click', () => AutoClicker.stop());

        // Visual Filters
        document.getElementById('toggle-filters').addEventListener('change', e => {
            state.filtersEnabled = e.target.checked;
            VisualFilters.apply();
            showNotification(e.target.checked ? 'FILTERS: ON' : 'FILTERS: OFF');
        });

        document.getElementById('filter-brightness').addEventListener('input', e => {
            VisualFilters.setBrightness(parseInt(e.target.value));
            document.getElementById('filter-brightness-value').textContent = e.target.value + '%';
        });

        document.getElementById('filter-contrast').addEventListener('input', e => {
            VisualFilters.setContrast(parseInt(e.target.value));
            document.getElementById('filter-contrast-value').textContent = e.target.value + '%';
        });

        document.getElementById('filter-saturation').addEventListener('input', e => {
            VisualFilters.setSaturation(parseInt(e.target.value));
            document.getElementById('filter-saturation-value').textContent = e.target.value + '%';
        });

        document.getElementById('filter-hue').addEventListener('input', e => {
            VisualFilters.setHue(parseInt(e.target.value));
            document.getElementById('filter-hue-value').textContent = e.target.value + '°';
        });

        document.getElementById('filter-sharpness').addEventListener('input', e => {
            VisualFilters.setSharpness(parseInt(e.target.value));
            document.getElementById('filter-sharpness-value').textContent = e.target.value + '%';
        });

        document.getElementById('filter-antialiasing').addEventListener('change', e => {
            VisualFilters.setAntialiasing(e.target.checked);
            showNotification(e.target.checked ? 'ANTI-ALIASING: ON' : 'ANTI-ALIASING: OFF');
        });

        document.querySelectorAll('[data-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.dataset.speed) { // Avoid conflict with speed presets
                    VisualFilters.applyPreset(btn.dataset.preset);
                }
            });
        });

        document.getElementById('btn-reset-filters').addEventListener('click', () => VisualFilters.reset());

        // Resolution
        document.getElementById('resolution-select').addEventListener('change', e => {
            document.getElementById('custom-res-inputs').style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
        document.getElementById('btn-apply-res').addEventListener('click', () => {
            const res = document.getElementById('resolution-select').value;
            const bars = document.getElementById('black-bars').checked;
            const color = document.getElementById('bars-color').value;
            if (res) ResolutionManager.apply(res, bars, color);
        });
        document.getElementById('btn-reset-res').addEventListener('click', () => {
            ResolutionManager.reset();
            document.getElementById('resolution-select').value = '';
        });

        // Toggles
        document.getElementById('toggle-timer').addEventListener('change', e => toggleTimerOverlay(e.target.checked));
        document.getElementById('toggle-fps').addEventListener('change', e => toggleFps(e.target.checked));
        document.getElementById('toggle-keys').addEventListener('change', e => toggleKeystrokes(e.target.checked));
        document.getElementById('toggle-godmode').addEventListener('change', e => toggleGodmode(e.target.checked));
        document.getElementById('toggle-nowall').addEventListener('change', e => toggleNoWall(e.target.checked));
        document.getElementById('toggle-nocoin').addEventListener('change', e => toggleNoCoin(e.target.checked));

        document.getElementById('btn-reset-timer').addEventListener('click', resetTimer);
        document.getElementById('btn-unlock-all').addEventListener('click', () => UnityHacks.unlockAll());

        // Keyboard
        document.addEventListener('keydown', e => {
            if (e.target.tagName === 'INPUT') return;
            if (e.code === CONFIG.menuKey) { e.preventDefault(); toggleMenu(); }
            else if (e.code === CONFIG.timerKey) { e.preventDefault(); state.timerRunning ? stopTimer() : startTimer(); }
            else if (e.code === CONFIG.restartKey && state.noCoinModeActive) { e.preventDefault(); restartNoCoin(); }

            state.pressedKeys.add(e.code);
            updateKeystrokes();
        });

        document.addEventListener('keyup', e => {
            state.pressedKeys.delete(e.code);
            updateKeystrokes();
        });
    }

    // ============== FUNCTIONS ==============
    function toggleMenu() {
        state.menuVisible = !state.menuVisible;
        document.getElementById('hack-menu').classList.toggle('visible', state.menuVisible);
    }

    function toggleTimerOverlay(v) {
        document.getElementById('speedrun-timer').classList.toggle('visible', v);
    }

    function startTimer() {
        if (state.timerRunning) return;
        state.timerRunning = true;
        state.timerStartTime = Date.now() - state.timerElapsed;
        document.getElementById('speedrun-timer').classList.add('running');
        updateTimer();
    }

    function stopTimer() {
        state.timerRunning = false;
        state.timerElapsed = Date.now() - state.timerStartTime;
        document.getElementById('speedrun-timer').classList.remove('running');
    }

    function resetTimer() {
        state.timerRunning = false;
        state.timerElapsed = 0;
        const t = document.getElementById('speedrun-timer');
        t.textContent = '0.00';
        t.classList.remove('running', 'nocoin-fail');
    }

    function updateTimer() {
        if (!state.timerRunning) return;
        const ms = Date.now() - state.timerStartTime;
        document.getElementById('speedrun-timer').textContent = formatTime(ms);
        requestAnimationFrame(updateTimer);
    }

    function formatTime(ms) {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        const cs = Math.floor((ms % 1000) / 10);
        const pad = n => n.toString().padStart(2, '0');
        return m > 0 ? `${m}:${pad(sec)}.${pad(cs)}` : `${sec}.${pad(cs)}`;
    }

    function updateSpeedIndicator() {
        const ind = document.getElementById('speed-indicator');
        if (ind) ind.textContent = `SPEED: ${state.gameSpeed.toFixed(1)}x`;
    }

    let fpsFrames = 0, fpsLast = performance.now();
    function toggleFps(v) {
        state.fpsVisible = v;
        document.getElementById('fps-counter').classList.toggle('visible', v);
        if (v) updateFps();
    }

    function updateFps() {
        if (!state.fpsVisible) return;
        fpsFrames++;
        const now = SpeedHack.originalPerfNow ? SpeedHack.originalPerfNow() : performance.now();
        if (now - fpsLast >= 1000) {
            document.querySelector('#fps-counter .fps-value').textContent = Math.round(fpsFrames * 1000 / (now - fpsLast));
            fpsFrames = 0;
            fpsLast = now;
        }
        requestAnimationFrame(updateFps);
    }

    function toggleKeystrokes(v) {
        state.keystrokeVisible = v;
        document.getElementById('keystroke-viewer').classList.toggle('visible', v);
    }

    function updateKeystrokes() {
        if (!state.keystrokeVisible) return;
        document.querySelectorAll('.keystroke-key').forEach(k => {
            k.classList.toggle('active', state.pressedKeys.has(k.dataset.key));
        });
    }

    function toggleGodmode(v) {
        state.godmodeActive = v;
        document.getElementById('status-godmode').classList.toggle('active', v);
        showNotification(v ? 'GODMODE: ON [WIP]' : 'GODMODE: OFF');
    }

    function toggleNoWall(v) {
        state.noSideWallActive = v;
        document.getElementById('status-nowall').classList.toggle('active', v);
        showNotification(v ? 'NO SIDEWALL: ON [WIP]' : 'NO SIDEWALL: OFF');
    }

    function toggleNoCoin(v) {
        state.noCoinModeActive = v;
        document.getElementById('nocoin-status').classList.toggle('visible', v);
        if (v) {
            UnityHacks.resetCoinBaseline();
            document.getElementById('toggle-timer').checked = true;
            toggleTimerOverlay(true);
            showNotification('NOCOIN MODE: ON');
        } else {
            showNotification('NOCOIN MODE: OFF');
        }
    }

    function onCoinCollected() {
        if (!state.noCoinModeActive) return;
        document.getElementById('speedrun-timer').classList.add('nocoin-fail');
        showNotification('COIN DETECTED // RESTARTING...');
        setTimeout(restartNoCoin, 500);
    }

    function restartNoCoin() {
        resetTimer();
        UnityHacks.resetCoinBaseline();
        UnityHacks.send('GameManager', 'Restart');
        UnityHacks.send('GameManager', 'RestartGame');
        ['Enter', 'Space'].forEach(k => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })));
        setTimeout(() => {
            document.getElementById('speedrun-timer').classList.remove('nocoin-fail');
            startTimer();
        }, 1000);
    }

    function showNotification(msg) {
        const n = document.getElementById('hack-notification');
        n.textContent = msg;
        n.classList.add('visible');
        setTimeout(() => n.classList.remove('visible'), 2500);
    }

    // ============== INIT ==============
    function init() {
        console.log('[SubwayHacks] v4.2 loaded');
        SpeedHack.init();
        KeyMapper.init();
        MacroRecorder.init();
        VisualFilters.init();
        createUI();
        UnityHacks.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
