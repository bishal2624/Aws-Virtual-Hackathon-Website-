// Pure Web Audio API procedural wind synthesizer
// Zero external audio files or downloads. Complies strictly with Section 12.

class AmbientSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.noiseNode = null;
    this.filterNode = null;
    this.gainNode = null;
    this.lfoNode = null;
    this.lfoGain = null;
    this.isPlaying = false;
    this.userWantedAudio = false;

    // Handle visibility changes: pause when tab hidden, resume when visible if user had enabled it
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.isPlaying) {
            this.suspend();
          }
        } else {
          if (this.userWantedAudio && this.audioCtx && this.audioCtx.state === 'suspended') {
            this.resume();
          }
        }
      });
    }
  }

  init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.audioCtx = new AudioContextClass();

    // Generate 5 seconds of pink/brownian-filtered white noise buffer
    const bufferSize = this.audioCtx.sampleRate * 5;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    this.noiseBuffer = noiseBuffer;
  }

  start() {
    this.init();
    if (!this.audioCtx) return false;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // Master gain
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
    // Smooth fade in over 2.5 seconds
    this.gainNode.gain.exponentialRampToValueAtTime(0.2, this.audioCtx.currentTime + 2.5);
    this.gainNode.connect(this.audioCtx.destination);

    // Resonant bandpass filter to shape wind tone
    this.filterNode = this.audioCtx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(260, this.audioCtx.currentTime);
    this.filterNode.Q.setValueAtTime(2.5, this.audioCtx.currentTime);
    this.filterNode.connect(this.gainNode);

    // LFO for slow wind gusts (modulates filter frequency between 180Hz and 420Hz)
    this.lfoNode = this.audioCtx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.setValueAtTime(0.12, this.audioCtx.currentTime); // ~8 second gust cycle

    this.lfoGain = this.audioCtx.createGain();
    this.lfoGain.gain.setValueAtTime(140, this.audioCtx.currentTime);

    this.lfoNode.connect(this.lfoGain);
    this.lfoGain.connect(this.filterNode.frequency);
    this.lfoNode.start();

    // Looping noise source
    this.noiseNode = this.audioCtx.createBufferSource();
    this.noiseNode.buffer = this.noiseBuffer;
    this.noiseNode.loop = true;
    this.noiseNode.connect(this.filterNode);
    this.noiseNode.start();

    this.isPlaying = true;
    this.userWantedAudio = true;
    return true;
  }

  stop() {
    if (!this.audioCtx || !this.isPlaying) return;

    const now = this.audioCtx.currentTime;
    // Smooth ramp down
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    setTimeout(() => {
      if (this.noiseNode) {
        try { this.noiseNode.stop(); } catch (e) {}
        this.noiseNode.disconnect();
      }
      if (this.lfoNode) {
        try { this.lfoNode.stop(); } catch (e) {}
        this.lfoNode.disconnect();
      }
      this.isPlaying = false;
      this.userWantedAudio = false;
    }, 1250);
  }

  suspend() {
    if (this.audioCtx && this.isPlaying) {
      this.audioCtx.suspend();
    }
  }

  resume() {
    if (this.audioCtx && this.userWantedAudio) {
      this.audioCtx.resume();
    }
  }
}

export const ambientSound = new AmbientSoundEngine();
