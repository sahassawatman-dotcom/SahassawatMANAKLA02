// Web Audio API Synthesizer for Run Events and Countdown

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Play pleasant tone
 */
function playTone(freq: number, type: OscillatorType, duration: number, delay = 0, gainLevel = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const startTime = ctx.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export const soundEffects = {
  playStart: () => {
    // 3 ascending tones
    playTone(523.25, 'sine', 0.12, 0, 0.2); // C5
    playTone(659.25, 'sine', 0.12, 0.12, 0.2); // E5
    playTone(783.99, 'sine', 0.25, 0.24, 0.25); // G5
  },

  playPause: () => {
    // 2 descending tones
    playTone(659.25, 'sine', 0.15, 0, 0.18);
    playTone(440.0, 'sine', 0.2, 0.12, 0.18);
  },

  playResume: () => {
    playTone(440.0, 'sine', 0.12, 0, 0.18);
    playTone(659.25, 'sine', 0.2, 0.12, 0.18);
  },

  playMilestone: () => {
    // 10 or 20 min milestone
    playTone(587.33, 'triangle', 0.15, 0, 0.2);
    playTone(880.0, 'triangle', 0.3, 0.15, 0.25);
  },

  playFinish: () => {
    // Fanfare celebratory chime
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      playTone(freq, 'sine', 0.25 + idx * 0.08, idx * 0.14, 0.25);
    });
  },

  playBeep: () => {
    playTone(880, 'sine', 0.08, 0, 0.12);
  }
};
