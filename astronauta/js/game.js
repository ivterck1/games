/**
 * ASTRONAUTA - Logica Principal del Juego
 */

// Variables globales
let canvas, ctx;
let gameState = 'intro';
let currentLevel = 1;
let score = 0;
let kills = 0;
let player;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let powerups = [];
let particles = [];
let stars = [];
let boss = null;
let bossSpawned = false;
let levelComplete = false;
let novaSaved = false;

let keys = { up: false, down: false, left: false, right: false };
let lastTime = 0;
let levelTimer = 0;
let enemySpawnTimers = [];
let highScore = 0;
let levelProgress = {};

// Inicializacion
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    loadProgress();
    setupEventListeners();
    createStars();

    updateIntroHighScore();
    showScreen('intro-screen');
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setupEventListeners() {
    // Teclado
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Pantalla tactil
    setupTouchControls();

    // Botones de UI
    document.getElementById('btn-play').addEventListener('click', startGame);
    document.getElementById('btn-back-select').addEventListener('click', () => showScreen('intro-screen'));
    document.getElementById('btn-pause').addEventListener('click', pauseGame);
    document.getElementById('btn-resume').addEventListener('click', resumeGame);
    document.getElementById('btn-pause-menu').addEventListener('click', () => { gameState = 'intro'; showScreen('intro-screen'); audioManager.stopMusic(); });
    document.getElementById('btn-retry').addEventListener('click', retryGame);
    document.getElementById('btn-gameover-menu').addEventListener('click', () => { gameState = 'intro'; showScreen('intro-screen'); });
    document.getElementById('btn-next-level').addEventListener('click', nextLevel);
    document.getElementById('btn-play-again').addEventListener('click', () => { currentLevel = 1; startGame(); });
    document.getElementById('btn-victory-menu').addEventListener('click', () => { gameState = 'intro'; showScreen('intro-screen'); });
}

function handleKeyDown(e) {
    if (gameState !== 'playing') return;

    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': keys.up = true; break;
        case 'ArrowDown': case 's': case 'S': keys.down = true; break;
        case 'ArrowLeft': case 'a': case 'A': keys.left = true; break;
        case 'ArrowRight': case 'd': case 'D': keys.right = true; break;
        case ' ': fireBullet('up'); break;
        case 'Escape': case 'p': case 'P': pauseGame(); break;
    }
}

function handleKeyUp(e) {
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': keys.up = false; break;
        case 'ArrowDown': case 's': case 'S': keys.down = false; break;
        case 'ArrowLeft': case 'a': case 'A': keys.left = false; break;
        case 'ArrowRight': case 'd': case 'D': keys.right = false; break;
    }
}

function setupTouchControls() {
    // Joystick
    const joystickBase = document.getElementById('joystick-base');
    const joystickStick = document.getElementById('joystick-stick');
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };

    joystickBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
        const rect = joystickBase.getBoundingClientRect();
        joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    joystickBase.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!joystickActive) return;

        const touch = e.touches[0];
        const dx = touch.clientX - joystickCenter.x;
        const dy = touch.clientY - joystickCenter.y;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 35);
        const angle = Math.atan2(dy, dx);

        joystickStick.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;

        keys.left = dx < -15;
        keys.right = dx > 15;
        keys.up = dy < -15;
        keys.down = dy > 15;
    });

    joystickBase.addEventListener('touchend', () => {
        joystickActive = false;
        joystickStick.style.transform = 'translate(0, 0)';
        keys.left = keys.right = keys.up = keys.down = false;
    });

    // Botones de disparo
    document.querySelectorAll('.fire-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            fireBullet(btn.dataset.dir);
        });
    });

    document.getElementById('btn-pause').addEventListener('click', pauseGame);
}

