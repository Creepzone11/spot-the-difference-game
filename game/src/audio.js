// Sounds, made with Web Audio and nothing else: no audio files are fetched, so the
// game plays with zero network requests. The context is created on the first user
// gesture (browsers refuse sound before one); every call after that is a no-op when
// muted or before the context exists.

function tone(context, frequency, startAt, duration, type, volume) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.05);
}

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function notes(list, type, volume) {
    if (muted) return;
    const ctx = ensure();
    if (ctx === null) return;
    const now = ctx.currentTime;
    list.forEach(([frequency, delay, duration]) => {
      tone(ctx, frequency, now + delay, duration, type, volume);
    });
  }

  return {
    /** Call on any pointer or key gesture so later sounds are allowed. */
    unlock() {
      ensure();
    },
    get muted() {
      return muted;
    },
    toggleMuted() {
      muted = !muted;
      return muted;
    },
    /** A soft tick for a button press. */
    click() {
      notes([[660, 0, 0.06]], 'sine', 0.08);
    },
    /** Two rising notes when a difference is found. */
    found() {
      notes([[659.25, 0, 0.14], [880, 0.09, 0.22]], 'sine', 0.16);
    },
    /** A low buzz when a click lands on nothing. */
    wrong() {
      notes([[110, 0, 0.16], [104, 0.02, 0.16]], 'sawtooth', 0.07);
    },
    /** A soft blip when a hint is spent. */
    hint() {
      notes([[523.25, 0, 0.1], [783.99, 0.07, 0.14]], 'triangle', 0.12);
    },
    /** A short arpeggio when a scene is cleared. */
    clear() {
      notes(
        [
          [523.25, 0, 0.16],
          [659.25, 0.12, 0.16],
          [783.99, 0.24, 0.16],
          [1046.5, 0.36, 0.34],
        ],
        'triangle',
        0.15,
      );
    },
    /** A longer fanfare when the whole game is won. */
    win() {
      notes(
        [
          [523.25, 0, 0.18],
          [659.25, 0.14, 0.18],
          [783.99, 0.28, 0.18],
          [1046.5, 0.42, 0.22],
          [783.99, 0.6, 0.18],
          [1046.5, 0.74, 0.4],
        ],
        'triangle',
        0.15,
      );
    },
  };
}
