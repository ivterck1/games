/**
 * ASTRONAUTA - Entidades del Juego
 */

// Clase base para todas las entidades
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

// Clase Jugador (Astronauta Luna)
class Player extends Entity {
    constructor(x, y) {
        super(x, y, PLAYER_CONFIG.width, PLAYER_CONFIG.height);
        this.speed = PLAYER_CONFIG.speed;
        this.lives = PLAYER_CONFIG.lives;
        this.health = 100;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.powerup = null;
        this.powerupTimer = 0;
        this.fireDirection = { x: 0, y: -1 };
        this.lastFire = 0;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update(deltaTime, keys) {
        // Movimiento
        let dx = 0, dy = 0;
        const currentSpeed = this.powerup === 'SPEED' ? this.speed * 1.5 : this.speed;

        if (keys.up) dy -= currentSpeed;
        if (keys.down) dy += currentSpeed;
        if (keys.left) dx -= currentSpeed;
        if (keys.right) dx += currentSpeed;

        // Normalizar diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        this.x += dx;
        this.y += dy;

        // Límites de pantalla
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

        // Timer de invencibilidad
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // Timer de powerup
        if (this.powerup && !POWERUPS[this.powerup].instant) {
            this.powerupTimer -= deltaTime;
            if (this.powerupTimer <= 0) {
                this.powerup = null;
            }
        }

        // Animación
        this.animTimer += deltaTime;
        if (this.animTimer > 100) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        // Flash cuando invencible
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Dibujar astronauta (forma simplificada)
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Traje espacial
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 5, 15, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Casco
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 15, 12, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Visor
        ctx.fillStyle = '#003366';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 15, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brillo del visor
        ctx.fillStyle = 'rgba(0,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - 3, cy - 18, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Propulsores
        ctx.fillStyle = '#666666';
        ctx.fillRect(cx - 18, cy + 10, 6, 12);
        ctx.fillRect(cx + 12, cy + 10, 6, 12);

        // Escudo
        if (this.powerup === 'SHIELD') {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0,255,255,0.1)';
            ctx.fill();
        }

        ctx.restore();
    }

    canFire() {
        return Date.now() - this.lastFire >= PLAYER_CONFIG.fireRate;
    }

    fire() {
        this.lastFire = Date.now();
    }

    takeDamage() {
        if (this.invincible || this.powerup === 'SHIELD') return false;

        this.lives--;
        if (this.lives > 0) {
            this.invincible = true;
            this.invincibleTimer = PLAYER_CONFIG.invincibleTime;
        }
        return true;
    }

    addPowerup(type) {
        this.powerup = type;
        this.powerupTimer = POWERUPS[type].duration;
    }
}

// Clase proyectil
class Bullet extends Entity {
    constructor(x, y, dx, dy, isPlayer = true, damage = PLAYER_CONFIG.bulletDamage) {
        super(x, y, 8, 8);
        this.dx = dx;
        this.dy = dy;
        this.speed = PLAYER_CONFIG.bulletSpeed;
        this.isPlayer = isPlayer;
        this.damage = damage;
    }

    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Desactivar si sale de pantalla
        if (this.x < -20 || this.x > canvas.width + 20 ||
            this.y < -20 || this.y > canvas.height + 20) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isPlayer ? PLAYER_CONFIG.bulletColor : '#ff0000';
        ctx.shadowColor = this.isPlayer ? '#00ffff' : '#ff0000';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Clase Enemigo
class Enemy extends Entity {
    constructor(x, y, type) {
        const config = ENEMY_TYPES[type];
        super(x, y, config.width, config.height);
        this.type = type;
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.points = config.points;
        this.color = config.color;
        this.canShoot = config.canShoot || false;
        this.flying = config.flying || false;
        this.shootInterval = config.shootInterval || 2000;
        this.lastShot = 0;
        this.angle = 0;
        this.movePattern = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        this.moveDir = 1;
    }

    update(playerX, playerY) {
        // Movimiento
        if (this.flying) {
            // Movimiento sinusoidal
            this.angle += 0.05;
            this.x += Math.sin(this.angle) * 2;
            this.y += this.speed * this.moveDir;
        } else {
            // Movimiento hacia jugador
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (this.movePattern === 'horizontal') {
                this.x += this.speed * this.moveDir;
                this.y += (dy / dist) * this.speed * 0.5;
            } else {
                this.x += (dx / dist) * this.speed * 0.5;
                this.y += this.speed * this.moveDir;
            }
        }

        // Cambiar dirección
        if (this.x < 10 || this.x > canvas.width - this.width - 10) {
            this.moveDir *= -1;
        }
        if (this.y < 50 || this.y > canvas.height - this.height - 50) {
            this.moveDir *= -1;
        }

        // Límites
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(50, Math.min(canvas.height - this.height - 50, this.y));
    }

    draw(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();

        // Cuerpo del alien
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(cx, cy, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ojos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 3, 5, 0, Math.PI * 2);
        ctx.arc(cx + 6, cy - 3, 5, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 3, 2, 0, Math.PI * 2);
        ctx.arc(cx + 7, cy - 3, 2, 0, Math.PI * 2);
        ctx.fill();

        // Antenas (para algunos tipos)
        if (this.type !== 'basic') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 8, cy - this.height / 2);
            ctx.lineTo(cx - 12, cy - this.height / 2 - 10);
            ctx.moveTo(cx + 8, cy - this.height / 2);
            ctx.lineTo(cx + 12, cy - this.height / 2 - 10);
            ctx.stroke();
        }