function fireBullet(direction) {
    if (gameState !== 'playing' || !player || !player.canFire()) return;

    let dx = 0, dy = 0;
    switch (direction) {
        case 'up': dy = -1; break;
        case 'down': dy = 1; break;
        case 'left': dx = -1; break;
        case 'right': dx = 1; break;
    }

    player.fire();

    if (player.powerup === 'TRIPLE') {
        if (dy !== 0) {
            bullets.push(new Bullet(player.x + player.width / 2 - 4, player.y + (dy > 0 ? player.height : 0), dx, dy));
            bullets.push(new Bullet(player.x + 5, player.y + (dy > 0 ? player.height : 0), dx - 0.3, dy));
            bullets.push(new Bullet(player.x + player.width - 5, player.y + (dy > 0 ? player.height : 0), dx + 0.3, dy));
        } else {
            bullets.push(new Bullet(player.x + (dx > 0 ? player.width : 0), player.y + player.height / 2 - 4, dx, dy));
            bullets.push(new Bullet(player.x + (dx > 0 ? player.width : 0), player.y + 5, dx, dy - 0.3));
            bullets.push(new Bullet(player.x + (dx > 0 ? player.width : 0), player.y + player.height - 5, dx, dy + 0.3));
        }
    } else {
        bullets.push(new Bullet(
            player.x + player.width / 2 - 4,
            player.y + player.height / 2 - 4,
            dx || 0,
            dy || -1
        ));
    }

    audioManager.playShoot();
}

// Pantallas
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function updateIntroHighScore() {
    document.getElementById('intro-high-score').textContent = highScore.toLocaleString();
}

function createStars() {
    stars = [];
    if (!canvas) return;
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }
}

// Progreso guardado
function loadProgress() {
    try {
        const saved = localStorage.getItem('astronauta_progress');
        if (saved) {
            const data = JSON.parse(saved);
            highScore = data.highScore || 0;
            levelProgress = data.levelProgress || {};
        }
    } catch (e) {}
}

function saveProgress() {
    try {
        localStorage.setItem('astronauta_progress', JSON.stringify({
            highScore,
            levelProgress
        }));
    } catch (e) {}
}

// Inicio del juego
function startGame() {
    audioManager.init();
    audioManager.resume();

    if (Object.keys(levelProgress).length === 0) {
        gameState = 'level-select';
        showScreen('level-select-screen');
        createLevelGrid();
    } else {
        startLevel(currentLevel);
    }
}

function createLevelGrid() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = i;

        const unlocked = i === 1 || levelProgress[i - 1];
        const starsEarned = levelProgress[i - 1]?.stars || 0;

        if (!unlocked) {
            btn.classList.add('locked');
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 10 0v2h1zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/></svg>';
        } else {
            if (i === currentLevel) btn.classList.add('current');
            if (starsEarned > 0) {
                const starDisplay = document.createElement('div');
                starDisplay.className = 'level-stars';
                starDisplay.textContent = '\u2605'.repeat(starsEarned);
                btn.appendChild(starDisplay);
            }

            btn.addEventListener('click', () => {
                currentLevel = i;
                startLevel(i);
            });
        }

        grid.appendChild(btn);
    }
}

function startLevel(level) {
    currentLevel = level;
    score = 0;
    kills = 0;
    levelComplete = false;
    novaSaved = false;
    bossSpawned = false;
    levelTimer = 0;
    enemySpawnTimers = [];

    // Limpiar entidades
    enemies = [];
    bullets = [];
    enemyBullets = [];
    powerups = [];
    particles = [];
    boss = null;

    // Crear estrellas
    createStars();

    // Crear jugador
    player = new Player(canvas.width / 2 - 20, canvas.height - 100);

    // Configurar timers de spawn
    const levelConfig = LEVELS[level];
    levelConfig.enemies.forEach((enemyType) => {
        enemySpawnTimers.push({
            type: enemyType.type,
            count: enemyType.count,
            spawned: 0,
            interval: enemyType.interval,
            speed: enemyType.speed,
            lastSpawn: 0
        });
    });

    // Mostrar pantalla de juego
    showScreen('game-screen');

    // Actualizar HUD
    updateHUD();

    // Anunciar nivel
    announceLevel(level);

    // Iniciar musica
    audioManager.playLevelMusic(level);

    gameState = 'playing';
}

