// Procedural Sound Synthesizer using Web Audio API
// Works offline with zero external audio assets!

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.step = 0;
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);
        } catch (e) {
            console.warn("Web Audio not supported or blocked", e);
        }
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // --- SFX GENERATORS ---

    // Bounce sound (frequency scales with speed)
    playBounce(intensity = 1.0) {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseFreq = 120 + Math.min(intensity, 2.5) * 80;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

        gain.gain.setValueAtTime(Math.min(0.5 * intensity, 0.6), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    // Jump sound (rising pitch chirp)
    playJump() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    // Spring Pad Boing
    playSpring() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(480, now + 0.1);
        osc.frequency.linearRampToValueAtTime(200, now + 0.25);
        osc.frequency.linearRampToValueAtTime(550, now + 0.35);

        // Lowpass filter for rubbery feel
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.42);
    }

    // Gem / Coin Collect (pleasant high duo-tone)
    playGem() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const tones = [880, 1318.5]; // A5, E6
        tones.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);

            gain.gain.setValueAtTime(0.3, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.22);
        });
    }

    // Gold Star Collect (triumphant triple chime)
    playStar() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const notes = [587.33, 739.99, 1046.5]; // D5, F#5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);

            gain.gain.setValueAtTime(0.4, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.35);
        });
    }

    // Key Collect
    playKey() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const notes = [784, 987.77, 1174.66, 1567.98]; // G5, B5, D6, G6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);

            gain.gain.setValueAtTime(0.35, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.28);
        });
    }

    // Gate Unlocked
    playDoorOpen() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.3);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.38);
    }

    // Teleportation Warp
    playTeleport() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Obstacle Hit / Ball Pop / Death
    playHit() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        // White noise burst
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.22);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);

        // Sub bass drop
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sawtooth';
        sub.frequency.setValueAtTime(140, now);
        sub.frequency.exponentialRampToValueAtTime(25, now + 0.25);
        subGain.gain.setValueAtTime(0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(now);
        sub.stop(now + 0.27);
    }

    // Level Win Fanfare
    playWin() {
        if (!this.soundEnabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const melody = [
            { f: 523.25, d: 0.12, t: 0 },    // C5
            { f: 659.25, d: 0.12, t: 0.12 }, // E5
            { f: 783.99, d: 0.12, t: 0.24 }, // G5
            { f: 1046.50, d: 0.4, t: 0.36 }, // C6
            { f: 880.00, d: 0.15, t: 0.78 }, // A5
            { f: 1046.50, d: 0.6, t: 0.95 }  // C6
        ];

        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, now + note.t);

            gain.gain.setValueAtTime(0.4, now + note.t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + note.t);
            osc.stop(now + note.t + note.d + 0.05);
        });
    }

    // --- PROCEDURAL AMBIENT SYNTH MUSIC ---
    startBgm() {
        if (!this.musicEnabled || this.bgmPlaying || !this.ctx) return;
        this.resume();
        this.bgmPlaying = true;
        this.step = 0;

        const bpm = 115;
        const beatDuration = 60 / bpm;
        const sixteenth = beatDuration / 4;

        // Pentatonic Neon scale progression
        const bassLine = [130.81, 130.81, 146.83, 164.81, 130.81, 110.00, 123.47, 130.81]; // C3, D3, E3, A2, B2...
        const arpScale = [261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63];

        const tick = () => {
            if (!this.bgmPlaying || !this.musicEnabled) return;
            const now = this.ctx.currentTime;

            // Bass note every quarter note (every 4 sixteenths)
            if (this.step % 4 === 0) {
                const bassIdx = Math.floor(this.step / 4) % bassLine.length;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(bassLine[bassIdx] / 2, now);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(320, now);
                filter.frequency.exponentialRampToValueAtTime(120, now + 0.3);

                gain.gain.setValueAtTime(0.22, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.musicGain);

                osc.start(now);
                osc.stop(now + 0.38);
            }

            // Arp note every sixteenth
            if (Math.random() > 0.15) {
                const noteIdx = (this.step + Math.floor(this.step / 8)) % arpScale.length;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(arpScale[noteIdx], now);

                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + sixteenth * 1.5);

                osc.connect(gain);
                gain.connect(this.musicGain);

                osc.start(now);
                osc.stop(now + sixteenth * 1.6);
            }

            // Soft hi-hat click on off-beats
            if (this.step % 2 === 1) {
                const bufferSize = this.ctx.sampleRate * 0.03;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(7000, now);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.musicGain);

                noise.start(now);
            }

            this.step++;
            this.bgmTimer = setTimeout(tick, sixteenth * 1000);
        };

        tick();
    }

    stopBgm() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            if (!this.bgmPlaying) this.startBgm();
        } else {
            this.stopBgm();
        }
        return this.musicEnabled;
    }
}

// Global sound instance
window.sound = new SoundEngine();
