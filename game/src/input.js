// Keyboard and pointer input. The game is played with mouse and keyboard together:
// a click on either picture tests that spot, arrow keys move a crosshair, Enter or
// Space selects under the crosshair, Tab switches the picture the crosshair is on.
// One-shot presses (confirm, pause, hint, restart, mute, switch, next, previous,
// level jump) are queued as bit flags and taken once by the loop, so a press between
// two frames is never lost and never counted twice.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;
export const ACTION_NEXT = 32;
export const ACTION_PREV = 64;
export const ACTION_SWITCH = 128;

const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const RESTART = new Set(['KeyR']);
const MUTE = new Set(['KeyM']);
const NEXT = new Set(['KeyN']);
const PREV = new Set(['KeyB']);
const LEVELS = new Set(['Digit1', 'Digit2', 'Digit3', 'Digit4']);

export function createInput(canvasLeft, canvasRight) {
  let left = false;
  let right = false;
  let up = false;
  let down = false;
  let actions = 0;
  let levelJump = 0;
  const clicks = [];
  // The latest hover point on each picture (side 0 = left, 1 = right), or null.
  const hover = [null, null];

  function canvasPoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  }

  window.addEventListener('keydown', (event) => {
    if (LEFT.has(event.code)) left = true;
    else if (RIGHT.has(event.code)) right = true;
    else if (UP.has(event.code)) up = true;
    else if (DOWN.has(event.code)) down = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (HINT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_HINT;
    } else if (RESTART.has(event.code)) {
      if (!event.repeat) actions |= ACTION_RESTART;
    } else if (MUTE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MUTE;
    } else if (NEXT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_NEXT;
    } else if (PREV.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PREV;
    } else if (LEVELS.has(event.code)) {
      if (!event.repeat) levelJump = Number(event.code.slice(-1));
    } else if (event.code === 'Tab') {
      if (!event.repeat) actions |= ACTION_SWITCH;
      event.preventDefault();
      return;
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (LEFT.has(event.code)) left = false;
    else if (RIGHT.has(event.code)) right = false;
    else if (UP.has(event.code)) up = false;
    else if (DOWN.has(event.code)) down = false;
  });
  // A key released while the tab is hidden never sends keyup: let go on blur.
  window.addEventListener('blur', () => {
    left = false;
    right = false;
    up = false;
    down = false;
  });

  function bind(canvas, side) {
    canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      clicks.push({ side, ...canvasPoint(canvas, event) });
    });
    canvas.addEventListener('pointermove', (event) => {
      hover[side] = canvasPoint(canvas, event);
    });
    canvas.addEventListener('pointerleave', () => {
      hover[side] = null;
    });
  }
  bind(canvasLeft, 0);
  bind(canvasRight, 1);

  return {
    /** -1/0/1 for each axis from the held arrow keys. */
    direction() {
      return {
        x: (right ? 1 : 0) - (left ? 1 : 0),
        y: (down ? 1 : 0) - (up ? 1 : 0),
      };
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The level number (1-4) a digit key asked for since the last call, else 0. */
    takeLevelJump() {
      const taken = levelJump;
      levelJump = 0;
      return taken;
    },
    /** Pointer clicks since the last call (each {side, x, y} in picture space). */
    takeClicks() {
      const taken = clicks.slice();
      clicks.length = 0;
      return taken;
    },
    /** The latest hover point on a picture, or null when the pointer is elsewhere. */
    hoverAt(side) {
      return hover[side];
    },
  };
}