function announceLevel(level) {
    const levelData = LEVELS[level];
    document.getElementById('announce-level-text').textContent = 'NIVEL ' + level;
    document.getElementById('announce-planet-text').textContent = levelData.name;
    document.getElementById('level-announce').classList.remove('hidden');

    audioManager.playTransition();

    setTimeout(() => {
        document.getElementById('level-announce').classList.add('hidden');
    }, 2000);
}

function updateHUD() {
    // Vidas
    const livesContainer = document.getElementById('lives-hearts');
    livesContainer.innerHTML = '';
    for (let i = 0; i < PLAYER_CONFIG.lives; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart' + (i >= (player?.lives || 0) ? ' lost' : '');
        heart.textContent = '\u2764';
        livesContainer.appendChild(heart);
    }

    // Score y nivel
    document.getElementById('score').textContent = score.toLocaleString();
    document.getElementById('level-num').textContent = currentLevel;

    // Powerup
    const powerupIcon = document.getElementById('powerup-icon');
    if (player?.powerup) {
        powerupIcon.textContent = POWERUPS[player.powerup].icon;
        powerupIcon.style.color = POWERUPS[player.powerup].color;
    } else {
        powerupIcon.textContent = '-';
        powerupIcon.style.color = '#ffffff';
    }

    // Barra de boss
    const bossBar = document.getElementById('boss-bar-container');
    if (boss) {
        bossBar.classList.remove('hidden');
        document.getElementById('boss-name').textContent = boss.name;
        document.getElementById('boss-health').style.width = (boss.getHealthPercent() * 100) + '%';
    } else {
        bossBar.classList.add('hidden');
    }
}

// Bucle principal del juego
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Siempre dibujar
    draw();

    // Solo actualizar logica si estamos jugando
    if (gameState === 'playing') {
        update(deltaTime);
    }

    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    levelTimer += deltaTime;

    // Spawnear enemigos
    spawnEnemies(deltaTime);

    // Spawnear boss
    checkBossSpawn();

    // Actualizar jugador
    if (player) {
        player.update(deltaTime, keys);
    }

    // Actualizar balas del jugador
    bullets.forEach(b => b.update());
    bullets = bullets.filter(b => b.active);

    // Actualizar balas enemigas
    enemyBullets.forEach(b => b.update());
    enemyBullets = enemyBullets.filter(b => b.active);

    // Actualizar enemigos
    enemies.forEach(e => {
        e.update(player.x, player.y);
        if (e.canShoot()) {
            e.shoot();
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            enemyBullets.push(new Bullet(e.x + e.width / 2, e.y + e.height, Math.cos(angle), Math.sin(angle), false));
        }
    });
    enemies = enemies.filter(e => e.active);

    // Actualizar boss
    if (boss) {
        boss.update(player.x, player.y);
        if (boss.canShoot()) {
            boss.shoot();
            const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
            enemyBullets.push(new Bullet(boss.x + boss.width / 2, boss.y + boss.height, Math.cos(angle), Math.sin(angle), false));
        }
    }

    // Actualizar power-ups
    powerups.forEach(p => p.update(deltaTime));
    powerups = powerups.filter(p => p.active);

    // Actualizar particulas
    particles.forEach(p => p.update());
    particles = particles.filter(p => p.active);

    // Actualizar estrellas
    stars.forEach(s => s.update());

    // Colisiones
    checkCollisions();

    // Verificar fin de nivel
    checkLevelComplete();

    // Actualizar HUD
    updateHUD();
}

function spawnEnemies(deltaTime) {
    enemySpawnTimers.forEach(spawner => {
        if (spawner.spawned < spawner.count) {
            if (levelTimer - spawner.lastSpawn >= spawner.interval) {
                const x = Math.random() * (canvas.width - ENEMY_TYPES[spawner.type].width);
                const y = 50 + Math.random() * 100;
                const enemy = new Enemy(x, y, spawner.type);
                enemy.speed = spawner.speed;
                enemies.push(enemy);
                spawner.spawned++;
                spawner.lastSpawn = levelTimer;
            }
        }
    });
}

