// Boot and the one loop. The game moves between six screens: title, play, paused,
// scene clear, game won and time up. Input is read every frame; the world advances
// in fixed 1/60 s steps. The renderer paints what is there.
//
// ?seed=N is accepted for determinism (the scenes are fixed art, so the seed only
// seeds nothing yet — it is kept for the harness's convention). ?shot=cover|play|
// found|win stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.

import { BEST_KEY, PICTURE } from './config.js';
import { createAudio } from './audio.js';
import { createGame, EVENT_CLEAR, EVENT_FAIL, EVENT_FOUND, EVENT_HINT, EVENT_WIN, EVENT_WRONG, SCREEN_CLEAR, SCREEN_FAIL, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './game.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_NEXT, ACTION_PAUSE, ACTION_PREV, ACTION_RESTART, ACTION_SWITCH, createInput } from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
const CROSSHAIR_SPEED = 340;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvasLeft = document.getElementById('picLeft');
const canvasRight = document.getElementById('picRight');
const dom = {
  sceneLabel: document.getElementById('sceneLabel'),
  counter: document.getElementById('counter'),
  timerBar: document.getElementById('timerBar'),
  timerText: document.getElementById('timerText'),
  score: document.getElementById('score'),
  streak: document.getElementById('streak'),
  hintBtn: document.getElementById('hintBtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  soundBtn: document.getElementById('soundBtn'),
  foundList: document.getElementById('foundList'),
  levelDots: document.getElementById('levelDots'),
  message: document.getElementById('message'),
  overlay: document.getElementById('overlay'),
};

const game = createGame();
const audio = createAudio();
const renderer = createRenderer(canvasLeft, canvasRight, dom);
const input = createInput(canvasLeft, canvasRight);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function runShot(name) {
  const scene = stageShot(name, game);
  let painted = 0;
  function paint() {
    renderer.draw(game.state, game, null, null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function startScene(index) {
    game.startScene(index);
    audio.click();
  }

  function handleOverlayClick(event) {
    const button = event.target.closest('[data-action], [data-scene]');
    if (!button) return;
    const action = button.dataset.action;
    const sceneIndex = button.dataset.scene === undefined ? -1 : Number(button.dataset.scene);
    audio.unlock();
    if (action === 'start' || action === 'again') {
      game.state.totalScore = 0;
      game.state.stars = [0, 0, 0, 0];
      game.state.cleared = [false, false, false, false];
      game.state.bestStreak = 0;
      startScene(0);
    } else if (action === 'scene' && sceneIndex >= 0) {
      startScene(sceneIndex);
    } else if (action === 'resume') {
      game.state.screen = SCREEN_PLAY;
      audio.click();
    } else if (action === 'restart') {
      startScene(game.state.sceneIndex);
    } else if (action === 'replay') {
      startScene(game.state.sceneIndex);
    } else if (action === 'next') {
      const events = game.nextScene();
      if (events & EVENT_WIN) {
        game.saveBest();
        best = readBest();
        audio.win();
      } else {
        audio.click();
      }
    } else if (action === 'title') {
      game.state.screen = SCREEN_TITLE;
      audio.click();
    } else if (sceneIndex >= 0) {
      startScene(sceneIndex);
    }
  }
  dom.overlay.addEventListener('click', handleOverlayClick);
  dom.levelDots.addEventListener('click', handleOverlayClick);
  dom.hintBtn.addEventListener('click', () => {
    audio.unlock();
    const events = game.useHint();
    if (events & EVENT_HINT) audio.hint();
  });
  dom.pauseBtn.addEventListener('click', () => {
    audio.unlock();
    if (game.state.screen === SCREEN_PLAY) game.state.screen = SCREEN_PAUSED;
    else if (game.state.screen === SCREEN_PAUSED) game.state.screen = SCREEN_PLAY;
    audio.click();
  });
  dom.soundBtn.addEventListener('click', () => {
    const muted = audio.toggleMuted();
    dom.soundBtn.textContent = muted ? 'Sound off' : 'Sound on';
    if (!muted) audio.click();
  });

  function handleEvents(events) {
    if (events & EVENT_FOUND) audio.found();
    if (events & EVENT_WRONG) audio.wrong();
    if (events & EVENT_HINT) audio.hint();
    if (events & EVENT_CLEAR) audio.clear();
    if (events & EVENT_WIN) {
      game.saveBest();
      best = readBest();
      audio.win();
    }
    if (events & EVENT_FAIL) audio.wrong();
  }

  function handleActions() {
    const actions = input.takeActions();
    const jump = input.takeLevelJump();
    const state = game.state;
    if (jump >= 1 && jump <= game.sceneCount() && (state.screen === SCREEN_TITLE || state.screen === SCREEN_PLAY)) {
      startScene(jump - 1);
      return;
    }
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMuted();
      dom.soundBtn.textContent = muted ? 'Sound off' : 'Sound on';
      if (!muted) audio.click();
    }
    if (actions & ACTION_SWITCH && state.screen === SCREEN_PLAY) {
      state.crosshair.side = 1 - state.crosshair.side;
      state.crosshair.visible = true;
      audio.click();
    }
    if (actions & ACTION_HINT && state.screen === SCREEN_PLAY) {
      const events = game.useHint();
      if (events & EVENT_HINT) audio.hint();
    }
    if (actions & ACTION_RESTART && (state.screen === SCREEN_PLAY || state.screen === SCREEN_FAIL || state.screen === SCREEN_CLEAR)) {
      startScene(state.sceneIndex);
      return;
    }
    if (actions & ACTION_NEXT && state.screen === SCREEN_CLEAR) {
      const events = game.nextScene();
      handleEvents(events);
      return;
    }
    if (actions & ACTION_PREV && state.screen === SCREEN_PLAY) {
      const prev = state.sceneIndex - 1;
      if (prev >= 0) startScene(prev);
      return;
    }
    if (actions & ACTION_CONFIRM) {
      audio.unlock();
      if (state.screen === SCREEN_TITLE) startScene(0);
      else if (state.screen === SCREEN_CLEAR) {
        const events = game.nextScene();
        handleEvents(events);
      } else if (state.screen === SCREEN_WIN || state.screen === SCREEN_FAIL) {
        game.state.totalScore = 0;
        game.state.stars = [0, 0, 0, 0];
        game.state.cleared = [false, false, false, false];
        game.state.bestStreak = 0;
        startScene(0);
      } else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
      } else if (state.screen === SCREEN_PLAY && state.crosshair.visible) {
        const events = game.clickAt(state.crosshair.x, state.crosshair.y, state.crosshair.side);
        handleEvents(events);
      }
    }
    if (actions & ACTION_PAUSE) {
      if (state.screen === SCREEN_PLAY) state.screen = SCREEN_PAUSED;
      else if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
    }
  }

  function handleClicks() {
    const state = game.state;
    if (state.screen !== SCREEN_PLAY) return;
    for (const click of input.takeClicks()) {
      audio.unlock();
      const events = game.clickAt(click.x, click.y, click.side);
      handleEvents(events);
    }
  }

  function moveCrosshair(dt) {
    const state = game.state;
    const dir = input.direction();
    if (dir.x === 0 && dir.y === 0) return;
    state.crosshair.visible = true;
    state.crosshair.x = Math.max(0, Math.min(PICTURE.width, state.crosshair.x + dir.x * CROSSHAIR_SPEED * dt));
    state.crosshair.y = Math.max(0, Math.min(PICTURE.height, state.crosshair.y + dir.y * CROSSHAIR_SPEED * dt));
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    handleActions();
    handleClicks();
    const state = game.state;
    if (state.screen === SCREEN_PLAY) {
      moveCrosshair(dt);
      accumulator += dt;
      while (accumulator >= STEP) {
        const events = game.step(STEP);
        handleEvents(events);
        accumulator -= STEP;
        if (state.screen !== SCREEN_PLAY) break;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(state, game, input.hoverAt(0), input.hoverAt(1));
  }

  // Leaving the tab pauses a running game rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state.screen === SCREEN_PLAY) game.state.screen = SCREEN_PAUSED;
  });

  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
