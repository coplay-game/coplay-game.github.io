// Web Audio synthesizer for kid-friendly sound effects without external audio files
// Designed with soft harmonic curves to avoid harshness and safe volume limits

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let soundEnabled = true;
let soundVolume = 0.6; // Range: 0.0 to 1.0 (default 0.6)
let isAudioUnlocked = false;

/**
 * Crucial for iOS / Safari:
 * iOS disables Web Audio playback until unlocked inside a direct user touch/click gesture.
 * Playing a 1-sample silent buffer synchronously wakes up the iOS audio engine for the entire session.
 */
export function unlockAudioOnUserGesture(): void {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch {
        return;
      }
    }
  }

  if (audioCtx) {
    if (!masterGain) {
      masterGain = audioCtx.createGain();
      applyMasterGain();
      masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    if (!isAudioUnlocked) {
      try {
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(masterGain);
        source.start(0);
        isAudioUnlocked = true;
      } catch {
        // ignore
      }
    }
  }
}

// Automatically register once on initial window load to unlock on the very first touch/click
if (typeof window !== 'undefined') {
  const unlockEvents = ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'];
  const handleInteraction = () => {
    unlockAudioOnUserGesture();
    if (isAudioUnlocked && audioCtx && audioCtx.state === 'running') {
      unlockEvents.forEach((evt) =>
        window.removeEventListener(evt, handleInteraction)
      );
    }
  };
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleInteraction, { capture: true, passive: true });
  });
}

export function getSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (enabled) {
    unlockAudioOnUserGesture();
  }
  applyMasterGain();
}

export function getSoundVolume(): number {
  return soundVolume;
}

export function setSoundVolume(vol: number): void {
  soundVolume = Math.max(0, Math.min(1, vol));
  applyMasterGain();
}

function applyMasterGain(): void {
  if (masterGain && audioCtx) {
    // Keep max output gentle (around 0.45 at 100% slider) so sounds are never abrasive for children's ears
    const effectiveGain = soundEnabled ? soundVolume * 0.45 : 0;
    masterGain.gain.setValueAtTime(effectiveGain, audioCtx.currentTime);
  }
}

function getAudioContext(): { ctx: AudioContext; destination: GainNode } | null {
  if (!soundEnabled || soundVolume <= 0) return null;

  if (!audioCtx || !masterGain) {
    unlockAudioOnUserGesture();
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  if (!audioCtx || !masterGain || !soundEnabled || soundVolume <= 0) {
    return null;
  }

  return { ctx: audioCtx, destination: masterGain };
}

/**
 * 1. Bấm đúng icon:
 * Crisp, pleasant chime chord (cheerful high marimba/bell notes)
 */
export function playCorrectIconSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  // Cheerful pentatonic chime: G5, C6, E6
  const notes = [
    { freq: 783.99, time: 0, dur: 0.15 },
    { freq: 1046.5, time: 0.05, dur: 0.2 },
    { freq: 1318.51, time: 0.1, dur: 0.35 },
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.3, now + time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * 2. Bấm sai icon:
 * Gentle cartoon "boing/bonk" (soft sine wobble, not harsh or scary for children)
 */
export function playWrongIconSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Mild downward pitch glide
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

/**
 * 2b. Âm thanh phạt (khi bị khóa nửa màn hình):
 * Soft two-tone alert ("uh-oh" tone)
 */
export function playPenaltyLockSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  const notes = [
    { freq: 280, time: 0, dur: 0.12 },
    { freq: 210, time: 0.12, dur: 0.2 },
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0.18, now + time);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * 2c. Âm thanh đếm từng giây khi bị phạt:
 * Soft wooden clock tick
 */
export function playPenaltyTickSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(620, now);
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * 2d. Âm thanh mở khóa khi hết thời gian phạt:
 * Upward cheerful double chime blip
 */
export function playPenaltyUnlockSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  const notes = [
    { freq: 587.33, time: 0, dur: 0.09 },     // D5
    { freq: 880.0, time: 0.08, dur: 0.16 },   // A5
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0.18, now + time);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * 3. Khi có người thắng một vòng:
 * Joyful round victory fanfare arpeggio (+1 point celebration)
 */
export function playRoundWonSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  // C5, E5, G5, C6 arpeggio with celebratory sparkle
  const notes = [
    { freq: 523.25, time: 0, dur: 0.12 },
    { freq: 659.25, time: 0.09, dur: 0.12 },
    { freq: 783.99, time: 0.18, dur: 0.14 },
    { freq: 1046.5, time: 0.27, dur: 0.38 },
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.24, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * 4. Khi vòng chơi kết thúc & chuyển sang vòng mới:
 * Soft melodic swoosh/transition chime
 */
export function playRoundCompleteTransitionSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  const notes = [
    { freq: 440, time: 0, dur: 0.1 },
    { freq: 554.37, time: 0.07, dur: 0.1 },
    { freq: 659.25, time: 0.14, dur: 0.22 },
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.18, now + time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * 5. Thắng chung cuộc:
 * Grand triumphant festive fanfare with cheerful melody & sparkling high chime
 */
export function playGrandVictoryFanfare(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  // Grand celebratory melody: C5 -> E5 -> G5 -> C6 -> E6 -> G5 -> C6 (hold)
  const notes = [
    { freq: 523.25, time: 0, dur: 0.16 },
    { freq: 659.25, time: 0.14, dur: 0.16 },
    { freq: 783.99, time: 0.28, dur: 0.18 },
    { freq: 1046.5, time: 0.44, dur: 0.38 },
    { freq: 1318.51, time: 0.64, dur: 0.22 },
    { freq: 1046.5, time: 0.86, dur: 0.18 },
    { freq: 1318.51, time: 1.04, dur: 0.2 },
    { freq: 1567.98, time: 1.22, dur: 0.75 }, // High G6 grand triumph
  ];

  notes.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.26, now + time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  });
}

/**
 * Đếm ngược 3-2-1
 */
export function playTickSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(now);
  osc.stop(now + 0.09);
}

/**
 * "SẴN SÀNG! / BẮT ĐẦU"
 */
export function playGoSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(587.33, now); // D5
  osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.32); // D6

  gain.gain.setValueAtTime(0.24, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(now);
  osc.stop(now + 0.38);
}

