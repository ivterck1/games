/**
 * ASTRONAUTA - Sistema de Audio
 * Genera sonidos 8-bit usando Web Audio API
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.musicVolume = 0.15;
        this.sfxVolume = 0.4;
        this.currentMusic = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;
        this.musicOscillators = [];
        this.musicTimeouts = [];
        this.isPlaying = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.audioContext.destination);

            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.audioContext.destination);

            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API no soportada:', e);
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Reproducir nota musical
    playNote(frequency, duration, type = 'square', gain = 0.3) {
        if (!this.initialized) return;

        const osc = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.value = frequency;

        noteGain.gain.value = gain;
        noteGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(noteGain);
        noteGain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    // Sonido de disparo
    playShoot() {
        if (!this.initialized) return;
        this.playNote(880, 0.05, 'square', 0.2);
        setTimeout(() => this.playNote(1100, 0.05, 'square', 0.15), 20);
    }

    // Sonido de enemigo golpeado
    playHit() {
        if (!this.initialized) return;
        this.playNote(200, 0.1, 'sawtooth', 0.3);
        this.playNote(150, 0.15, 'square', 0.2);
    }

    // Sonido de explosion
    playExplosion() {
        if (!this.initialized) return;

        // Ruido blanco para explosion
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.value = 0.4;
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        noise.start();
    }

    // Sonido de power-up
    playPowerUp() {
        if (!this.initialized) return;

        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.1, 'sine', 0.3), i * 80);
        });
    }

    // Sonido de muerte del jugador
    playDeath() {
        if (!this.initialized) return;

        const notes = [400, 350, 300, 250, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.15, 'sawtooth', 0.4), i * 100);
        });
    }

    // Sonido de vida extra
    playExtraLife() {
        if (!this.initialized) return;

        const notes = [784, 880, 988, 1047, 1175]; // G5 a D6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.08, 'sine', 0.25), i * 50);
        });
    }

    // Sonido de nivel completado
    playLevelComplete() {
        if (!this.initialized) return;

        const melody = [
            { freq: 523, dur: 0.15 },  // C5
            { freq: 659, dur: 0.15 },  // E5
            { freq: 784, dur: 0.15 },  // G5
            { freq: 1047, dur: 0.3 }   // C6
        ];

        let time = 0;
        melody.forEach(note => {
            setTimeout(() => this.playNote(note.freq, note.dur, 'sine', 0.35), time);
            time += note.dur * 1000 + 50;
        });
    }

    // Sonido de Game Over
    playGameOver() {
        if (!this.initialized) return;

        const notes = [392, 349, 330, 262]; // G4, F4, E4, C4 descendente
        notes.forEach((freq, i) => {
            setTimeout(() => this.playNote(freq, 0.4, 'sawtooth', 0.3), i * 300);
        });
    }

    // Sonido de Victoria
    playVictory() {
        if (!this.initialized) return;

        const melody = [
            { freq: 523, dur: 0.1 },  // C5
            { freq: 659, dur: 0.1 },  // E5
            { freq: 784, dur: 0.1 },  // G5
            { freq: 1047, dur: 0.1 }, // C6
            { freq: 784, dur: 0.1 },  // G5
            { freq: 1047, dur: 0.2 }, // C6
            { freq: 1319, dur: 0.4 }  // E6
        ];

        let time = 0;
        melody.forEach(note => {
            setTimeout(() => this.playNote(note.freq, note.dur, 'square', 0.25), time);
            time += note.dur * 1000 + 30;
        });
    }

    // Sonido de boss aparece
    playBossAppear() {
        if (!this.initialized) return;

        // Sonido ominoso
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playNote(100 + i * 20, 0.2, 'sawtooth', 0.3);
            }, i * 150);
        }
        setTimeout(() => {
            this.playNote(80, 0.5, 'sawtooth', 0.4);
        }, 800);
    }

    // Sonido de dano recibido
    playHurt() {
        if (!this.initialized) return;
        this.playNote(150, 0.1, 'square', 0.4);
        setTimeout(() => this.playNote(100, 0.1, 'square', 0.3), 50);
    }

    // ========================================
    // MUSICA DE FONDO POR NIVEL
    // ========================================

    stopMusic() {
        this.isPlaying = false;

        // Detener todos los timeouts
        this.musicTimeouts.forEach(t => clearTimeout(t));
        this.musicTimeouts = [];

        // Detener osciladores
        this.musicOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        this.musicOscillators = [];

        if (this.currentMusic) {
            this.currentMusic = null;
        }
    }

    playLevelMusic(level) {
        this.stopMusic();
        if (!this.initialized) return;

        this.isPlaying = true;
        const frequencies = this.getMusicPattern(level);

        // Crear osciladores simples para musica ambiental
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        gain1.gain.value = 0.06;
        gain2.gain.value = 0.04;

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(this.musicGain);
        gain2.connect(this.musicGain);

        this.musicOscillators.push(osc1, osc2);

        osc1.start();
        osc2.start();

        // Cambiar notas periodicamente
        let noteIndex = 0;
        const playNextNote = () => {
            if (!this.isPlaying) return;

            const freq = frequencies[noteIndex % frequencies.length];
            osc1.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            osc2.frequency.setValueAtTime(freq * 1.5, this.audioContext.currentTime);

            noteIndex++;

            const timeout = setTimeout(playNextNote, 400);
            this.musicTimeouts.push(timeout);
        };

        playNextNote();
    }

    getMusicPattern(level) {
        const baseFreqs = {
            1:  [261, 329, 392],  // C, E, G - Tierra
            2:  [293, 369, 440],  // D, F#, A - Marte
            3:  [329, 415, 493],  // E, Ab, B - Venus
            4:  [349, 440, 523],  // F, A, C - Jupiter
            5:  [392, 493, 587],  // G, B, D - Saturno
            6:  [440, 554, 659],  // A, C#, E - Neptuno
            7:  [493, 622, 739],  // B, Eb, F# - Pluton
            8:  [523, 659, 783],  // C, E, G# - Galaxia
            9:  [587, 739, 880],  // D, F#, A# - Dimensión X
            10: [196, 246, 293]   // G, B, D - Boss Final
        };

        return baseFreqs[level] || baseFreqs[1];
    }

    // Musica de pausa (silencio suave)
    pauseMusic() {
        if (this.musicGain) {
            this.musicGain.gain.value = 0.01;
        }
    }

    resumeMusic() {
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }

    // Efecto de transicion de nivel
    playTransition() {
        if (!this.initialized) return;

        // Efecto de teletransporte
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playNote(200 + i * 100, 0.05, 'sine', 0.2);
            }, i * 50);
        }
    }
}

// Instancia global
const audioManager = new AudioManager();