function checkBossSpawn() {
    if (bossSpawned || boss) return;

    const allSpawned = enemySpawnTimers.every(s => s.spawned >= s.count);

    if (allSpawned && enemies.length === 0) {
        bossSpawned = true;
        spawnBoss();
    }
}

function spawnBoss() {
    const levelConfig = LEVELS[currentLevel];
    const bossConfig = levelConfig.miniboss || levelConfig.boss;

    document.getElementById('boss-approaching').textContent = bossConfig.name;
    document.getElementById('boss-announce').classList.remove('hidden');
    audioManager.playBossAppear();

    setTimeout(() => {
        document.getElementById('boss-announce').classList.add('hidden');
        boss = new Boss(levelConfig);
    }, 2000);
}

function checkCollisions() {
    // Balas del jugador vs enemigos
    bullets.forEach(bullet => {
        enemies.forEach(enemy => {
            if (bullet.active && enemy.active && bullet.collidesWith(enemy)) {
                bullet.active = false;
                if (enemy.takeDamage(PLAYER_CONFIG.bulletDamage)) {
                    score += enemy.points;
                    kills++;
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    audioManager.playExplosion();
                    spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                } else {
                    audioManager.playHit();
                }
            }
        });

        // Balas vs boss
        if (boss && bullet.active && bullet.collidesWith(boss)) {
            bullet.active = false;
            const result = boss.takeDamage(PLAYER_CONFIG.bulletDamage);
            if (result === true) {
                score += boss.points;
                kills++;
                createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, boss.color);
                audioManager.playExplosion();
                for (let i = 0; i < 3; i++) {
                    spawnPowerup(boss.x + Math.random() * boss.width, boss.y + Math.random() * boss.height);
                }
            } else if (result === 'phase2' || result === 'phase3') {
                audioManager.playBossAppear();
                createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ffffff');
            } else {
                audioManager.playHit();
            }
        }
    });

    // Balas enemigas vs jugador
    enemyBullets.forEach(bullet => {
        if (bullet.active && player && player.collidesWith(bullet)) {
            bullet.active = false;
            if (player.takeDamage()) {
                audioManager.playHurt();
                createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000');
                if (player.lives <= 0) {
                    gameOver();
                }
            }
        }
    });

    // Enemigos vs jugador
    enemies.forEach(enemy => {
        if (enemy.active && player && player.collidesWith(enemy)) {
            if (player.takeDamage()) {
                enemy.active = false;
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                audioManager.playExplosion();
                if (player.lives <= 0) {
                    gameOver();
                }
            }
        }
    });

    // Power-ups vs jugador
    powerups.forEach(powerup => {
        if (powerup.active && player && player.collidesWith(powerup)) {
            powerup.active = false;
            activatePowerup(powerup);
        }
    });
}

function activatePowerup(powerup) {
    audioManager.playPowerUp();

    if (powerup.type === 'LIFE') {
        player.lives = Math.min(player.lives + 1, 5);
        audioManager.playExtraLife();
    } else if (powerup.type === 'BOMB') {
        enemies.forEach(e => {
            score += e.points;
            kills++;
            createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.color);
        });
        enemies = [];
        enemyBullets = [];
        audioManager.playExplosion();
    } else {
        player.addPowerup(powerup.type);
    }

    createExplosion(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, powerup.config.color);
}

function spawnPowerup(x, y) {
    if (Math.random() < POWERUP_CONFIG.spawnChance) {
        powerups.push(new Powerup(x - POWERUP_CONFIG.width / 2, y - POWERUP_CONFIG.height / 2));
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, color, 3 + Math.random() * 5));
    }
}

function checkLevelComplete() {
    if (levelComplete) return;

    if (bossSpawned && boss && !boss.active) {
        levelComplete = true;

        if (currentLevel === 10) {
            novaSaved = true;
            setTimeout(() => showVictory(), 3000);
        } else {
            setTimeout(() => showLevelComplete(), 2000);
        }
    }
}