/**
 * Preview beep when adjusting volume slider
 */
export function playVolumePreviewSound(): void {
  const audio = getAudioContext();
  if (!audio) return;
  const { ctx, destination } = audio;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(659.25, now); // E5
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

// Backward compatibility alias
export const playSuccessSound = playRoundWonSound;
export const playErrorSound = playWrongIconSound;
export const playFanfareSound = playGrandVictoryFanfare;

// ============================================================
// Soft background music (very light, no continuous drone)
// Default OFF – only short gentle notes, spaced far apart
// ============================================================

let bgMusicNodes: { intervalId: number | null } | null = null;
let bgMusicEnabled = false; // default OFF – tránh ù ù khó chịu

export function getBgMusicEnabled(): boolean {
  return bgMusicEnabled;
}

export function setBgMusicEnabled(enabled: boolean): void {
  bgMusicEnabled = enabled;
  if (enabled && soundEnabled) {
    startBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
}

/**
 * Chỉ phát vài nốt ngắn, thưa thớt, không có pad ù ù.
 * Âm lượng cực thấp, không gây mỏi tai.
 */
export function startBackgroundMusic(): void {
  if (!bgMusicEnabled || !soundEnabled || soundVolume <= 0) return;
  if (bgMusicNodes) return;

  // Chỉ dùng arpeggio thưa, không sustained pad
  const softNotes = [523.25, 587.33, 659.25, 698.46]; // C5 D5 E5 F5 – pentatonic nhẹ
  let noteIndex = 0;

  const playSoftNote = () => {
    if (!bgMusicNodes || !soundEnabled || !bgMusicEnabled) return;
    const a = getAudioContext();
    if (!a) return;
    const { ctx, destination } = a;
    const now = ctx.currentTime;
    const freq = softNotes[noteIndex % softNotes.length];
    noteIndex++;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Rất nhẹ, fade in/out nhanh
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(now);
    osc.stop(now + 1.0);
  };

  // Mỗi 5–6 giây mới một nốt, rất thưa
  const intervalId = window.setInterval(playSoftNote, 5500);
  // Không phát ngay lập tức

  bgMusicNodes = { intervalId };
}

export function stopBackgroundMusic(): void {
  if (!bgMusicNodes) return;
  if (bgMusicNodes.intervalId) {
    clearInterval(bgMusicNodes.intervalId);
  }
  bgMusicNodes = null;
}

/** Call when sound settings change */
export function syncBackgroundMusic(): void {
  if (soundEnabled && bgMusicEnabled && soundVolume > 0) {
    startBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
}