        // Barra de vida
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x, this.y - 8, this.width, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y - 8, this.width * (this.health / this.maxHealth), 4);
        }

        ctx.restore();
    }

    canShoot() {
        return this.canShoot && Date.now() - this.lastShot >= this.shootInterval;
    }

    shoot() {
        this.lastShot = Date.now();
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.active = false;
            return true;
        }
        return false;
    }
}

// Clase Boss
class Boss extends Entity {
    constructor(level) {
        const config = level.miniboss || level.boss;
        super(canvas.width / 2 - config.size / 2, -config.size, config.size * 1.5, config.size);
        this.name = config.name;
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.points = config.points;
        this.color = config.color;
        this.phase = 1;
        this.maxPhase = config.phases || 1;
        this.entering = true;
        this.targetY = 80;
        this.shootPattern = 0;
        this.lastShot = 0;
        this.shootInterval = 1000;
        this.moveDir = 1;
        this.angle = 0;
    }

    update(playerX, playerY) {
        // Entrada
        if (this.entering) {
            this.y += 2;
            if (this.y >= this.targetY) {
                this.entering = false;
            }
            return;
        }

        // Movimiento
        this.angle += 0.02;
        this.x += Math.sin(this.angle) * this.speed;
        this.y = this.targetY + Math.sin(this.angle * 0.5) * 20;

        // Límites
        this.x = Math.max(20, Math.min(canvas.width - this.width - 20, this.x));

        // Cambiar fase según vida
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent <= 0.66 && this.phase < 2) this.phase = 2;
        if (healthPercent <= 0.33 && this.phase < 3) this.phase = 3;

        // Ajustar velocidad de disparo según fase
        this.shootInterval = 1200 - (this.phase * 300);
    }

    draw(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        ctx.save();

        // Efecto pulsante según fase
        const pulse = 1 + Math.sin(Date.now() / 200) * 0.05 * this.phase;

        // Cuerpo principal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(cx, cy, this.width / 2 * pulse, this.height / 2 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();

        // Detalles según fase
        if (this.phase >= 1) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy - 10, 15 * pulse, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.phase >= 2) {
            // Ojos adicionales
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(cx - 25, cy + 10, 8, 0, Math.PI * 2);
            ctx.arc(cx + 25, cy + 10, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.phase >= 3) {
            // Detalles de fase 3
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + Date.now() / 1000;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(angle) * 40, cy + Math.sin(angle) * 40);
                ctx.stroke();
            }
        }

        // Barra de vida
        const barWidth = this.width * 0.8;
        ctx.fillStyle = '#333';
        ctx.fillRect(cx - barWidth / 2, this.y + this.height + 10, barWidth, 10);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(cx - barWidth / 2, this.y + this.height + 10, barWidth * (this.health / this.maxHealth), 10);

        ctx.restore();
    }

    canShoot() {
        return !this.entering && Date.now() - this.lastShot >= this.shootInterval;
    }

    shoot() {
        this.lastShot = Date.now();
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.active = false;
            return true;
        }

        // Transición de fase
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent <= 0.66 && this.phase < 2) {
            this.phase = 2;
            return 'phase2';
        }
        if (healthPercent <= 0.33 && this.phase < 3) {
            this.phase = 3;
            return 'phase3';
        }
        return false;
    }

    getHealthPercent() {
        return this.health / this.maxHealth;
    }
}

// Clase Power-up
class Powerup extends Entity {
    constructor(x, y) {
        super(x, y, POWERUP_CONFIG.width, POWERUP_CONFIG.height);
        this.type = POWERUP_CONFIG.types[Math.floor(Math.random() * POWERUP_CONFIG.types.length)];
        this.config = POWERUPS[this.type];
        this.angle = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update(deltaTime) {
        this.angle += 0.05;
        this.y += Math.sin(this.bobOffset + this.angle) * 0.5;
    }

    draw(ctx) {
        ctx.save();

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Brillo
        ctx.shadowColor = this.config.color;
        ctx.shadowBlur = 15;

        // Icono
        ctx.fillStyle = this.config.color;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, cx, cy);

        // Estrella brillante
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const starAngle = (i / 4) * Math.PI * 2 + this.angle;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(starAngle) * 20, cy + Math.sin(starAngle) * 20);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Clase Partícula (para explosiones y efectos)
class Particle extends Entity {
    constructor(x, y, color, size = 5) {
        super(x, y, size, size);
        this.color = color;
        this.dx = (Math.random() - 0.5) * 10;
        this.dy = (Math.random() - 0.5) * 10;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dx *= 0.95;
        this.dy *= 0.95;
        this.life -= this.decay;
        if (this.life <= 0) this.active = false;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Efectos de estrella en el fondo
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.twinkle = Math.random() * Math.PI * 2;
        this.speed = 0.02 + Math.random() * 0.03;
    }

    update() {
        this.twinkle += this.speed;
    }

    draw(ctx) {
        const alpha = 0.5 + Math.sin(this.twinkle) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
