// Neon Bounce Ball Platformer - Core Game Engine

// --- GAME CONFIG & CONSTANTS ---
const CONFIG = {
    gravity: 0.46,
    maxFallSpeed: 16,
    acceleration: 0.72,
    groundFriction: 0.93,
    airFriction: 0.985,
    maxSpeedX: 8.5,
    jumpForce: -11.6,
    bounceThreshold: 3.5,
    restitution: 0.65, // Bounciness factor
    ballRadius: 18
};

// Available Ball Skins
const BALL_SKINS = [
    { id: 'cyan', name: 'Cyber Cyan', color: '#00f3ff', glow: 'rgba(0, 243, 255, 0.8)', trail: 'rgba(0, 243, 255, 0.5)', inner: '#ffffff' },
    { id: 'orange', name: 'Neon Blaze', color: '#ff6600', glow: 'rgba(255, 102, 0, 0.8)', trail: 'rgba(255, 102, 0, 0.5)', inner: '#ffea00' },
    { id: 'pink', name: 'Vapor Wave', color: '#ff007f', glow: 'rgba(255, 0, 127, 0.8)', trail: 'rgba(255, 0, 127, 0.5)', inner: '#ffffff' },
    { id: 'emerald', name: 'Matrix Green', color: '#00ff88', glow: 'rgba(0, 255, 136, 0.8)', trail: 'rgba(0, 255, 136, 0.5)', inner: '#d4ff00' },
    { id: 'gold', name: 'Solar Gold', color: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)', trail: 'rgba(255, 215, 0, 0.5)', inner: '#ffffff' },
    { id: 'plasma', name: 'Void Purple', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)', trail: 'rgba(168, 85, 247, 0.5)', inner: '#e9d5ff' }
];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // State variables
        this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER'
        this.currentLevelId = 1;
        this.currentLevel = null;
        this.selectedSkin = BALL_SKINS[0];

        // Player / Ball Entity
        this.ball = {
            x: 100,
            y: 500,
            vx: 0,
            vy: 0,
            radius: CONFIG.ballRadius,
            rotation: 0,
            grounded: false,
            coyoteTimer: 0,
            squashX: 1,
            squashY: 1,
            isDead: false,
            trail: []
        };

        // Level State
        this.score = 0;
        this.collectedGems = 0;
        this.collectedStars = new Set();
        this.collectedKeys = new Set();
        this.deathsInLevel = 0;
        this.levelStartTime = 0;
        this.levelElapsedTime = 0;
        this.lastCheckpoint = null;
        this.portalCooldown = 0;

        // Camera
        this.camX = 0;
        this.camY = 0;
        this.camTargetX = 0;
        this.camTargetY = 0;

        // Particle system
        this.particles = [];
        this.starfield = [];

        // Controls input state
        this.keys = {
            left: false,
            right: false,
            jump: false
        };

        // Saved progress in localStorage
        this.progress = this.loadProgress();

        this.initDOM();
        this.initEvents();
        this.resize();
        this.initStarfield();

        // Start game loop
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('neon_bounce_progress');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn("Could not read localStorage", e);
        }
        return {
            unlockedLevels: [1],
            stars: {}, // { 1: [1,2,3], 2: [1] }
            bestTimes: {} // { 1: 18.4 }
        };
    }

    saveProgress() {
        try {
            localStorage.setItem('neon_bounce_progress', JSON.stringify(this.progress));
        } catch (e) {
            console.warn("Could not save to localStorage", e);
        }
    }

    initDOM() {
        // Modals
        this.modalMenu = document.getElementById('modal-menu');
        this.modalLevels = document.getElementById('modal-levels');
        this.modalSkins = document.getElementById('modal-skins');
        this.modalPause = document.getElementById('modal-pause');
        this.modalVictory = document.getElementById('modal-victory');
        this.modalGameOver = document.getElementById('modal-gameover');

        // HUD Elements
        this.hudLevelName = document.getElementById('hud-level-name');
        this.hudScore = document.getElementById('hud-score');
        this.hudTimer = document.getElementById('hud-timer');
        this.keyIndicator = document.getElementById('key-indicator');
        this.hudStars = [
            document.getElementById('hud-star-1'),
            document.getElementById('hud-star-2'),
            document.getElementById('hud-star-3')
        ];

        // Audio and Pause HUD buttons
        this.btnSound = document.getElementById('btn-sound-toggle');
        this.btnMusic = document.getElementById('btn-music-toggle');
        this.btnPause = document.getElementById('btn-pause');

        // Build Level Grid UI
        this.renderLevelGrid();
        // Build Skin Grid UI
        this.renderSkinGrid();
    }

    initEvents() {
        window.addEventListener('resize', () => this.resize());

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }

            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
            if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
                if (!this.keys.jump) this.handleJumpPress();
                this.keys.jump = true;
            }

            // Quick restart key
            if (e.code === 'KeyR' && this.state === 'PLAYING') {
                this.respawnPlayer();
            }

            // Pause toggle
            if (e.code === 'KeyP' || e.code === 'Escape') {
                if (this.state === 'PLAYING') this.pauseGame();
                else if (this.state === 'PAUSED') this.resumeGame();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
            if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') this.keys.jump = false;
        });

        // Touch Gamepad Controls
        const touchLeft = document.getElementById('touch-left');
        const touchRight = document.getElementById('touch-right');
        const touchJump = document.getElementById('touch-jump');

        const bindTouch = (elem, onPress, onRelease) => {
            const start = (e) => { e.preventDefault(); elem.classList.add('active'); onPress(); };
            const end = (e) => { e.preventDefault(); elem.classList.remove('active'); onRelease(); };
            elem.addEventListener('touchstart', start, { passive: false });
            elem.addEventListener('touchend', end, { passive: false });
            elem.addEventListener('mousedown', start);
            elem.addEventListener('mouseup', end);
            elem.addEventListener('mouseleave', end);
        };

        bindTouch(touchLeft, () => this.keys.left = true, () => this.keys.left = false);
        bindTouch(touchRight, () => this.keys.right = true, () => this.keys.right = false);
        bindTouch(touchJump, () => {
            this.handleJumpPress();
            this.keys.jump = true;
        }, () => this.keys.jump = false);

        // Detect touch screen to show touch controls
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            document.getElementById('touch-controls').style.display = 'flex';
        }

        // Menu Buttons
        document.getElementById('btn-start-game').onclick = () => {
            window.sound.resume();
            window.sound.startBgm();
            this.startLevel(this.currentLevelId);
        };
        document.getElementById('btn-open-levels').onclick = () => this.openModal(this.modalLevels);
        document.getElementById('btn-close-levels').onclick = () => this.openModal(this.modalMenu);
        document.getElementById('btn-open-skins').onclick = () => this.openModal(this.modalSkins);
        document.getElementById('btn-close-skins').onclick = () => this.openModal(this.modalMenu);

        // Pause Menu Buttons
        this.btnPause.onclick = () => this.pauseGame();
        document.getElementById('btn-resume-game').onclick = () => this.resumeGame();
        document.getElementById('btn-restart-level').onclick = () => {
            this.startLevel(this.currentLevelId);
        };
        document.getElementById('btn-pause-to-levels').onclick = () => {
            this.renderLevelGrid();
            this.openModal(this.modalLevels);
        };
        document.getElementById('btn-pause-to-menu').onclick = () => {
            this.state = 'MENU';
            this.openModal(this.modalMenu);
        };

        // Victory Buttons
        document.getElementById('btn-next-level').onclick = () => {
            const nextId = this.currentLevelId + 1;
            if (GAME_LEVELS.find(l => l.id === nextId)) {
                this.startLevel(nextId);
            } else {
                this.renderLevelGrid();
                this.openModal(this.modalLevels);
            }
        };
        document.getElementById('btn-replay-level').onclick = () => this.startLevel(this.currentLevelId);
        document.getElementById('btn-vic-to-menu').onclick = () => {
            this.state = 'MENU';
            this.openModal(this.modalMenu);
        };

        // Game Over Buttons
        document.getElementById('btn-try-again').onclick = () => this.respawnPlayer();
        document.getElementById('btn-go-to-menu').onclick = () => {
            this.state = 'MENU';
            this.openModal(this.modalMenu);
        };

        // Audio HUD Toggles
        this.btnSound.onclick = () => {
            const enabled = window.sound.toggleSound();
            this.btnSound.textContent = enabled ? '🔊' : '🔇';
        };
        this.btnMusic.onclick = () => {
            const enabled = window.sound.toggleMusic();
            this.btnMusic.textContent = enabled ? '🎵' : '🚫';
        };
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.resetTransform?.();
        this.ctx.scale(dpr, dpr);
        this.viewWidth = window.innerWidth;
        this.viewHeight = window.innerHeight;
    }

    initStarfield() {
        this.starfield = [];
        for (let i = 0; i < 90; i++) {
            this.starfield.push({
                x: Math.random() * 4000,
                y: Math.random() * 2000,
                size: Math.random() * 2.2 + 0.8,
                alpha: Math.random() * 0.7 + 0.3,
                speed: Math.random() * 0.4 + 0.1
            });
        }
    }

    openModal(modal) {
        [this.modalMenu, this.modalLevels, this.modalSkins, this.modalPause, this.modalVictory, this.modalGameOver].forEach(m => {
            if (m) m.classList.remove('active');
        });
        if (modal) modal.classList.add('active');
    }

    closeAllModals() {
        [this.modalMenu, this.modalLevels, this.modalSkins, this.modalPause, this.modalVictory, this.modalGameOver].forEach(m => {
            if (m) m.classList.remove('active');
        });
    }

    renderLevelGrid() {
        const grid = document.getElementById('level-selection-grid');
        grid.innerHTML = '';

        GAME_LEVELS.forEach(lvl => {
            const unlocked = this.progress.unlockedLevels.includes(lvl.id);
            const stars = this.progress.stars[lvl.id] || [];
            const bestTime = this.progress.bestTimes[lvl.id];

            const card = document.createElement('div');
            card.className = `level-card ${unlocked ? '' : 'locked'}`;
            card.innerHTML = `
                <div class="level-num">${lvl.id}</div>
                <div class="level-name-sub">${lvl.name.split(':')[1] || lvl.name}</div>
                <div class="level-stars-mini">
                    <span class="${stars.includes(1) ? 'active' : ''}">★</span>
                    <span class="${stars.includes(2) ? 'active' : ''}">★</span>
                    <span class="${stars.includes(3) ? 'active' : ''}">★</span>
                </div>
                ${bestTime ? `<div style="font-size:10px; color:#00f3ff; margin-top:2px;">⏱ ${bestTime.toFixed(1)}s</div>` : ''}
            `;

            if (unlocked) {
                card.onclick = () => {
                    window.sound.resume();
                    window.sound.startBgm();
                    this.startLevel(lvl.id);
                };
            }
            grid.appendChild(card);
        });
    }

    renderSkinGrid() {
        const grid = document.getElementById('skin-selection-grid');
        grid.innerHTML = '';

        BALL_SKINS.forEach(skin => {
            const isSelected = this.selectedSkin.id === skin.id;
            const card = document.createElement('div');
            card.className = `skin-card ${isSelected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="skin-orb-preview" style="background: radial-gradient(circle at 35% 35%, ${skin.inner} 0%, ${skin.color} 80%); color: ${skin.color};"></div>
                <span class="skin-name">${skin.name}</span>
            `;
            card.onclick = () => {
                this.selectedSkin = skin;
                this.renderSkinGrid();
            };
            grid.appendChild(card);
        });
    }

    // --- GAMEPLAY FLOW ---

    startLevel(levelId) {
        this.currentLevelId = levelId;
        this.currentLevel = getLevelCopy(levelId);

        // Reset Ball
        this.ball.x = this.currentLevel.spawn.x;
        this.ball.y = this.currentLevel.spawn.y;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.rotation = 0;
        this.ball.grounded = false;
        this.ball.coyoteTimer = 0;
        this.ball.squashX = 1;
        this.ball.squashY = 1;
        this.ball.isDead = false;
        this.ball.trail = [];

        // Reset Level State
        this.score = 0;
        this.collectedGems = 0;
        this.collectedStars = new Set();
        this.collectedKeys = new Set();
        this.deathsInLevel = 0;
        this.levelStartTime = performance.now();
        this.levelElapsedTime = 0;
        this.lastCheckpoint = { x: this.currentLevel.spawn.x, y: this.currentLevel.spawn.y };
        this.portalCooldown = 0;
        this.particles = [];

        // Camera snap
        this.camX = this.ball.x - this.viewWidth / 2;
        this.camY = this.ball.y - this.viewHeight / 2;

        // Update HUD
        this.hudLevelName.textContent = this.currentLevel.name;
        this.hudScore.textContent = '0';
        this.keyIndicator.style.display = 'none';
        this.updateHUDStars();

        this.closeAllModals();
        this.state = 'PLAYING';
    }

    pauseGame() {
        if (this.state !== 'PLAYING') return;
        this.state = 'PAUSED';
        this.openModal(this.modalPause);
    }

    resumeGame() {
        if (this.state !== 'PAUSED') return;
        this.closeAllModals();
        this.state = 'PLAYING';
    }

    respawnPlayer() {
        this.ball.isDead = false;
        this.ball.x = this.lastCheckpoint ? this.lastCheckpoint.x : this.currentLevel.spawn.x;
        this.ball.y = this.lastCheckpoint ? this.lastCheckpoint.y : this.currentLevel.spawn.y;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.rotation = 0;
        this.ball.trail = [];
        this.closeAllModals();
        this.state = 'PLAYING';
    }

    killBall() {
        if (this.ball.isDead) return;
        this.ball.isDead = true;
        this.deathsInLevel++;
        window.sound.playHit();

        // Spawn death burst particles
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 2;
            this.particles.push({
                x: this.ball.x,
                y: this.ball.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: Math.random() > 0.5 ? this.selectedSkin.color : '#ffffff',
                size: Math.random() * 5 + 3,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.015,
                shape: 'spark'
            });
        }

        // Delay quick respawn
        setTimeout(() => {
            if (this.state === 'PLAYING' || this.state === 'GAMEOVER') {
                this.respawnPlayer();
            }
        }, 650);
    }

    handleJumpPress() {
        if (this.state !== 'PLAYING' || this.ball.isDead) return;

        // Allow jump if grounded or within coyote time window
        if (this.ball.grounded || this.ball.coyoteTimer > 0) {
            this.ball.vy = CONFIG.jumpForce;
            this.ball.grounded = false;
            this.ball.coyoteTimer = 0;
            this.ball.squashX = 0.75;
            this.ball.squashY = 1.35;
            window.sound.playJump();

            // Jump dust particles
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    x: this.ball.x + (Math.random() * 16 - 8),
                    y: this.ball.y + this.ball.radius,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * -1.5,
                    color: 'rgba(255, 255, 255, 0.4)',
                    size: Math.random() * 4 + 2,
                    life: 1.0,
                    decay: 0.05,
                    shape: 'circle'
                });
            }
        }
    }

    triggerLevelVictory() {
        if (this.state !== 'PLAYING') return;
        this.state = 'VICTORY';
        window.sound.playWin();

        const timeSec = (performance.now() - this.levelStartTime) / 1000;
        this.levelElapsedTime = timeSec;

        // Confetti Fireworks Blast
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 9 + 3;
            const colors = ['#00f3ff', '#ff007f', '#ffd700', '#00ffaa', '#ffffff'];
            this.particles.push({
                x: this.currentLevel.finish.x,
                y: this.currentLevel.finish.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 6 + 3,
                life: 1.0,
                decay: Math.random() * 0.01 + 0.008,
                shape: 'confetti',
                rot: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        // Save unlock and stars
        const nextLevelId = this.currentLevelId + 1;
        if (GAME_LEVELS.find(l => l.id === nextLevelId) && !this.progress.unlockedLevels.includes(nextLevelId)) {
            this.progress.unlockedLevels.push(nextLevelId);
        }

        // Star rating: 1 star for clearing, 2 for collecting all stars, 3 for clearing under par time with 3 stars!
        const earnedStars = Array.from(this.collectedStars);
        if (!this.progress.stars[this.currentLevelId] || earnedStars.length > this.progress.stars[this.currentLevelId].length) {
            this.progress.stars[this.currentLevelId] = earnedStars;
        }

        if (!this.progress.bestTimes[this.currentLevelId] || timeSec < this.progress.bestTimes[this.currentLevelId]) {
            this.progress.bestTimes[this.currentLevelId] = timeSec;
        }

        this.saveProgress();

        // Update Victory Modal UI
        document.getElementById('vic-time').textContent = `${timeSec.toFixed(1)}s`;
        document.getElementById('vic-gems').textContent = `${this.score}`;
        document.getElementById('vic-deaths').textContent = `${this.deathsInLevel}`;

        const starElems = [
            document.getElementById('award-star-1'),
            document.getElementById('award-star-2'),
            document.getElementById('award-star-3')
        ];
        starElems.forEach((el, idx) => {
            el.className = 'award-star';
            setTimeout(() => {
                if (this.collectedStars.has(idx + 1)) {
                    el.classList.add('earned');
                }
            }, 300 * (idx + 1));
        });

        setTimeout(() => {
            this.openModal(this.modalVictory);
        }, 700);
    }

    updateHUDStars() {
        this.hudStars.forEach((el, idx) => {
            if (this.collectedStars.has(idx + 1)) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    // --- PHYSICS & LOGIC LOOP ---

    update(dt) {
        if (this.state !== 'PLAYING' || this.ball.isDead) return;

        // Timer
        const elapsedSec = (performance.now() - this.levelStartTime) / 1000;
        const mins = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
        const secs = Math.floor(elapsedSec % 60).toString().padStart(2, '0');
        this.hudTimer.textContent = `${mins}:${secs}`;

        // Decrement portal cooldown
        if (this.portalCooldown > 0) this.portalCooldown -= dt;

        // 1. Horizontal Acceleration
        if (this.keys.left) {
            this.ball.vx -= CONFIG.acceleration;
        }
        if (this.keys.right) {
            this.ball.vx += CONFIG.acceleration;
        }

        // Apply friction
        const friction = this.ball.grounded ? CONFIG.groundFriction : CONFIG.airFriction;
        this.ball.vx *= friction;

        // Clamp max horizontal speed
        if (Math.abs(this.ball.vx) > CONFIG.maxSpeedX) {
            this.ball.vx = Math.sign(this.ball.vx) * CONFIG.maxSpeedX;
        }

        // 2. Gravity
        this.ball.vy += CONFIG.gravity;
        if (this.ball.vy > CONFIG.maxFallSpeed) this.ball.vy = CONFIG.maxFallSpeed;

        // 3. Angular Rotation
        this.ball.rotation += this.ball.vx / this.ball.radius;

        // Squash & Stretch restoration
        this.ball.squashX += (1 - this.ball.squashX) * 0.15;
        this.ball.squashY += (1 - this.ball.squashY) * 0.15;

        // Motion trail record
        if (Math.hypot(this.ball.vx, this.ball.vy) > 3) {
            this.ball.trail.unshift({ x: this.ball.x, y: this.ball.y, alpha: 0.6 });
            if (this.ball.trail.length > 8) this.ball.trail.pop();
        } else if (this.ball.trail.length > 0) {
            this.ball.trail.pop();
        }

        // Coyote Time
        if (!this.ball.grounded) {
            this.ball.coyoteTimer = Math.max(0, this.ball.coyoteTimer - dt);
        } else {
            this.ball.coyoteTimer = 0.12; // 120ms coyote forgiveness
        }

        // Track grounded state
        let wasGrounded = this.ball.grounded;
        this.ball.grounded = false;

        // 4. Update Moving Platforms
        this.currentLevel.movingPlatforms.forEach(p => {
            if (p.axis === 'x') {
                p.x += p.speed * p.dir;
                if (p.x >= p.maxX) { p.x = p.maxX; p.dir = -1; }
                else if (p.x <= p.minX) { p.x = p.minX; p.dir = 1; }
            } else if (p.axis === 'y') {
                p.y += p.speed * p.dir;
                if (p.y >= p.maxY) { p.y = p.maxY; p.dir = -1; }
                else if (p.y <= p.minY) { p.y = p.minY; p.dir = 1; }
            }
        });

        // 5. Update Rotating Lasers
        this.currentLevel.lasers.forEach(laser => {
            laser.angle += laser.speed;
        });

        // 6. Update Crumbling Platforms
        this.currentLevel.crumblingPlatforms.forEach(cp => {
            if (cp.triggered && !cp.broken) {
                cp.timer = (cp.timer || 0) + dt;
                // Shake effect
                cp.shakeX = (Math.random() - 0.5) * 6;
                if (cp.timer >= cp.maxTime) {
                    cp.broken = true;
                    // Debris particle burst
                    for (let i = 0; i < 16; i++) {
                        this.particles.push({
                            x: cp.x + Math.random() * cp.w,
                            y: cp.y + Math.random() * cp.h,
                            vx: (Math.random() - 0.5) * 4,
                            vy: Math.random() * 3 + 1,
                            color: '#ff0080',
                            size: Math.random() * 4 + 2,
                            life: 1.0,
                            decay: 0.03,
                            shape: 'box'
                        });
                    }
                }
            }
        });

        // 7. Move Ball and Solve Platform Collisions
        this.ball.x += this.ball.vx;
        this.resolveHorizontalCollisions();

        this.ball.y += this.ball.vy;
        this.resolveVerticalCollisions();

        // 8. Interactive Hazard & Collectible Checks
        this.checkHazards();
        this.checkCollectibles();
        this.checkSprings();
        this.checkPortals();
        this.checkFinishLine();

        // Check if ball fell below the level bounds
        if (this.ball.y > this.currentLevel.bounds.height + 150) {
            this.killBall();
        }
    }

    // --- COLLISION RESOLUTION ---

    getAllSolidObstacles() {
        const list = [...this.currentLevel.platforms, ...this.currentLevel.movingPlatforms];
        // Add intact crumbling platforms
        this.currentLevel.crumblingPlatforms.forEach(cp => {
            if (!cp.broken) list.push(cp);
        });
        // Add closed locked doors
        this.currentLevel.doors.forEach(d => {
            if (!d.opened) list.push(d);
        });
        return list;
    }

    resolveHorizontalCollisions() {
        const obstacles = this.getAllSolidObstacles();
        const b = this.ball;

        obstacles.forEach(p => {
            // Find closest point in rectangle to circle center
            const closestX = Math.max(p.x, Math.min(b.x, p.x + p.w));
            const closestY = Math.max(p.y, Math.min(b.y, p.y + p.h));

            const distX = b.x - closestX;
            const distY = b.y - closestY;
            const distance = Math.hypot(distX, distY);

            if (distance < b.radius) {
                // Horizontal overlap resolve
                if (Math.abs(distX) > Math.abs(distY) && distX !== 0) {
                    const overlap = b.radius - Math.abs(distX);
                    b.x += Math.sign(distX) * overlap;
                    b.vx = -b.vx * 0.3; // Slight bounce off walls
                }
            }
        });
    }

    resolveVerticalCollisions() {
        const obstacles = this.getAllSolidObstacles();
        const b = this.ball;

        obstacles.forEach(p => {
            const closestX = Math.max(p.x, Math.min(b.x, p.x + p.w));
            const closestY = Math.max(p.y, Math.min(b.y, p.y + p.h));

            const distX = b.x - closestX;
            const distY = b.y - closestY;
            const distance = Math.hypot(distX, distY);

            if (distance < b.radius) {
                // Vertical resolve
                if (distY > 0) {
                    // Hit head from bottom
                    b.y = p.y + p.h + b.radius;
                    b.vy = Math.abs(b.vy) * 0.4;
                } else {
                    // Land on top
                    b.y = p.y - b.radius;

                    // Trigger crumbling platform
                    if (p.maxTime && !p.triggered) {
                        p.triggered = true;
                    }

                    // Transfer moving platform momentum
                    if (p.axis === 'x') {
                        b.x += p.speed * p.dir;
                    } else if (p.axis === 'y') {
                        b.y += p.speed * p.dir;
                    }

                    // Check impact for bounce restitution
                    if (b.vy > CONFIG.bounceThreshold) {
                        window.sound.playBounce(b.vy / 6);
                        b.squashX = 1.35;
                        b.squashY = 0.65;
                        b.vy = -b.vy * CONFIG.restitution;

                        // Landing dust
                        for (let i = 0; i < 4; i++) {
                            this.particles.push({
                                x: b.x + (Math.random() * 12 - 6),
                                y: b.y + b.radius,
                                vx: (Math.random() - 0.5) * 3,
                                vy: -Math.random() * 1.5,
                                color: 'rgba(255, 255, 255, 0.3)',
                                size: 3,
                                life: 0.6,
                                decay: 0.04,
                                shape: 'circle'
                            });
                        }
                    } else {
                        b.vy = 0;
                        b.grounded = true;
                    }
                }
            }
        });
    }

    checkHazards() {
        const b = this.ball;

        // 1. Spikes
        this.currentLevel.spikes.forEach(s => {
            // Precise spike collision
            if (b.x + b.radius > s.x && b.x - b.radius < s.x + s.w &&
                b.y + b.radius > s.y && b.y - b.radius < s.y + s.h) {
                this.killBall();
            }
        });

        // 2. Rotating Lasers
        this.currentLevel.lasers.forEach(laser => {
            const endX = laser.cx + Math.cos(laser.angle) * laser.length;
            const endY = laser.cy + Math.sin(laser.angle) * laser.length;

            // Distance from point to line segment
            const lineLen = laser.length;
            const u = Math.max(0, Math.min(1, ((b.x - laser.cx) * (endX - laser.cx) + (b.y - laser.cy) * (endY - laser.cy)) / (lineLen * lineLen)));
            const nearestX = laser.cx + u * (endX - laser.cx);
            const nearestY = laser.cy + u * (endY - laser.cy);

            if (Math.hypot(b.x - nearestX, b.y - nearestY) < b.radius + 3) {
                this.killBall();
            }
        });
    }

    checkSprings() {
        const b = this.ball;
        this.currentLevel.springs.forEach(spring => {
            if (b.x + b.radius > spring.x && b.x - b.radius < spring.x + spring.w &&
                b.y + b.radius >= spring.y && b.y - b.radius <= spring.y + spring.h && b.vy >= 0) {
                
                b.vy = spring.force;
                b.grounded = false;
                b.squashX = 0.6;
                b.squashY = 1.45;
                spring.animTime = 0.3; // Spring compression animation
                window.sound.playSpring();

                // Spark burst
                for (let i = 0; i < 12; i++) {
                    this.particles.push({
                        x: spring.x + spring.w / 2,
                        y: spring.y,
                        vx: (Math.random() - 0.5) * 5,
                        vy: -Math.random() * 6 - 2,
                        color: '#00f3ff',
                        size: 3,
                        life: 1.0,
                        decay: 0.04,
                        shape: 'spark'
                    });
                }
            }
        });
    }

    checkPortals() {
        if (this.portalCooldown > 0) return;
        const b = this.ball;

        this.currentLevel.portals.forEach(portal => {
            const dist = Math.hypot(b.x - portal.in.x, b.y - portal.in.y);
            if (dist < portal.in.radius) {
                b.x = portal.out.x;
                b.y = portal.out.y;
                b.vx = Math.sign(b.vx || 1) * Math.max(Math.abs(b.vx), 5);
                b.vy = -4;
                this.portalCooldown = 0.6;
                window.sound.playTeleport();

                // Portal warp flare particles
                for (let i = 0; i < 20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const spd = Math.random() * 4 + 1;
                    this.particles.push({
                        x: portal.out.x,
                        y: portal.out.y,
                        vx: Math.cos(angle) * spd,
                        vy: Math.sin(angle) * spd,
                        color: portal.color,
                        size: 4,
                        life: 1.0,
                        decay: 0.03,
                        shape: 'spark'
                    });
                }
            }
        });
    }

    checkCollectibles() {
        const b = this.ball;

        // 1. Gems
        this.currentLevel.gems.forEach((gem, idx) => {
            if (!gem.collected && Math.hypot(b.x - gem.x, b.y - gem.y) < b.radius + 14) {
                gem.collected = true;
                this.score += 100;
                this.collectedGems++;
                this.hudScore.textContent = this.score;
                window.sound.playGem();

                // Sparkle burst
                for (let i = 0; i < 10; i++) {
                    this.particles.push({
                        x: gem.x,
                        y: gem.y,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        color: '#00ffaa',
                        size: 3,
                        life: 1.0,
                        decay: 0.04,
                        shape: 'spark'
                    });
                }
            }
        });

        // 2. Stars
        this.currentLevel.stars.forEach(star => {
            if (!this.collectedStars.has(star.id) && Math.hypot(b.x - star.x, b.y - star.y) < b.radius + 18) {
                this.collectedStars.add(star.id);
                this.score += 500;
                this.hudScore.textContent = this.score;
                this.updateHUDStars();
                window.sound.playStar();

                // Starburst
                for (let i = 0; i < 18; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 5 + 2;
                    this.particles.push({
                        x: star.x,
                        y: star.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        color: '#ffd700',
                        size: 4,
                        life: 1.0,
                        decay: 0.03,
                        shape: 'spark'
                    });
                }
            }
        });

        // 3. Keys
        this.currentLevel.keys.forEach(k => {
            if (!k.collected && Math.hypot(b.x - k.x, b.y - k.y) < b.radius + 16) {
                k.collected = true;
                this.collectedKeys.add(k.id);
                this.keyIndicator.style.display = 'flex';
                window.sound.playKey();

                // Unlock associated door
                this.currentLevel.doors.forEach(d => {
                    if (d.keyId === k.id) {
                        d.opened = true;
                        window.sound.playDoorOpen();
                        // Door opening dissolution particles
                        for (let i = 0; i < 25; i++) {
                            this.particles.push({
                                x: d.x + Math.random() * d.w,
                                y: d.y + Math.random() * d.h,
                                vx: (Math.random() - 0.5) * 4,
                                vy: (Math.random() - 0.5) * 4,
                                color: d.color,
                                size: 4,
                                life: 1.0,
                                decay: 0.025,
                                shape: 'spark'
                            });
                        }
                    }
                });
            }
        });

        // 4. Checkpoints
        this.currentLevel.checkpoints.forEach(cp => {
            if (Math.hypot(b.x - cp.x, b.y - cp.y) < cp.radius + b.radius) {
                if (!this.lastCheckpoint || this.lastCheckpoint.x !== cp.x) {
                    this.lastCheckpoint = { x: cp.x, y: cp.y };
                    cp.activated = true;
                    // Checkpoint chime flare
                    for (let i = 0; i < 8; i++) {
                        this.particles.push({
                            x: cp.x,
                            y: cp.y,
                            vx: (Math.random() - 0.5) * 3,
                            vy: -Math.random() * 3,
                            color: '#00f3ff',
                            size: 3,
                            life: 0.8,
                            decay: 0.03,
                            shape: 'spark'
                        });
                    }
                }
            }
        });
    }

    checkFinishLine() {
        const b = this.ball;
        const finish = this.currentLevel.finish;
        if (Math.hypot(b.x - finish.x, b.y - finish.y) < finish.radius + b.radius) {
            this.triggerLevelVictory();
        }
    }

    // --- RENDERING & DRAWING ENGINE ---

    draw() {
        const ctx = this.ctx;
        const width = this.viewWidth;
        const height = this.viewHeight;

        ctx.clearRect(0, 0, width, height);

        if (!this.currentLevel) {
            // Draw background stars on menu
            this.drawStarfield(0, 0);
            return;
        }

        // Camera Smooth Follow
        this.camTargetX = this.ball.x - width / 2;
        this.camTargetY = this.ball.y - height / 2;

        // Clamp camera to level bounds
        const maxCamX = Math.max(0, this.currentLevel.bounds.width - width);
        const maxCamY = Math.max(0, this.currentLevel.bounds.height - height);

        this.camTargetX = Math.max(0, Math.min(this.camTargetX, maxCamX));
        this.camTargetY = Math.max(-100, Math.min(this.camTargetY, maxCamY + 100));

        this.camX += (this.camTargetX - this.camX) * 0.1;
        this.camY += (this.camTargetY - this.camY) * 0.1;

        // 1. Draw Parallax Background & Grid
        this.drawBackground(ctx, width, height);

        ctx.save();
        ctx.translate(-Math.round(this.camX), -Math.round(this.camY));

        // 2. Draw Checkpoints
        this.drawCheckpoints(ctx);

        // 3. Draw Finish Vortex Portal
        this.drawFinishPortal(ctx);

        // 4. Draw Platforms (Solid, Moving, Crumbling)
        this.drawPlatforms(ctx);

        // 5. Draw Springs, Portals, Keys & Doors
        this.drawMechanics(ctx);

        // 6. Draw Spikes & Lasers
        this.drawHazards(ctx);

        // 7. Draw Collectibles (Gems & Stars)
        this.drawCollectibles(ctx);

        // 8. Draw Ball & Motion Trail
        if (!this.ball.isDead) {
            this.drawBall(ctx);
        }

        // 9. Draw Particles (Sparks, Confetti, Debris)
        this.drawParticles(ctx);

        ctx.restore();
    }

    drawBackground(ctx, w, h) {
        const theme = this.currentLevel ? this.currentLevel.theme : { bg: ["#0a0b1e", "#141539"], grid: "rgba(0,243,255,0.06)" };
        
        // Gradient Sky
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, theme.bg[0]);
        bgGrad.addColorStop(0.5, theme.bg[1]);
        bgGrad.addColorStop(1, theme.bg[2] || theme.bg[1]);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Parallax Starfield
        this.drawStarfield(this.camX * 0.25, this.camY * 0.25);

        // Parallax Cyber Grid lines
        ctx.strokeStyle = theme.grid;
        ctx.lineWidth = 1;
        const gridSize = 80;
        const startX = -(this.camX * 0.5) % gridSize;
        const startY = -(this.camY * 0.5) % gridSize;

        ctx.beginPath();
        for (let x = startX; x < w; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        for (let y = startY; y < h; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();
    }

    drawStarfield(offsetX, offsetY) {
        const ctx = this.ctx;
        ctx.fillStyle = "#ffffff";
        this.starfield.forEach(s => {
            const sx = (s.x - offsetX) % this.viewWidth;
            const sy = (s.y - offsetY) % this.viewHeight;
            const finalX = sx < 0 ? sx + this.viewWidth : sx;
            const finalY = sy < 0 ? sy + this.viewHeight : sy;

            ctx.globalAlpha = s.alpha;
            ctx.beginPath();
            ctx.arc(finalX, finalY, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }

    drawPlatforms(ctx) {
        const theme = this.currentLevel.theme;

        // Solid Platforms
        this.currentLevel.platforms.forEach(p => {
            ctx.save();
            ctx.shadowColor = theme.platformGlow;
            ctx.shadowBlur = 10;

            const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
            grad.addColorStop(0, '#19223c');
            grad.addColorStop(1, '#0e1424');
            ctx.fillStyle = grad;
            ctx.strokeStyle = theme.accent;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.roundRect(p.x, p.y, p.w, p.h, 6);
            ctx.fill();
            ctx.stroke();

            // High-tech top rail glow
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.x + 4, p.y);
            ctx.lineTo(p.x + p.w - 4, p.y);
            ctx.stroke();

            ctx.restore();
        });

        // Moving Platforms
        this.currentLevel.movingPlatforms.forEach(mp => {
            ctx.save();
            ctx.shadowColor = '#00ffaa';
            ctx.shadowBlur = 14;

            const grad = ctx.createLinearGradient(mp.x, mp.y, mp.x, mp.y + mp.h);
            grad.addColorStop(0, '#0e3a30');
            grad.addColorStop(1, '#071f1a');
            ctx.fillStyle = grad;
            ctx.strokeStyle = '#00ffaa';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.roundRect(mp.x, mp.y, mp.w, mp.h, 8);
            ctx.fill();
            ctx.stroke();

            // Chevron markings
            ctx.fillStyle = '#00ffaa';
            ctx.font = '10px monospace';
            ctx.fillText('◄►', mp.x + mp.w / 2 - 8, mp.y + mp.h / 2 + 3);

            ctx.restore();
        });

        // Crumbling Platforms
        this.currentLevel.crumblingPlatforms.forEach(cp => {
            if (cp.broken) return;
            ctx.save();

            const ox = cp.shakeX || 0;
            ctx.shadowColor = '#ff0080';
            ctx.shadowBlur = cp.triggered ? 16 : 8;

            ctx.fillStyle = cp.triggered ? '#3b1028' : '#221020';
            ctx.strokeStyle = '#ff0080';
            ctx.lineWidth = 2;
            if (cp.triggered) ctx.setLineDash([4, 4]);

            ctx.beginPath();
            ctx.roundRect(cp.x + ox, cp.y, cp.w, cp.h, 4);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        });
    }

    drawHazards(ctx) {
        // Spikes
        this.currentLevel.spikes.forEach(s => {
            ctx.save();
            ctx.fillStyle = '#ff2255';
            ctx.shadowColor = '#ff0044';
            ctx.shadowBlur = 12;

            const count = Math.max(1, Math.floor(s.w / 18));
            const spikeW = s.w / count;

            ctx.beginPath();
            if (s.dir === 'up') {
                for (let i = 0; i < count; i++) {
                    const sx = s.x + i * spikeW;
                    ctx.moveTo(sx, s.y + s.h);
                    ctx.lineTo(sx + spikeW / 2, s.y);
                    ctx.lineTo(sx + spikeW, s.y + s.h);
                }
            } else if (s.dir === 'down') {
                for (let i = 0; i < count; i++) {
                    const sx = s.x + i * spikeW;
                    ctx.moveTo(sx, s.y);
                    ctx.lineTo(sx + spikeW / 2, s.y + s.h);
                    ctx.lineTo(sx + spikeW, s.y);
                }
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        });

        // Rotating Lasers
        this.currentLevel.lasers.forEach(laser => {
            ctx.save();
            const endX = laser.cx + Math.cos(laser.angle) * laser.length;
            const endY = laser.cy + Math.sin(laser.angle) * laser.length;

            // Center emitter core
            ctx.fillStyle = '#ff0055';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(laser.cx, laser.cy, 8, 0, Math.PI * 2);
            ctx.fill();

            // Laser beam
            ctx.strokeStyle = '#ff0055';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(laser.cx, laser.cy);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Laser core hot white
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(laser.cx, laser.cy);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            ctx.restore();
        });
    }

    drawMechanics(ctx) {
        // Springs
        this.currentLevel.springs.forEach(spring => {
            ctx.save();
            ctx.fillStyle = '#00f3ff';
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 12;

            const h = spring.animTime ? 6 : spring.h;
            ctx.fillRect(spring.x, spring.y + (spring.h - h), spring.w, h);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(spring.x, spring.y + (spring.h - h), spring.w, h);
            ctx.restore();

            if (spring.animTime > 0) spring.animTime -= 0.05;
        });

        // Portals
        this.currentLevel.portals.forEach(portal => {
            ctx.save();
            const now = performance.now() * 0.003;

            // In portal
            ctx.shadowColor = portal.color;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = portal.color;
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.ellipse(portal.in.x, portal.in.y, portal.in.radius, portal.in.radius * 0.7, now, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = portal.color;
            ctx.globalAlpha = 0.3;
            ctx.fill();

            ctx.restore();
        });

        // Keys
        this.currentLevel.keys.forEach(k => {
            if (k.collected) return;
            ctx.save();
            const bob = Math.sin(performance.now() * 0.005) * 4;

            ctx.shadowColor = k.color;
            ctx.shadowBlur = 16;
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔑', k.x, k.y + bob);

            ctx.restore();
        });

        // Doors
        this.currentLevel.doors.forEach(d => {
            if (d.opened) return;
            ctx.save();
            ctx.shadowColor = d.color;
            ctx.shadowBlur = 15;

            ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            ctx.strokeStyle = d.color;
            ctx.lineWidth = 3;
            ctx.fillRect(d.x, d.y, d.w, d.h);
            ctx.strokeRect(d.x, d.y, d.w, d.h);

            // Lock icon in center
            ctx.font = '14px sans-serif';
            ctx.fillText('🔒', d.x + 3, d.y + d.h / 2);

            ctx.restore();
        });
    }

    drawCollectibles(ctx) {
        const time = performance.now() * 0.004;

        // Gems
        this.currentLevel.gems.forEach(gem => {
            if (gem.collected) return;
            ctx.save();
            const bob = Math.sin(time + gem.x) * 3;

            ctx.shadowColor = '#00ffaa';
            ctx.shadowBlur = 14;
            ctx.fillStyle = '#00ffaa';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;

            // Diamond polygon
            ctx.beginPath();
            ctx.moveTo(gem.x, gem.y + bob - 10);
            ctx.lineTo(gem.x + 8, gem.y + bob);
            ctx.lineTo(gem.x, gem.y + bob + 10);
            ctx.lineTo(gem.x - 8, gem.y + bob);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        });

        // Stars
        this.currentLevel.stars.forEach(star => {
            if (this.collectedStars.has(star.id)) return;
            ctx.save();
            const bob = Math.sin(time * 1.2 + star.x) * 4;
            const rot = time;

            ctx.translate(star.x, star.y + bob);
            ctx.rotate(rot);

            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffd700';

            ctx.font = '26px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', 0, 0);

            ctx.restore();
        });
    }

    drawCheckpoints(ctx) {
        this.currentLevel.checkpoints.forEach(cp => {
            ctx.save();
            const active = cp.activated;
            ctx.shadowColor = active ? '#00f3ff' : 'rgba(255,255,255,0.2)';
            ctx.shadowBlur = active ? 16 : 4;
            ctx.strokeStyle = active ? '#00f3ff' : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = active ? '#00f3ff' : '#444';
            ctx.beginPath();
            ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    drawFinishPortal(ctx) {
        const finish = this.currentLevel.finish;
        const now = performance.now() * 0.003;

        ctx.save();
        ctx.translate(finish.x, finish.y);

        // Outer rotating vortex rings
        for (let i = 3; i >= 1; i--) {
            ctx.save();
            ctx.rotate(now * (i % 2 === 0 ? 1 : -1) * (i * 0.6));
            ctx.strokeStyle = i === 1 ? '#ffffff' : (i === 2 ? '#00f3ff' : '#ff007f');
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 25;

            ctx.beginPath();
            ctx.ellipse(0, 0, finish.radius * (i / 3), finish.radius * (i / 3) * 0.65, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Inner glowing orb core
        const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, finish.radius * 0.6);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#00f3ff');
        grad.addColorStop(1, 'rgba(255, 0, 128, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, finish.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawBall(ctx) {
        const b = this.ball;
        const skin = this.selectedSkin;

        ctx.save();

        // 1. Motion Trail
        b.trail.forEach((t, i) => {
            const alpha = (1 - i / b.trail.length) * 0.4;
            ctx.fillStyle = skin.trail;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(t.x, t.y, b.radius * (1 - i * 0.08), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // 2. Ball Transform with Squash & Stretch + Rotation
        ctx.translate(b.x, b.y);
        ctx.scale(b.squashX, b.squashY);
        ctx.rotate(b.rotation);

        // Glow
        ctx.shadowColor = skin.glow;
        ctx.shadowBlur = 18;

        // Ball Base Body Gradient
        const grad = ctx.createRadialGradient(
            -b.radius * 0.35, -b.radius * 0.35, b.radius * 0.1,
            0, 0, b.radius
        );
        grad.addColorStop(0, skin.inner);
        grad.addColorStop(0.6, skin.color);
        grad.addColorStop(1, '#050710');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // High-tech sphere markings / rolling indicator
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-b.radius * 0.6, 0);
        ctx.lineTo(b.radius * 0.6, 0);
        ctx.moveTo(0, -b.radius * 0.6);
        ctx.lineTo(0, b.radius * 0.6);
        ctx.stroke();

        ctx.restore();
    }

    drawParticles(ctx) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;

            if (p.shape === 'spark') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.shape === 'confetti') {
                p.rot += p.rotSpeed;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
            } else {
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }

            ctx.restore();
        }
    }

    // --- MAIN GAME LOOP ---

    loop(currentTime) {
        const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = currentTime;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Instantiate Game on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