function showLevelComplete() {
    audioManager.playLevelComplete();
    audioManager.stopMusic();

    const levelConfig = LEVELS[currentLevel];
    const thresholds = levelConfig.starThresholds;
    let starsEarned = 0;
    if (score >= thresholds[0]) starsEarned = 1;
    if (score >= thresholds[1]) starsEarned = 2;
    if (score >= thresholds[2]) starsEarned = 3;

    document.getElementById('completed-level').textContent = currentLevel;
    document.getElementById('level-score').textContent = score.toLocaleString();
    document.getElementById('level-kills').textContent = kills;

    const starsContainer = document.getElementById('level-stars');
    starsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const star = document.createElement('span');
        star.className = 'star' + (i < starsEarned ? ' earned' : '');
        star.textContent = '\u2605';
        starsContainer.appendChild(star);
    }

    if (!levelProgress[currentLevel] || levelProgress[currentLevel].stars < starsEarned) {
        levelProgress[currentLevel] = { stars: starsEarned };
    }
    if (score > highScore) {
        highScore = score;
    }
    saveProgress();

    showScreen('level-complete-screen');
}

function nextLevel() {
    if (currentLevel < 10) {
        currentLevel++;
        levelProgress[currentLevel - 1] = levelProgress[currentLevel - 1] || { stars: 0 };
        startLevel(currentLevel);
    } else {
        showVictory();
    }
}

function showVictory() {
    audioManager.playVictory();
    audioManager.stopMusic();

    document.getElementById('victory-score').textContent = score.toLocaleString();
    document.getElementById('victory-kills').textContent = kills;

    if (score > highScore) {
        highScore = score;
    }
    saveProgress();

    showScreen('victory-screen');
}

function gameOver() {
    gameState = 'gameover';
    audioManager.playGameOver();
    audioManager.stopMusic();

    if (score > highScore) {
        highScore = score;
        document.getElementById('new-record').classList.remove('hidden');
    } else {
        document.getElementById('new-record').classList.add('hidden');
    }

    document.getElementById('final-level').textContent = currentLevel;
    document.getElementById('final-score').textContent = score.toLocaleString();
    document.getElementById('final-kills').textContent = kills;

    saveProgress();
    showScreen('gameover-screen');
}

function retryGame() {
    score = 0;
    kills = 0;
    startLevel(currentLevel);
}

function pauseGame() {
    if (gameState !== 'playing') return;
    gameState = 'paused';
    audioManager.pauseMusic();
    showScreen('pause-screen');
}

function resumeGame() {
    gameState = 'playing';
    audioManager.resumeMusic();
    showScreen('game-screen');
}

// Dibujo
function draw() {
    if (!ctx || !canvas) return;

    // Siempre dibujar estrellas de fondo
    drawStars();

    // Si estamos en intro, solo dibujar estrellas
    if (gameState === 'intro') {
        return;
    }

    // Si estamos en seleccion de nivel
    if (gameState === 'level-select') {
        return;
    }

    // Estamos en el juego - dibujar todo
    const levelConfig = LEVELS[currentLevel] || { background: '#0a0a1a' };

    // Fondo del nivel
    ctx.fillStyle = levelConfig.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Estrellas
    stars.forEach(s => s.draw(ctx));

    // Particulas
    particles.forEach(p => p.draw(ctx));

    // Power-ups
    powerups.forEach(p => p.draw(ctx));

    // Enemigos
    enemies.forEach(e => e.draw(ctx));

    // Boss
    if (boss) boss.draw(ctx);

    // Jugador
    if (player) player.draw(ctx);

    // Balas
    bullets.forEach(b => b.draw(ctx));
    enemyBullets.forEach(b => b.draw(ctx));
}

function drawStars() {
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => s.draw(ctx));
}

// Iniciar cuando carga la pagina
window.addEventListener('load', init);
