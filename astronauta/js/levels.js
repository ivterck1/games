/**
 * ASTRONAUTA - Configuración de Niveles
 */

const LEVELS = {
    1: {
        name: "TIERRA",
        description: "El planeta hogar",
        background: "#1a3a5c",
        enemies: [
            { type: 'basic', count: 5, interval: 2000, speed: 1.5 },
            { type: 'flying', count: 3, interval: 3000, speed: 2 }
        ],
        miniboss: {
            name: "DRONE GUARDIAN",
            health: 100,
            size: 50,
            color: "#00ff00",
            speed: 2,
            points: 1000
        },
        starThresholds: [500, 1000, 2000],
        enemySpeed: 1,
        spawnRate: 1
    },
    2: {
        name: "MARTE",
        description: "El planeta rojo",
        background: "#8b2500",
        enemies: [
            { type: 'basic', count: 8, interval: 1800, speed: 1.8 },
            { type: 'flying', count: 5, interval: 2500, speed: 2.2 }
        ],
        miniboss: {
            name: "ROBOT MARCIANO",
            health: 150,
            size: 55,
            color: "#ff6600",
            speed: 2.5,
            points: 1500
        },
        starThresholds: [800, 1800, 3500],
        enemySpeed: 1.2,
        spawnRate: 1.1
    },
    3: {
        name: "VENUS",
        description: "El planeta abrasador",
        background: "#8b6914",
        enemies: [
            { type: 'basic', count: 10, interval: 1600, speed: 2 },
            { type: 'flying', count: 6, interval: 2200, speed: 2.5 },
            { type: 'shooter', count: 3, interval: 4000, speed: 1.5 }
        ],
        miniboss: {
            name: "GUERRERO VENUSIANO",
            health: 200,
            size: 60,
            color: "#ffcc00",
            speed: 2.8,
            points: 2000
        },
        starThresholds: [1200, 2500, 5000],
        enemySpeed: 1.3,
        spawnRate: 1.2
    },
    4: {
        name: "JUPITER",
        description: "El gigante gaseoso",
        background: "#4a2c0a",
        enemies: [
            { type: 'basic', count: 12, interval: 1500, speed: 2.2 },
            { type: 'flying', count: 8, interval: 2000, speed: 2.8 },
            { type: 'shooter', count: 5, interval: 3500, speed: 1.8 }
        ],
        miniboss: {
            name: "COMANDANTE JOVIANO",
            health: 250,
            size: 65,
            color: "#ff9966",
            speed: 3,
            points: 2500
        },
        starThresholds: [1500, 3500, 7000],
        enemySpeed: 1.4,
        spawnRate: 1.3
    },
    5: {
        name: "SATURNO",
        description: "El planeta de los anillos",
        background: "#3d3a1a",
        enemies: [
            { type: 'basic', count: 14, interval: 1400, speed: 2.5 },
            { type: 'flying', count: 10, interval: 1800, speed: 3 },
            { type: 'shooter', count: 6, interval: 3000, speed: 2 }
        ],
        miniboss: {
            name: "TITAN SATURNIANO",
            health: 300,
            size: 70,
            color: "#ccaa66",
            speed: 3.2,
            points: 3000
        },
        starThresholds: [2000, 4500, 9000],
        enemySpeed: 1.5,
        spawnRate: 1.4
    },
    6: {
        name: "NEPTUNO",
        description: "El mundo de hielo",
        background: "#0a2a4a",
        enemies: [
            { type: 'basic', count: 16, interval: 1300, speed: 2.8 },
            { type: 'flying', count: 12, interval: 1600, speed: 3.3 },
            { type: 'shooter', count: 8, interval: 2800, speed: 2.2 }
        ],
        miniboss: {
            name: "ALMIRANTE HELADO",
            health: 350,
            size: 75,
            color: "#66ccff",
            speed: 3.5,
            points: 3500
        },
        starThresholds: [2500, 5500, 11000],
        enemySpeed: 1.6,
        spawnRate: 1.5
    },
    7: {
        name: "PLUTON",
        description: "El mundo helado oscuro",
        background: "#1a1a2a",
        enemies: [
            { type: 'basic', count: 18, interval: 1200, speed: 3 },
            { type: 'flying', count: 14, interval: 1500, speed: 3.5 },
            { type: 'shooter', count: 10, interval: 2500, speed: 2.5 }
        ],
        miniboss: {
            name: "SENOR DE PLUTON",
            health: 400,
            size: 80,
            color: "#9966ff",
            speed: 3.8,
            points: 4000
        },
        starThresholds: [3000, 6500, 13000],
        enemySpeed: 1.7,
        spawnRate: 1.6
    },
    8: {
        name: "GALAXIA X",
        description: "Dimension desconocida",
        background: "#2a0a3a",
        enemies: [
            { type: 'basic', count: 20, interval: 1100, speed: 3.3 },
            { type: 'flying', count: 16, interval: 1400, speed: 3.8 },
            { type: 'shooter', count: 12, interval: 2300, speed: 2.8 }
        ],
        miniboss: {
            name: "GUARDIAN COSMICO",
            health: 450,
            size: 85,
            color: "#ff66ff",
            speed: 4,
            points: 4500
        },
        starThresholds: [3500, 7500, 15000],
        enemySpeed: 1.8,
        spawnRate: 1.7
    },
    9: {
        name: "NEBULOSA",
        description: "El Corazon del Espacio",
        background: "#1a0a2a",
        enemies: [
            { type: 'basic', count: 25, interval: 1000, speed: 3.5 },
            { type: 'flying', count: 20, interval: 1300, speed: 4 },
            { type: 'shooter', count: 15, interval: 2000, speed: 3 }
        ],
        miniboss: {
            name: "EMPERADOR NEBULOSO",
            health: 500,
            size: 90,
            color: "#ff3399",
            speed: 4.2,
            points: 5000
        },
        starThresholds: [4000, 8500, 17000],
        enemySpeed: 1.9,
        spawnRate: 1.8
    },
    10: {
        name: "MUNDO ALIEN",
        description: "La base del secuestrador",
        background: "#0a0a0a",
        enemies: [
            { type: 'basic', count: 30, interval: 900, speed: 3.8 },
            { type: 'flying', count: 25, interval: 1200, speed: 4.3 },
            { type: 'shooter', count: 20, interval: 1800, speed: 3.3 }
        ],
        miniboss: null,
        boss: {
            name: "MALVADO DR. Z",
            health: 800,
            size: 120,
            color: "#ff0000",
            speed: 1.5,
            phases: 3,
            points: 15000
        },
        starThresholds: [5000, 10000, 20000],
        enemySpeed: 2,
        spawnRate: 2
    }
};

