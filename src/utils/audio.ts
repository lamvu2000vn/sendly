/**
 * Procedural Audio Utility using Web Audio API
 * Avoids the need for external asset files and provides clean, futuristic notification sounds.
 */

class AudioService {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    private init() {
        if (!this.ctx) {
            this.ctx = new (
                window.AudioContext || (window as any).webkitAudioContext
            )();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0.2; // Keep volume low and pleasant
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    private createOscillator(
        freq: number,
        type: OscillatorType = 'sine',
        duration: number = 0.1,
    ) {
        if (!this.ctx || !this.masterGain) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            this.ctx.currentTime + duration,
        );

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    public playSuccess() {
        try {
            this.init();
            // Upward arpeggio for success
            this.createOscillator(523.25, 'sine', 0.5); // C5
            setTimeout(() => this.createOscillator(659.25, 'sine', 0.5), 50); // E5
            setTimeout(() => this.createOscillator(783.99, 'sine', 0.5), 100); // G5
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }

    public playError() {
        try {
            this.init();
            // Low, dissonant drop for error
            this.createOscillator(150, 'triangle', 0.4);
            setTimeout(() => this.createOscillator(110, 'triangle', 0.4), 100);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }

    public playPop() {
        try {
            this.init();
            // Soft pop for subtle feedback
            this.createOscillator(880, 'sine', 0.1);
        } catch (e) {
            // Silently ignore audio errors on user interaction
        }
    }
}

export const audioService = new AudioService();
