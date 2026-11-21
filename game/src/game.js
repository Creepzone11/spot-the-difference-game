// The game's rules and state, with no drawing and no browser in it: the scenes, the
// differences found, the timer, the score, the streak, the hints, the stars. step()
// advances one fixed step and returns what happened as bit flags, so the caller can
// react without the world knowing about screens or sound. Nothing here allocates
// after createGame returns.

import { BEST_KEY, HINTS_PER_SCENE, HIT_RADIUS, PAR_SECONDS, POINTS_FOUND, POINTS_STREAK, POINTS_TIME_BONUS, WRONG_COST_SECONDS } from './config.js';
import { SCENES as SCENE_LIST } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_WIN = 'win';
export const SCREEN_FAIL = 'fail';

export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_CLEAR = 4;
export const EVENT_WIN = 8;
export const EVENT_FAIL = 16;
export const EVENT_HINT = 32;

function starsFor(sceneIndex, timeLeft, hintsUsed, wrong) {
  const par = PAR_SECONDS[sceneIndex];
  if (timeLeft >= par * 0.5 && hintsUsed === 0 && wrong === 0) return 3;
  if (timeLeft >= par * 0.25 || hintsUsed <= 1) return 2;
  return 1;
}

export function createGame() {
  const state = {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    found: new Set(),
    hinted: new Set(),
    hintsLeft: HINTS_PER_SCENE,
    hintsUsed: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    score: 0,
    totalScore: 0,
    timeLeft: PAR_SECONDS[0],
    elapsed: 0,
    stars: [0, 0, 0, 0],
    cleared: [false, false, false, false],
    // The crosshair for keyboard play: which picture (0/1) and where in it.
    crosshair: { side: 0, x: 300, y: 210, visible: false },
    // The latest wrong click, for the red X flash: {x, y, side, until}.
    wrongMark: null,
    // The latest hint pulse: {differenceId, until}.
    hintMark: null,
    // The difference a hint just revealed (its ring pulses until it is found).
    message: '',
  };

  function scene() {
    return SCENE_LIST[state.sceneIndex];
  }

  function resetScene(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.hinted = new Set();
    state.hintsLeft = HINTS_PER_SCENE;
    state.hintsUsed = 0;
    state.wrong = 0;
    state.streak = 0;
    state.score = 0;
    state.timeLeft = PAR_SECONDS[index];
    state.elapsed = 0;
    state.wrongMark = null;
    state.hintMark = null;
    state.crosshair = { side: 0, x: 300, y: 210, visible: false };
    state.message = '';
  }

  function startScene(index) {
    resetScene(index);
    state.screen = SCREEN_PLAY;
  }

  function nextScene() {
    const next = state.sceneIndex + 1;
    if (next >= SCENE_LIST.length) {
      state.screen = SCREEN_WIN;
      return EVENT_WIN;
    }
    startScene(next);
    return 0;
  }

  /** The difference at a point in a picture, or null. Checks every hit zone. */
  function differenceAt(x, y) {
    const list = scene().differences;
    for (let i = 0; i < list.length; i += 1) {
      const diff = list[i];
      if (state.found.has(diff.id)) continue;
      const zones = diff.zones ?? [[diff.x, diff.y]];
      for (let z = 0; z < zones.length; z += 1) {
        const dx = x - zones[z][0];
        const dy = y - zones[z][1];
        if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) return diff;
      }
    }
    return null;
  }

  /** Test a click at a point in a picture. Returns event flags. */
  function clickAt(x, y, side) {
    if (state.screen !== SCREEN_PLAY) return 0;
    const diff = differenceAt(x, y);
    if (diff !== null) {
      state.found.add(diff.id);
      state.streak += 1;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      const gained = POINTS_FOUND + (state.streak - 1) * POINTS_STREAK;
      state.score += gained;
      state.totalScore += gained;
      state.message = `Found: ${diff.name} (+${gained})`;
      if (state.found.size >= scene().differences.length) {
        const timeBonus = Math.round(state.timeLeft) * POINTS_TIME_BONUS;
        state.score += timeBonus;
        state.totalScore += timeBonus;
        const stars = starsFor(state.sceneIndex, state.timeLeft, state.hintsUsed, state.wrong);
        state.stars[state.sceneIndex] = stars;
        state.cleared[state.sceneIndex] = true;
        state.screen = SCREEN_CLEAR;
        state.message = `Scene clear! +${timeBonus} time bonus`;
        return EVENT_FOUND | EVENT_CLEAR;
      }
      return EVENT_FOUND;
    }
    state.wrong += 1;
    state.streak = 0;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_COST_SECONDS);
    state.wrongMark = { x, y, side, until: state.elapsed + 0.6 };
    state.message = `Not a difference (−${WRONG_COST_SECONDS}s)`;
    return EVENT_WRONG;
  }

  /** Spend a hint: pulse the first unfound difference that has no ring yet. */
  function useHint() {
    if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return 0;
    const list = scene().differences;
    for (let i = 0; i < list.length; i += 1) {
      const diff = list[i];
      if (!state.found.has(diff.id) && !state.hinted.has(diff.id)) {
        state.hintsLeft -= 1;
        state.hintsUsed += 1;
        state.hinted.add(diff.id);
        state.hintMark = { differenceId: diff.id, until: state.elapsed + 2.5 };
        state.message = `Hint: look near “${diff.name}”`;
        return EVENT_HINT;
      }
    }
    return 0;
  }

  /** Advance the timer by dt seconds. Returns event flags (fail when time runs out). */
  function step(dt) {
    if (state.screen !== SCREEN_PLAY) return 0;
    state.elapsed += dt;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_FAIL;
      state.message = 'Time up — try the scene again';
      return EVENT_FAIL;
    }
    return 0;
  }

  return {
    state,
    scene,
    startScene,
    resetScene,
    nextScene,
    clickAt,
    useHint,
    step,
    differenceCount() {
      return scene().differences.length;
    },
    foundCount() {
      return state.found.size;
    },
    remainingCount() {
      return scene().differences.length - state.found.size;
    },
    totalStars() {
      return state.stars.reduce((sum, s) => sum + s, 0);
    },
    totalDifferences() {
      return SCENE_LIST.reduce((sum, s) => sum + s.differences.length, 0);
    },
    sceneCount() {
      return SCENE_LIST.length;
    },
    sceneName(index) {
      return SCENE_LIST[index].name;
    },
    bestScore() {
      try {
        return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
      } catch {
        return 0;
      }
    },
    saveBest() {
      try {
        const best = this.bestScore();
        if (state.totalScore > best) window.localStorage.setItem(BEST_KEY, String(state.totalScore));
      } catch {
        // Storage can be off: the best score then lasts this visit only.
      }
    },
  };
}