const POWERUPS = {
    SHIELD: { name: 'ESCUDO', icon: '#', color: '#00ffff', duration: 5000 },
    TRIPLE: { name: 'TRIPLE', icon: '*', color: '#ffff00', duration: 8000 },
    BOMB: { name: 'BOMBA', icon: '!', color: '#ff6600', instant: true },
    SPEED: { name: 'VELOCIDAD', icon: '>', color: '#00ff00', duration: 6000 },
    LIFE: { name: 'VIDA', icon: '+', color: '#ff0000', instant: true }
};

const ENEMY_TYPES = {
    basic: { width: 30, height: 30, health: 20, speed: 2, points: 100, color: '#ff4444' },
    flying: { width: 35, height: 25, health: 15, speed: 3, points: 150, color: '#44ff44', flying: true },
    shooter: { width: 40, height: 40, health: 30, speed: 1.5, points: 200, color: '#ff44ff', canShoot: true }
};

const PLAYER_CONFIG = {
    width: 40, height: 50, speed: 5, fireRate: 200, bulletSpeed: 10, bulletDamage: 10,
    lives: 3, invincibleTime: 2000, color: '#00ffff', bulletColor: '#00ffff'
};

const POWERUP_CONFIG = {
    width: 30, height: 30, speed: 1.5, spawnChance: 0.15,
    types: ['SHIELD', 'TRIPLE', 'BOMB', 'SPEED', 'LIFE']
};
