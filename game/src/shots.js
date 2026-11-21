// The screenshot scenes behind ?shot=cover|play|found|win. Each one sets the real
// game state to a fixed, deterministic frame — the same seed always gives the same
// frame — so the screenshots are what a real game really looks like at that moment,
// never a mock-up. The cover shows two pictures side by side with some differences
// found (rings on both pictures), several still unfound, and the counter reading
// how many remain.

import { SCREEN_CLEAR, SCREEN_PLAY } from './game.js';

/** The found difference ids, in scene order, that a shot stages. */
const FOUND = {
  cover: ['sun-rays', 'coffee-cup', 'cat'],
  play: ['apple'],
  found: ['star', 'bow', 'carriage', 'block', 'mane', 'lamp'],
  win: null,
};

/**
 * Set the game to the named scene and return the screen to draw. The shots use the
 * real rules: found ids are marked through the game's own set, the timer and score
 * are the values a player would have at that point.
 */
export function stageShot(name, game) {
  const state = game.state;
  if (name === 'play') {
    game.startScene(1);
    for (const id of FOUND.play) state.found.add(id);
    state.score = 100;
    state.totalScore = 100;
    state.streak = 1;
    state.timeLeft = 118;
    state.elapsed = 32;
    state.message = 'Found: Apple on the tree (+100)';
    return { screen: SCREEN_PLAY };
  }
  if (name === 'found') {
    game.startScene(2);
    for (const id of FOUND.found) state.found.add(id);
    state.score = 660;
    state.totalScore = 660;
    state.streak = 6;
    state.bestStreak = 6;
    state.timeLeft = 74;
    state.elapsed = 106;
    state.message = 'Found: Lamp light (+150)';
    return { screen: SCREEN_PLAY };
  }
  if (name === 'win') {
    game.startScene(3);
    for (const diff of game.scene().differences) state.found.add(diff.id);
    state.score = 940;
    state.totalScore = 2680;
    state.streak = 8;
    state.bestStreak = 8;
    state.timeLeft = 61;
    state.stars[3] = 3;
    state.cleared[3] = true;
    state.screen = SCREEN_CLEAR;
    state.message = 'Scene clear! +122 time bonus';
    return { screen: SCREEN_CLEAR };
  }
  // cover (and any other name): scene 1, three found, four to find.
  game.startScene(0);
  for (const id of FOUND.cover) state.found.add(id);
  state.score = 320;
  state.totalScore = 320;
  state.streak = 2;
  state.bestStreak = 3;
  state.timeLeft = 72;
  state.elapsed = 78;
  state.message = 'Found: Sleeping cat (+110)';
  return { screen: SCREEN_PLAY };
}
