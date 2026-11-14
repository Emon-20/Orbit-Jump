// Level Designs and Obstacle Definitions for Neon Bounce Ball

const GAME_LEVELS = [
    // --- LEVEL 1: Neon Genesis (Tutorial & Basics) ---
    {
        id: 1,
        name: "1: Neon Genesis",
        subtitle: "Learn the roll, bounce & leaps",
        bounds: { width: 2200, height: 700 },
        theme: {
            bg: ["#0a0b1e", "#141539", "#1f1a4a"],
            grid: "rgba(0, 243, 255, 0.08)",
            accent: "#00f3ff",
            platformGlow: "rgba(0, 243, 255, 0.4)"
        },
        spawn: { x: 100, y: 500 },
        finish: { x: 2050, y: 360, radius: 28 },
        platforms: [
            // Start ground
            { x: 50, y: 580, w: 400, h: 40, type: 'solid' },
            // First step
            { x: 520, y: 520, w: 180, h: 30, type: 'solid' },
            // Higher step
            { x: 760, y: 450, w: 200, h: 30, type: 'solid' },
            // Platform over small gap
            { x: 1040, y: 450, w: 220, h: 30, type: 'solid' },
            // High ledge
            { x: 1340, y: 380, w: 240, h: 30, type: 'solid' },
            // Spring pad landing platform
            { x: 1650, y: 260, w: 160, h: 30, type: 'solid' },
            // Final ground leading to finish
            { x: 1880, y: 440, w: 260, h: 40, type: 'solid' }
        ],
        spikes: [
            // Ground hazards in gaps
            { x: 450, y: 660, w: 70, h: 20, dir: 'up' },
            { x: 960, y: 660, w: 80, h: 20, dir: 'up' },
            { x: 1260, y: 660, w: 80, h: 20, dir: 'up' }
        ],
        springs: [
            // Spring to launch player up to the high ledge
            { x: 1440, y: 368, w: 40, h: 12, force: -19 }
        ],
        movingPlatforms: [],
        crumblingPlatforms: [],
        lasers: [],
        portals: [],
        keys: [],
        doors: [],
        stars: [
            { id: 1, x: 860, y: 390 },
            { id: 2, x: 1730, y: 190 }, // In the air from spring jump
            { id: 3, x: 1970, y: 380 }
        ],
        gems: [
            { x: 300, y: 530 }, { x: 340, y: 530 },
            { x: 610, y: 470 }, { x: 1150, y: 400 },
            { x: 1500, y: 220 }, { x: 1550, y: 200 },
            { x: 1600, y: 220 }
        ],
        checkpoints: [
            { x: 1150, y: 410, radius: 18 }
        ]
    },

    // --- LEVEL 2: Moving Ascent (Moving Platforms & Elevators) ---
    {
        id: 2,
        name: "2: Kinetic Lifts",
        subtitle: "Master moving platforms & timing",
        bounds: { width: 2800, height: 800 },
        theme: {
            bg: ["#08141e", "#0f2b38", "#174354"],
            grid: "rgba(0, 255, 170, 0.08)",
            accent: "#00ffaa",
            platformGlow: "rgba(0, 255, 170, 0.4)"
        },
        spawn: { x: 80, y: 640 },
        finish: { x: 2650, y: 280, radius: 28 },
        platforms: [
            // Starting dock
            { x: 40, y: 700, w: 260, h: 40, type: 'solid' },
            // Stationary rest islands
            { x: 700, y: 620, w: 160, h: 30, type: 'solid' },
            { x: 1280, y: 480, w: 200, h: 30, type: 'solid' },
            { x: 1850, y: 550, w: 180, h: 30, type: 'solid' },
            { x: 2480, y: 360, w: 280, h: 40, type: 'solid' }
        ],
        movingPlatforms: [
            // Horizontal ferry 1
            { x: 340, y: 660, w: 140, h: 22, minX: 340, maxX: 640, minY: 660, maxY: 660, speed: 2.2, dir: 1, axis: 'x' },
            // Vertical elevator 1
            { x: 940, y: 600, w: 140, h: 22, minX: 940, maxX: 940, minY: 360, maxY: 600, speed: 2.4, dir: -1, axis: 'y' },
            // Horizontal ferry 2
            { x: 1540, y: 500, w: 130, h: 22, minX: 1540, maxX: 1780, minY: 500, maxY: 500, speed: 2.8, dir: 1, axis: 'x' },
            // Fast diagonal elevator towards exit
            { x: 2100, y: 460, w: 140, h: 22, minX: 2100, maxX: 2100, minY: 260, maxY: 520, speed: 3.2, dir: -1, axis: 'y' }
        ],
        spikes: [
            // Pit floor hazards
            { x: 300, y: 760, w: 400, h: 24, dir: 'up' },
            { x: 860, y: 760, w: 420, h: 24, dir: 'up' },
            { x: 1480, y: 760, w: 370, h: 24, dir: 'up' },
            { x: 2030, y: 760, w: 450, h: 24, dir: 'up' }
        ],
        springs: [
            { x: 1360, y: 468, w: 40, h: 12, force: -18 }
        ],
        crumblingPlatforms: [],
        lasers: [],
        portals: [],
        keys: [],
        doors: [],
        stars: [
            { id: 1, x: 490, y: 560 },
            { id: 2, x: 1380, y: 250 }, // High above spring
            { id: 3, x: 2550, y: 300 }
        ],
        gems: [
            { x: 180, y: 640 }, { x: 780, y: 560 },
            { x: 1010, y: 320 }, { x: 1660, y: 440 },
            { x: 2170, y: 220 }, { x: 2240, y: 220 }
        ],
        checkpoints: [
            { x: 1380, y: 440, radius: 18 }
        ]
    },

    // --- LEVEL 3: Crumbling Cavern (Fragile steps & spikes) ---
    {
        id: 3,
        name: "3: Fragile Peaks",
        subtitle: "Don't stop rolling on crumbling blocks",
        bounds: { width: 3100, height: 850 },
        theme: {
            bg: ["#1c0b24", "#30123f", "#481b5e"],
            grid: "rgba(255, 0, 128, 0.08)",
            accent: "#ff0080",
            platformGlow: "rgba(255, 0, 128, 0.4)"
        },
        spawn: { x: 80, y: 680 },
        finish: { x: 2950, y: 350, radius: 28 },
        platforms: [
            // Start
            { x: 40, y: 740, w: 220, h: 40, type: 'solid' },
            // Solid midway havens
            { x: 920, y: 620, w: 180, h: 30, type: 'solid' },
            { x: 1800, y: 520, w: 200, h: 30, type: 'solid' },
            // End platform
            { x: 2800, y: 440, w: 260, h: 40, type: 'solid' }
        ],
        crumblingPlatforms: [
            // Sequence 1: 4 steps
            { x: 320, y: 710, w: 90, h: 22, maxTime: 0.65 },
            { x: 460, y: 680, w: 90, h: 22, maxTime: 0.65 },
            { x: 600, y: 650, w: 90, h: 22, maxTime: 0.65 },
            { x: 740, y: 620, w: 90, h: 22, maxTime: 0.65 },

            // Sequence 2: High altitude crumbling bridge
            { x: 1180, y: 580, w: 80, h: 22, maxTime: 0.55 },
            { x: 1320, y: 540, w: 80, h: 22, maxTime: 0.55 },
            { x: 1460, y: 500, w: 80, h: 22, maxTime: 0.55 },
            { x: 1600, y: 500, w: 80, h: 22, maxTime: 0.55 },

            // Sequence 3: Rapid descent / ascending steps
            { x: 2080, y: 500, w: 90, h: 22, maxTime: 0.5 },
            { x: 2240, y: 460, w: 90, h: 22, maxTime: 0.5 },
            { x: 2400, y: 420, w: 90, h: 22, maxTime: 0.5 },
            { x: 2580, y: 420, w: 90, h: 22, maxTime: 0.5 }
        ],
        movingPlatforms: [],
        spikes: [
            // Entire bottom is perilous void
            { x: 260, y: 810, w: 2540, h: 30, dir: 'up' },
            // Ceiling spikes above fragile bridge
            { x: 1250, y: 400, w: 240, h: 20, dir: 'down' }
        ],
        springs: [
            { x: 1000, y: 608, w: 40, h: 12, force: -19 },
            { x: 1880, y: 508, w: 40, h: 12, force: -18 }
        ],
        lasers: [],
        portals: [],
        keys: [],
        doors: [],
        stars: [
            { id: 1, x: 600, y: 560 },
            { id: 2, x: 1460, y: 340 },
            { id: 3, x: 2400, y: 330 }
        ],
        gems: [
            { x: 360, y: 640 }, { x: 500, y: 610 }, { x: 780, y: 550 },
            { x: 1020, y: 440 }, { x: 1360, y: 470 }, { x: 1640, y: 430 },
            { x: 2120, y: 430 }, { x: 2620, y: 350 }
        ],
        checkpoints: [
            { x: 1010, y: 580, radius: 18 },
            { x: 1900, y: 480, radius: 18 }
        ]
    },

    // --- LEVEL 4: Quantum Sanctuary (Lasers, Portals & Key-Lock) ---
    {
        id: 4,
        name: "4: Quantum Gates",
        subtitle: "Teleport, dodge lasers & unlock the exit",
        bounds: { width: 3300, height: 900 },
        theme: {
            bg: ["#120c24", "#201242", "#35146b"],
            grid: "rgba(168, 85, 247, 0.08)",
            accent: "#c084fc",
            platformGlow: "rgba(192, 132, 252, 0.4)"
        },
        spawn: { x: 80, y: 720 },
        finish: { x: 3120, y: 360, radius: 28 },
        platforms: [
            // Start zone
            { x: 40, y: 780, w: 300, h: 40, type: 'solid' },
            // Lower chamber
            { x: 480, y: 720, w: 220, h: 30, type: 'solid' },
            { x: 800, y: 680, w: 240, h: 30, type: 'solid' },
            // Key vault floating tower
            { x: 1180, y: 420, w: 200, h: 30, type: 'solid' },
            // Portal 1 landing ledge
            { x: 1540, y: 640, w: 260, h: 30, type: 'solid' },
            // Laser corridor platforms
            { x: 1940, y: 560, w: 160, h: 30, type: 'solid' },
            { x: 2240, y: 480, w: 180, h: 30, type: 'solid' },
            { x: 2560, y: 420, w: 220, h: 30, type: 'solid' },
            // Final vault before finish
            { x: 2920, y: 440, w: 340, h: 40, type: 'solid' }
        ],
        crumblingPlatforms: [
            { x: 1100, y: 600, w: 80, h: 22, maxTime: 0.6 }
        ],
        movingPlatforms: [
            { x: 860, y: 520, w: 120, h: 20, minX: 860, maxX: 860, minY: 420, maxY: 640, speed: 2.5, dir: -1, axis: 'y' }
        ],
        spikes: [
            { x: 340, y: 860, w: 2600, h: 30, dir: 'up' },
            // Ceiling spikes over laser area
            { x: 1900, y: 280, w: 500, h: 20, dir: 'down' }
        ],
        springs: [
            { x: 580, y: 708, w: 40, h: 12, force: -20 }
        ],
        lasers: [
            // Rotating hazard beam 1
            { cx: 2020, cy: 460, length: 110, angle: 0, speed: 0.035 },
            // Rotating hazard beam 2
            { cx: 2330, cy: 380, length: 120, angle: Math.PI, speed: -0.04 }
        ],
        portals: [
            // Portal pair: takes player across the abyss
            {
                in: { x: 1280, y: 360, radius: 22 },
                out: { x: 1600, y: 570 },
                color: "#00f3ff",
                label: "A"
            }
        ],
        keys: [
            // Golden Key needed to open the exit forcefield door
            { id: "gold_key", x: 1280, y: 320, color: "#ffd700", label: "🔑" }
        ],
        doors: [
            // Energy gate guarding finish line
            { id: "gate_1", x: 2900, y: 280, w: 24, h: 160, keyId: "gold_key", color: "#ffd700", opened: false }
        ],
        stars: [
            { id: 1, x: 600, y: 440 }, // High jump with spring
            { id: 2, x: 1220, y: 330 }, // In the key vault
            { id: 3, x: 2670, y: 340 }  // Timed past laser 2
        ],
        gems: [
            { x: 200, y: 720 }, { x: 920, y: 380 },
            { x: 1680, y: 580 }, { x: 2020, y: 500 },
            { x: 2330, y: 420 }, { x: 3000, y: 380 }
        ],
        checkpoints: [
            { x: 1640, y: 600, radius: 18 },
            { x: 2650, y: 380, radius: 18 }
        ]
    },

    // --- LEVEL 5: Apex Overdrive (The Grand Gauntlet) ---
    {
        id: 5,
        name: "5: Apex Overdrive",
        subtitle: "The ultimate trial of speed & mastery",
        bounds: { width: 3800, height: 950 },
        theme: {
            bg: ["#1a0808", "#330d12", "#4d101a"],
            grid: "rgba(255, 60, 60, 0.08)",
            accent: "#ff3366",
            platformGlow: "rgba(255, 51, 102, 0.4)"
        },
        spawn: { x: 80, y: 760 },
        finish: { x: 3600, y: 240, radius: 30 },
        platforms: [
            // Start
            { x: 40, y: 820, w: 260, h: 40, type: 'solid' },
            // Mid checkpoints & rest islands
            { x: 860, y: 700, w: 180, h: 30, type: 'solid' },
            { x: 1720, y: 600, w: 200, h: 30, type: 'solid' },
            { x: 2680, y: 460, w: 200, h: 30, type: 'solid' },
            // Final victory spire
            { x: 3480, y: 320, w: 260, h: 40, type: 'solid' }
        ],
        crumblingPlatforms: [
            { x: 380, y: 780, w: 80, h: 22, maxTime: 0.5 },
            { x: 520, y: 750, w: 80, h: 22, maxTime: 0.5 },
            { x: 660, y: 720, w: 80, h: 22, maxTime: 0.5 },

            { x: 1980, y: 560, w: 75, h: 22, maxTime: 0.45 },
            { x: 2120, y: 520, w: 75, h: 22, maxTime: 0.45 },
            { x: 2260, y: 480, w: 75, h: 22, maxTime: 0.45 },
            { x: 2400, y: 460, w: 75, h: 22, maxTime: 0.45 }
        ],
        movingPlatforms: [
            // Fast lift 1
            { x: 1120, y: 660, w: 130, h: 22, minX: 1120, maxX: 1400, minY: 660, maxY: 660, speed: 3.4, dir: 1, axis: 'x' },
            // Vertical elevator over spikes
            { x: 1480, y: 620, w: 120, h: 22, minX: 1480, maxX: 1480, minY: 380, maxY: 660, speed: 3.6, dir: -1, axis: 'y' },
            // Final approach ferry
            { x: 2960, y: 400, w: 130, h: 22, minX: 2960, maxX: 3340, minY: 400, maxY: 400, speed: 3.8, dir: 1, axis: 'x' }
        ],
        spikes: [
            // Continuous lava / spike floor
            { x: 200, y: 910, w: 3400, h: 30, dir: 'up' },
            // Floating mid-air spikes
            { x: 1200, y: 560, w: 60, h: 20, dir: 'down' },
            { x: 3100, y: 300, w: 80, h: 20, dir: 'down' }
        ],
        springs: [
            { x: 920, y: 688, w: 40, h: 12, force: -21 },
            { x: 2750, y: 448, w: 40, h: 12, force: -20 }
        ],
        lasers: [
            { cx: 1720, cy: 460, length: 130, angle: 0, speed: 0.045 },
            { cx: 2780, cy: 320, length: 120, angle: Math.PI / 2, speed: -0.05 }
        ],
        portals: [
            {
                in: { x: 1840, y: 530, radius: 22 },
                out: { x: 1940, y: 580 },
                color: "#ff007f",
                label: "Ω"
            }
        ],
        keys: [
            { id: "ruby_key", x: 1480, y: 320, color: "#ff0055", label: "🗝️" }
        ],
        doors: [
            { id: "boss_gate", x: 3450, y: 160, w: 24, h: 160, keyId: "ruby_key", color: "#ff0055", opened: false }
        ],
        stars: [
            { id: 1, x: 940, y: 420 },
            { id: 2, x: 1480, y: 260 },
            { id: 3, x: 3200, y: 260 }
        ],
        gems: [
            { x: 450, y: 700 }, { x: 590, y: 670 },
            { x: 1260, y: 600 }, { x: 1800, y: 420 },
            { x: 2190, y: 440 }, { x: 3050, y: 340 },
            { x: 3550, y: 260 }
        ],
        checkpoints: [
            { x: 950, y: 660, radius: 18 },
            { x: 1800, y: 560, radius: 18 },
            { x: 2770, y: 420, radius: 18 }
        ]
    }
];

// Helper to deep clone a level definition so modifications during gameplay don't corrupt the template
function getLevelCopy(levelId) {
    const original = GAME_LEVELS.find(lvl => lvl.id === levelId) || GAME_LEVELS[0];
    return JSON.parse(JSON.stringify(original));
}
