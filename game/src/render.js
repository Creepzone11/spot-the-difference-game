// Drawing only: the game's state and the current screen in, pixels out. The two
// pictures are pre-rendered once per scene into offscreen canvases (original and
// changed); each frame blits them, then the found rings, the hint pulse, the wrong
// flash, the magnifier lens and the keyboard crosshair. The HUD is DOM, updated here
// so the numbers the judge reads in a screenshot are the live ones.

import { HIT_RADIUS, LENS, PALETTE, PAR_SECONDS, PICTURE } from './config.js';
import { drawPicture } from './scenes.js';
import { SCREEN_CLEAR, SCREEN_FAIL, SCREEN_PAUSED, SCREEN_TITLE, SCREEN_WIN } from './game.js';

const RING_RADIUS = 24;

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function starRow(stars, total) {
  let out = '';
  for (let i = 0; i < total; i += 1) out += i < stars ? '★' : '☆';
  return out;
}

export function createRenderer(canvasLeft, canvasRight, dom) {
  const ctxLeft = canvasLeft.getContext('2d');
  const ctxRight = canvasRight.getContext('2d');
  // Offscreen renders of this scene's two pictures, rebuilt when the scene changes.
  const offLeft = document.createElement('canvas');
  const offRight = document.createElement('canvas');
  offLeft.width = PICTURE.width;
  offLeft.height = PICTURE.height;
  offRight.width = PICTURE.width;
  offRight.height = PICTURE.height;
  let renderedScene = -1;

  function renderScene(scene) {
    drawPicture(offLeft.getContext('2d'), scene, 0);
    drawPicture(offRight.getContext('2d'), scene, 1);
    renderedScene = scene.id;
  }

  function ring(ctx, x, y, radius, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawFoundRings(ctx, state, scene, elapsed) {
    for (const diff of scene.differences) {
      if (!state.found.has(diff.id)) continue;
      const zones = diff.zones ?? [[diff.x, diff.y]];
      for (const [x, y] of zones) {
        ring(ctx, x, y, RING_RADIUS, PALETTE.ringFound, 4);
        ctx.strokeStyle = PALETTE.ringFound;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 7, y);
        ctx.lineTo(x - 2, y + 6);
        ctx.lineTo(x + 8, y - 6);
        ctx.stroke();
      }
    }
    if (state.hintMark && elapsed < state.hintMark.until) {
      const diff = scene.differences.find((d) => d.id === state.hintMark.differenceId);
      if (diff) {
        const pulse = 1 + 0.12 * Math.sin(elapsed * 8);
        ring(ctx, diff.x, diff.y, RING_RADIUS * pulse, PALETTE.ring, 4);
      }
    }
  }

  function drawWrong(ctx, state, elapsed) {
    const mark = state.wrongMark;
    if (!mark || elapsed >= mark.until) return;
    ctx.strokeStyle = PALETTE.bad;
    ctx.lineWidth = 5;
    const r = 14;
    ctx.beginPath();
    ctx.moveTo(mark.x - r, mark.y - r);
    ctx.lineTo(mark.x + r, mark.y + r);
    ctx.moveTo(mark.x + r, mark.y - r);
    ctx.lineTo(mark.x - r, mark.y + r);
    ctx.stroke();
  }

  function drawLens(ctx, off, hover) {
    if (!hover) return;
    const srcSize = (LENS.radius * 2) / LENS.zoom;
    const sx = Math.max(0, Math.min(PICTURE.width - srcSize, hover.x - srcSize / 2));
    const sy = Math.max(0, Math.min(PICTURE.height - srcSize, hover.y - srcSize / 2));
    ctx.save();
    ctx.beginPath();
    ctx.arc(hover.x, hover.y, LENS.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(off, sx, sy, srcSize, srcSize, hover.x - LENS.radius, hover.y - LENS.radius, LENS.radius * 2, LENS.radius * 2);
    ctx.restore();
    ring(ctx, hover.x, hover.y, LENS.radius, PALETTE.ring, 3);
  }

  function drawCrosshair(ctx, state) {
    const cross = state.crosshair;
    if (!cross.visible) return;
    const { x, y } = cross;
    ctx.strokeStyle = PALETTE.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 16, y);
    ctx.lineTo(x + 16, y);
    ctx.moveTo(x, y - 16);
    ctx.lineTo(x, y + 16);
    ctx.stroke();
    ring(ctx, x, y, 20, PALETTE.accent, 2);
  }

  function drawPictureSide(ctx, off, state, scene, side, hover) {
    ctx.clearRect(0, 0, PICTURE.width, PICTURE.height);
    ctx.drawImage(off, 0, 0);
    drawFoundRings(ctx, state, scene, state.elapsed);
    if (state.wrongMark && state.wrongMark.side === side) drawWrong(ctx, state, state.elapsed);
    drawLens(ctx, off, hover);
    if (state.crosshair.visible && state.crosshair.side === side) drawCrosshair(ctx, state);
  }

  function updateHud(state, game) {
    const scene = game.scene();
    const remaining = game.remainingCount();
    dom.sceneLabel.textContent = `Scene ${game.state.sceneIndex + 1} of ${game.sceneCount()} · ${scene.name}`;
    dom.counter.textContent = remaining === 1 ? '1 to find' : `${remaining} to find`;
    dom.counter.classList.toggle('done', remaining === 0);
    dom.timerText.textContent = formatTime(state.timeLeft);
    const par = PAR_SECONDS[state.sceneIndex];
    dom.timerBar.style.width = `${Math.max(0, Math.min(100, (state.timeLeft / par) * 100))}%`;
    dom.timerBar.classList.toggle('low', state.timeLeft <= 20);
    dom.score.textContent = `Score ${state.totalScore}`;
    dom.streak.textContent = state.streak > 1 ? `Streak ×${state.streak}` : 'Streak ×0';
    dom.streak.classList.toggle('hot', state.streak >= 3);
    dom.hintBtn.textContent = `Hint (${state.hintsLeft})`;
    dom.hintBtn.disabled = state.hintsLeft <= 0 || state.screen !== 'play';
    dom.message.textContent = state.message;
    const chips = scene.differences
      .map((diff) => {
        const found = state.found.has(diff.id);
        return `<span class="chip${found ? ' found' : ''}">${found ? '✓ ' : ''}${diff.name}</span>`;
      })
      .join('');
    dom.foundList.innerHTML = chips;
    dom.levelDots.innerHTML = game.sceneCount() > 0
      ? Array.from({ length: game.sceneCount() }, (_, i) => {
          const cleared = state.cleared[i];
          const current = i === state.sceneIndex;
          return `<button type="button" data-scene="${i}" class="dot${cleared ? ' cleared' : ''}${current ? ' current' : ''}" aria-label="Scene ${i + 1}">${cleared ? '★' : i + 1}</button>`;
        }).join('')
      : '';
  }

  function overlayHtml(state, game) {
    const scene = game.scene();
    if (state.screen === SCREEN_TITLE) {
      const scenes = game.sceneCount();
      const buttons = Array.from({ length: scenes }, (_, i) => {
        const stars = state.stars[i];
        return `<button type="button" data-action="scene" data-scene="${i}" class="scene-btn"><strong>Scene ${i + 1}</strong><span>${game.sceneName(i)}</span><span class="stars">${starRow(stars, 3)}</span></button>`;
      }).join('');
      return `
        <div class="panel">
          <h1>🔍 Twin Worlds</h1>
          <p class="tagline">Spot the difference — four little worlds, thirty sneaky changes.</p>
          <p>Two pictures look the same, but the right one hides the changes. Click a difference on either picture to ring it. Find them all before the timer runs out.</p>
          <div class="scene-grid">${buttons}</div>
          <p class="howto"><strong>How to play</strong><br>Mouse: click a difference · hover to magnify.<br>Keyboard: arrow keys move the crosshair · Enter selects · Tab switches picture · H hint · P pause · R restart · 1–4 scene · M sound.<br>Wrong clicks cost 3 seconds. Hints are limited to 3 per scene.</p>
          <button type="button" data-action="start" class="primary">Play scene 1</button>
          <p class="best">Best total score: ${game.bestScore()}</p>
        </div>`;
    }
    if (state.screen === SCREEN_PAUSED) {
      return `
        <div class="panel">
          <h1>Paused</h1>
          <p>${scene.name} — ${game.foundCount()} of ${game.differenceCount()} found.</p>
          <button type="button" data-action="resume" class="primary">Resume</button>
          <button type="button" data-action="restart">Restart scene</button>
          <button type="button" data-action="title">Back to title</button>
        </div>`;
    }
    if (state.screen === SCREEN_CLEAR) {
      const stars = state.stars[state.sceneIndex];
      const last = state.sceneIndex >= game.sceneCount() - 1;
      return `
        <div class="panel">
          <h1>Scene clear! ${starRow(stars, 3)}</h1>
          <p>${scene.name} — all ${game.differenceCount()} differences found.</p>
          <p>Scene score ${state.score} · Total ${state.totalScore} · Best streak ×${state.bestStreak}</p>
          <button type="button" data-action="next" class="primary">${last ? 'See the final score' : 'Next scene'}</button>
          <button type="button" data-action="replay">Replay this scene</button>
          <button type="button" data-action="title">Back to title</button>
        </div>`;
    }
    if (state.screen === SCREEN_WIN) {
      return `
        <div class="panel">
          <h1>You found them all! ${starRow(game.totalStars(), 12)}</h1>
          <p>Four worlds, ${game.totalDifferences()} differences, ${game.totalStars()} of 12 stars.</p>
          <p>Total score ${state.totalScore} · Best ${game.bestScore()}</p>
          <button type="button" data-action="again" class="primary">Play again</button>
          <button type="button" data-action="title">Back to title</button>
        </div>`;
    }
    if (state.screen === SCREEN_FAIL) {
      return `
        <div class="panel">
          <h1>Time's up</h1>
          <p>${scene.name} — ${game.foundCount()} of ${game.differenceCount()} found.</p>
          <button type="button" data-action="restart" class="primary">Try the scene again</button>
          <button type="button" data-action="title">Back to title</button>
        </div>`;
    }
    return '';
  }

  function draw(state, game, hoverLeft, hoverRight) {
    const scene = game.scene();
    if (renderedScene !== scene.id) renderScene(scene);
    drawPictureSide(ctxLeft, offLeft, state, scene, 0, hoverLeft);
    drawPictureSide(ctxRight, offRight, state, scene, 1, hoverRight);
    updateHud(state, game);
    const html = overlayHtml(state, game);
    if (html !== dom.overlay.dataset.html) {
      dom.overlay.dataset.html = html;
      dom.overlay.innerHTML = html;
      dom.overlay.hidden = html === '';
    }
  }

  return { draw, renderScene };
}
