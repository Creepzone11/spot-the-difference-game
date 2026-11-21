// The four scenes. Each one is drawn twice — once as the original and once with its
// seven differences — by the same function, so the two pictures are pixel-identical
// except for exactly those seven changes. A difference is a fair change: removed,
// recoloured, moved, resized, flipped or added, never a hidden pixel. Each scene's
// `differences` list gives the name the found-list shows and the centre the clicks
// are tested against (radius HIT_RADIUS unless a difference says otherwise).
//
// The pictures are drawn in a fixed 600x420 logical space. All art is original vector
// work drawn with the canvas API; there are no image files and no network requests.

import { HIT_RADIUS, PICTURE } from './config.js';

/** Small drawing helpers, so each scene reads as a list of shapes. */
function circle(ctx, x, y, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function text(ctx, value, x, y, size, color, align = 'center', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** A soft five-point star. */
function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** A puffy cloud of three circles. */
function cloud(ctx, x, y, scale, fill) {
  circle(ctx, x, y, 18 * scale, fill);
  circle(ctx, x + 18 * scale, y - 8 * scale, 15 * scale, fill);
  circle(ctx, x + 36 * scale, y, 17 * scale, fill);
  rect(ctx, x - 16 * scale, y, 68 * scale, 14 * scale, fill);
}

/** A bird as two small arcs. */
function bird(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x - 7, y, 7, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 7, y, 7, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

/** A five-petalled flower. */
function flower(ctx, x, y, petal, centre) {
  for (let i = 0; i < 5; i += 1) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    circle(ctx, x + Math.cos(angle) * 8, y + Math.sin(angle) * 8, 6, petal);
  }
  circle(ctx, x, y, 5, centre);
}

/* ------------------------------------------------------------------ */
/* Scene 1 — Morning at the Café                                       */
/* ------------------------------------------------------------------ */

function drawCafe(ctx, changed) {
  // Sky, sun, clouds, birds.
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#ffe9b8');
  sky.addColorStop(1, '#ffd08a');
  rect(ctx, 0, 0, PICTURE.width, 260, sky);
  circle(ctx, 512, 66, 34, '#ffcf3f');
  if (!changed) {
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI * 2 * i) / 8;
      line(ctx, 512 + Math.cos(a) * 42, 66 + Math.sin(a) * 42, 512 + Math.cos(a) * 54, 66 + Math.sin(a) * 54, '#f5a623', 4);
    }
  }
  cloud(ctx, 80, 60, 1, '#fff8ea');
  cloud(ctx, 300, 42, 0.8, '#fff8ea');
  bird(ctx, 180, 96, '#5a4632');
  bird(ctx, 240, 78, '#5a4632');
  if (!changed) bird(ctx, 420, 110, '#5a4632');

  // Café wall and striped awning.
  rect(ctx, 0, 150, PICTURE.width, 150, '#f7e8d0');
  rect(ctx, 0, 150, PICTURE.width, 8, '#d9b48a');
  for (let i = 0; i < 10; i += 1) {
    const stripe = i === 4 && changed ? '#2e8b8b' : i % 2 === 0 ? '#e4572e' : '#fff3e0';
    rect(ctx, i * 60, 158, 60, 34, stripe);
  }
  rect(ctx, 0, 192, PICTURE.width, 6, '#b98a5e');
  // Menu board.
  rect(ctx, 40, 214, 96, 64, '#4a3525');
  rect(ctx, 46, 220, 84, 52, '#fff8ea');
  text(ctx, 'MENU', 88, 232, 13, '#4a3525');
  text(ctx, 'Coffee 5', 88, 250, 12, '#4a3525', 'center', '600');
  text(ctx, changed ? 'Cake 6' : 'Cake 5', 88, 266, 12, '#4a3525', 'center', '600');

  // Terrace floor under the table and chairs.
  rect(ctx, 0, 300, PICTURE.width, 120, '#eadfc8');

  // Round table with two cups (one cup is gone in the changed picture).
  ellipse(ctx, 300, 330, 120, 16, '#8a5a3b');
  rect(ctx, 294, 330, 12, 46, '#6b4226');
  ellipse(ctx, 300, 378, 52, 8, '#6b4226');
  circle(ctx, 258, 312, 16, '#ffffff');
  ellipse(ctx, 258, 312, 12, 8, '#6b4226');
  line(ctx, 274, 308, 282, 308, '#6b4226', 3);
  if (!changed) {
    circle(ctx, 348, 312, 16, '#ffffff');
    ellipse(ctx, 348, 312, 12, 8, '#c96f2e');
    line(ctx, 332, 308, 324, 308, '#6b4226', 3);
  }

  // The cat asleep on a chair (gone in the changed picture).
  rect(ctx, 452, 300, 90, 10, '#7a4a2b');
  rect(ctx, 458, 310, 8, 44, '#7a4a2b');
  rect(ctx, 528, 310, 8, 44, '#7a4a2b');
  if (!changed) {
    ellipse(ctx, 497, 292, 34, 16, '#e8821e');
    circle(ctx, 524, 280, 13, '#e8821e');
    poly(ctx, [[516, 270], [520, 258], [526, 268]], '#e8821e');
    poly(ctx, [[528, 268], [534, 258], [536, 270]], '#e8821e');
    line(ctx, 470, 288, 448, 276, '#e8821e', 5);
  }

  // Bicycle leaning by the wall (a basket appears on it in the changed picture).
  circle(ctx, 150, 356, 22, '#2e6f8e');
  circle(ctx, 150, 356, 16, '#f7e8d0');
  circle(ctx, 214, 356, 22, '#2e6f8e');
  circle(ctx, 214, 356, 16, '#f7e8d0');
  line(ctx, 150, 356, 182, 318, '#2e6f8e', 4);
  line(ctx, 214, 356, 182, 318, '#2e6f8e', 4);
  line(ctx, 182, 318, 196, 300, '#2e6f8e', 4);
  line(ctx, 150, 356, 168, 322, '#2e6f8e', 4);
  if (changed) {
    rect(ctx, 196, 306, 26, 18, '#b98a5e');
    line(ctx, 196, 306, 222, 306, '#b98a5e', 3);
  }

  // Flower pots by the door (the flowers change colour).
  rect(ctx, 560, 330, 30, 26, '#c96f2e');
  flower(ctx, 575, 318, changed ? '#ffd23e' : '#e4572e', '#fff3e0');
  rect(ctx, 20, 340, 30, 26, '#c96f2e');
  flower(ctx, 35, 328, '#e4572e', '#fff3e0');

  // Cobblestones.
  rect(ctx, 0, 380, PICTURE.width, 40, '#e8dcc8');
  for (let i = 0; i < 12; i += 1) line(ctx, i * 52, 380, i * 52 + 20, 420, '#d9c8a8', 2);
}

/* ------------------------------------------------------------------ */
/* Scene 2 — Picnic in the Garden                                      */
/* ------------------------------------------------------------------ */

function drawGarden(ctx, changed) {
  const sky = ctx.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, '#aee3ff');
  sky.addColorStop(1, '#e8f7ff');
  rect(ctx, 0, 0, PICTURE.width, 200, sky);
  circle(ctx, 528, 58, 30, '#ffdf4d');
  cloud(ctx, 90, 52, 1, '#ffffff');
  if (!changed) cloud(ctx, 330, 40, 0.9, '#ffffff');
  cloud(ctx, 420, 88, 0.7, '#ffffff');
  rect(ctx, 0, 200, PICTURE.width, 220, '#7cc46a');
  rect(ctx, 0, 200, PICTURE.width, 10, '#5da34f');

  // Big tree on the left, with apples (one apple is gone in the changed picture).
  rect(ctx, 52, 120, 26, 110, '#7a4a2b');
  circle(ctx, 65, 96, 52, '#4e9b47');
  circle(ctx, 28, 118, 36, '#5da34f');
  circle(ctx, 104, 118, 38, '#5da34f');
  circle(ctx, 40, 84, 10, '#e4572e');
  circle(ctx, 92, 70, 10, '#e4572e');
  if (!changed) circle(ctx, 66, 108, 10, '#e4572e');
  circle(ctx, 108, 104, 10, '#e4572e');

  // Picnic blanket and basket.
  poly(ctx, [[210, 300], [390, 300], [430, 400], [170, 400]], '#e4572e');
  poly(ctx, [[250, 300], [290, 300], [300, 400], [230, 400]], '#fff3e0');
  poly(ctx, [[330, 300], [370, 300], [390, 400], [350, 400]], '#fff3e0');
  rect(ctx, 270, 268, 64, 34, '#b98a5e');
  rect(ctx, 270, 268, 64, 8, '#8a5a3b');
  line(ctx, 302, 268, 302, 250, '#8a5a3b', 4);

  // Lemonade bottle and glasses (the bottle is gone in the changed picture).
  if (!changed) {
    rect(ctx, 380, 262, 16, 40, '#2e8b8b');
    rect(ctx, 384, 250, 8, 12, '#2e8b8b');
    text(ctx, 'LEMON', 388, 282, 8, '#ffffff', 'center', '700');
  }
  rect(ctx, 226, 288, 14, 18, '#dff3ff');
  rect(ctx, 244, 288, 14, 18, '#dff3ff');

  // Sandwiches on a plate (one sandwich is gone in the changed picture).
  ellipse(ctx, 330, 322, 34, 10, '#ffffff');
  poly(ctx, [[312, 318], [330, 306], [348, 318]], '#f2c94c');
  poly(ctx, [[312, 318], [330, 312], [348, 318]], '#8a5a3b');
  if (!changed) {
    poly(ctx, [[318, 318], [336, 306], [354, 318]], '#f2c94c');
    poly(ctx, [[318, 318], [336, 312], [354, 318]], '#8a5a3b');
  }

  // The dog asleep by the blanket (its collar changes colour).
  ellipse(ctx, 480, 360, 46, 18, '#c98f5f');
  circle(ctx, 522, 348, 15, '#c98f5f');
  ellipse(ctx, 512, 336, 8, 12, '#8a5a3b');
  line(ctx, 528, 360, 540, 352, '#8a5a3b', 3);
  line(ctx, 522, 362, 506, 362, changed ? '#2e6f8e' : '#e4572e', 5);
  ellipse(ctx, 448, 372, 18, 8, '#c98f5f');

  // Butterflies (one changes colour).
  function butterfly(x, y, wing) {
    ellipse(ctx, x - 8, y, 9, 6, wing);
    ellipse(ctx, x + 8, y, 9, 6, wing);
    ellipse(ctx, x, y, 3, 8, '#4a3525');
  }
  butterfly(160, 150, '#f5a623');
  butterfly(440, 140, changed ? '#2e6f8e' : '#f5a623');
  butterfly(500, 90, '#e4572e');

  // Flowers along the bottom (a sunflower appears in the changed picture).
  flower(ctx, 60, 396, '#ffffff', '#ffd23e');
  flower(ctx, 120, 400, '#e4572e', '#fff3e0');
  flower(ctx, 540, 398, '#ffffff', '#ffd23e');
  if (changed) {
    circle(ctx, 200, 392, 12, '#8a5a3b');
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI * 2 * i) / 8;
      circle(ctx, 200 + Math.cos(a) * 14, 392 + Math.sin(a) * 14, 5, '#ffd23e');
    }
  }
}

/* ------------------------------------------------------------------ */
/* Scene 3 — The Toy Workshop                                          */
/* ------------------------------------------------------------------ */

function drawWorkshop(ctx, changed) {
  rect(ctx, 0, 0, PICTURE.width, PICTURE.height, '#f3e3c8');
  rect(ctx, 0, 0, PICTURE.width, 60, '#e8d3ae');
  // Window with the moon (a star appears in the changed picture).
  rect(ctx, 470, 30, 100, 110, '#2c3d63');
  rect(ctx, 470, 30, 100, 110, '#2c3d63');
  line(ctx, 520, 30, 520, 140, '#f3e3c8', 6);
  line(ctx, 470, 85, 570, 85, '#f3e3c8', 6);
  circle(ctx, 500, 58, 16, '#ffe9a8');
  if (changed) star(ctx, 548, 112, 9, '#ffe9a8');
  star(ctx, 488, 118, 7, '#ffffff');
  star(ctx, 552, 52, 6, '#ffffff');

  // Shelves with toys.
  rect(ctx, 30, 130, 260, 12, '#8a5a3b');
  rect(ctx, 30, 250, 260, 12, '#8a5a3b');
  rect(ctx, 30, 130, 12, 132, '#8a5a3b');
  rect(ctx, 278, 130, 12, 132, '#8a5a3b');
  // Teddy bear (its bow tie changes colour).
  circle(ctx, 90, 100, 22, '#b98a5e');
  circle(ctx, 74, 82, 9, '#b98a5e');
  circle(ctx, 106, 82, 9, '#b98a5e');
  ellipse(ctx, 90, 128, 20, 16, '#b98a5e');
  circle(ctx, 90, 102, 7, '#e8c9a0');
  poly(ctx, [[82, 118], [98, 118], [90, 128]], changed ? '#2e6f8e' : '#e4572e');
  // Toy train (one carriage is gone in the changed picture).
  rect(ctx, 150, 108, 44, 24, '#e4572e');
  circle(ctx, 160, 136, 8, '#4a3525');
  circle(ctx, 184, 136, 8, '#4a3525');
  rect(ctx, 150, 96, 18, 14, '#e4572e');
  if (!changed) {
    rect(ctx, 200, 112, 34, 20, '#2e8b8b');
    circle(ctx, 210, 136, 8, '#4a3525');
    circle(ctx, 226, 136, 8, '#4a3525');
  }
  // Building blocks (one letter flips).
  rect(ctx, 60, 210, 30, 30, '#e4572e');
  text(ctx, 'A', 75, 226, 18, '#ffffff');
  rect(ctx, 96, 210, 30, 30, '#2e8b8b');
  text(ctx, changed ? 'C' : 'B', 111, 226, 18, '#ffffff');
  rect(ctx, 132, 210, 30, 30, '#f5a623');
  text(ctx, 'C', 147, 226, 18, '#ffffff');

  // Rocking horse (its mane changes colour).
  poly(ctx, [[330, 300], [420, 300], [375, 330]], '#8a5a3b');
  line(ctx, 340, 300, 330, 330, '#8a5a3b', 5);
  line(ctx, 410, 300, 420, 330, '#8a5a3b', 5);
  ellipse(ctx, 375, 268, 46, 22, '#c98f5f');
  circle(ctx, 414, 252, 16, '#c98f5f');
  poly(ctx, [[404, 240], [414, 228], [424, 242]], '#c98f5f');
  line(ctx, 402, 250, 380, 240, changed ? '#2e6f8e' : '#e4572e', 6);
  line(ctx, 330, 300, 420, 300, '#8a5a3b', 4);

  // Lamp on the desk (lit in the original, dark in the changed picture).
  rect(ctx, 480, 300, 70, 10, '#8a5a3b');
  rect(ctx, 510, 250, 8, 50, '#4a3525');
  poly(ctx, [[494, 250], [532, 250], [522, 224], [504, 224]], '#e4572e');
  if (!changed) {
    circle(ctx, 513, 252, 10, '#ffd23e');
    ctx.globalAlpha = 0.25;
    circle(ctx, 513, 252, 26, '#ffd23e');
    ctx.globalAlpha = 1;
  }

  // Rug (a stripe is missing in the changed picture).
  rect(ctx, 150, 360, 300, 40, '#e4572e');
  rect(ctx, 150, 360, 300, 10, '#fff3e0');
  if (!changed) rect(ctx, 150, 380, 300, 10, '#fff3e0');
  rect(ctx, 150, 360, 10, 40, '#fff3e0');
  rect(ctx, 440, 360, 10, 40, '#fff3e0');

  // Kite on the wall.
  poly(ctx, [[320, 60], [360, 90], [320, 120], [280, 90]], '#f5a623');
  line(ctx, 320, 120, 320, 150, '#4a3525', 2);

  // A round clock on the wall, the same in both pictures.
  circle(ctx, 400, 190, 26, '#fff8ea');
  ctx.strokeStyle = '#4a3525';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(400, 190, 26, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, 400, 190, 400, 172, '#4a3525', 3);
  line(ctx, 400, 190, 414, 196, '#4a3525', 3);
  circle(ctx, 400, 190, 3, '#4a3525');
}

/* ------------------------------------------------------------------ */
/* Scene 4 — Under the Reef                                            */
/* ------------------------------------------------------------------ */

function drawReef(ctx, changed) {
  const water = ctx.createLinearGradient(0, 0, 0, PICTURE.height);
  water.addColorStop(0, '#1b6fa8');
  water.addColorStop(1, '#0a4a75');
  rect(ctx, 0, 0, PICTURE.width, PICTURE.height, water);
  // Light rays from the surface.
  ctx.globalAlpha = 0.12;
  poly(ctx, [[120, 0], [180, 0], [120, 300], [60, 300]], '#ffffff');
  poly(ctx, [[380, 0], [430, 0], [380, 300], [320, 300]], '#ffffff');
  ctx.globalAlpha = 1;
  // Sandy floor.
  ellipse(ctx, 300, 430, 340, 40, '#e8d3a0');
  rect(ctx, 0, 396, PICTURE.width, 24, '#e8d3a0');

  // Corals.
  function coral(x, y, h, color) {
    rect(ctx, x - 8, y - h, 16, h, color);
    circle(ctx, x - 8, y - h, 10, color);
    circle(ctx, x + 8, y - h, 10, color);
    circle(ctx, x, y - h - 8, 11, color);
  }
  coral(80, 396, 70, '#ff7f9e');
  coral(520, 396, 84, '#ff9e5e');
  coral(450, 396, 50, '#ff7f9e');

  // Seaweed (one stalk is shorter in the changed picture).
  function weed(x, h, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x, 396);
    ctx.quadraticCurveTo(x + 14, 396 - h / 2, x + 4, 396 - h);
    ctx.stroke();
  }
  weed(150, 90, '#3fae6a');
  weed(180, changed ? 50 : 110, '#3fae6a');
  weed(350, 80, '#3fae6a');

  // The turtle (its shell pattern changes).
  ellipse(ctx, 300, 200, 56, 34, '#5da34f');
  circle(ctx, 360, 190, 18, '#7cc46a');
  ellipse(ctx, 252, 210, 14, 8, '#7cc46a');
  ellipse(ctx, 252, 186, 14, 8, '#7cc46a');
  ellipse(ctx, 344, 214, 14, 8, '#7cc46a');
  if (!changed) {
    circle(ctx, 290, 196, 8, '#3f7a37');
    circle(ctx, 312, 206, 8, '#3f7a37');
    circle(ctx, 300, 186, 8, '#3f7a37');
  } else {
    line(ctx, 280, 186, 320, 210, '#3f7a37', 4);
    line(ctx, 320, 186, 280, 210, '#3f7a37', 4);
  }
  circle(ctx, 366, 186, 3, '#1b2a1b');

  // Fish (one changes colour; one is gone in the changed picture).
  function fish(x, y, size, body, tail) {
    ellipse(ctx, x, y, size, size * 0.55, body);
    poly(ctx, [[x - size, y], [x - size - 14, y - size * 0.5], [x - size - 14, y + size * 0.5]], tail);
    circle(ctx, x + size * 0.5, y - 3, 3, '#1b2a1b');
  }
  fish(140, 120, 22, '#ffd23e', '#f5a623');
  fish(460, 110, 20, changed ? '#b07fe8' : '#ff8a5c', '#e4572e');
  if (!changed) fish(200, 300, 16, '#7fd4ff', '#2e8b8b');

  // Starfish on a rock (it moves in the changed picture).
  ellipse(ctx, 120, 380, 40, 14, '#8a7a6a');
  if (!changed) {
    star(ctx, 120, 368, 14, '#ff9e5e');
  } else {
    star(ctx, 470, 372, 14, '#ff9e5e');
  }

  // Bubbles (a cluster is gone in the changed picture).
  circle(ctx, 250, 120, 8, 'rgba(255,255,255,0.5)');
  circle(ctx, 262, 100, 6, 'rgba(255,255,255,0.5)');
  circle(ctx, 272, 82, 5, 'rgba(255,255,255,0.5)');
  if (!changed) {
    circle(ctx, 420, 250, 8, 'rgba(255,255,255,0.5)');
    circle(ctx, 432, 232, 6, 'rgba(255,255,255,0.5)');
    circle(ctx, 442, 214, 5, 'rgba(255,255,255,0.5)');
  }

  // Treasure chest (open with gold in the original, closed in the changed picture).
  rect(ctx, 500, 360, 56, 30, '#8a5a3b');
  rect(ctx, 500, 360, 56, 8, '#6b4226');
  if (!changed) {
    poly(ctx, [[500, 360], [556, 360], [548, 336], [508, 336]], '#a06a42');
    circle(ctx, 516, 352, 6, '#ffd23e');
    circle(ctx, 532, 350, 6, '#ffd23e');
    circle(ctx, 544, 354, 5, '#ffd23e');
  } else {
    rect(ctx, 500, 344, 56, 16, '#a06a42');
    rect(ctx, 524, 344, 8, 46, '#ffd23e');
  }
  // A small crab appears in the changed picture.
  if (changed) {
    circle(ctx, 220, 386, 10, '#e4572e');
    circle(ctx, 210, 380, 4, '#e4572e');
    circle(ctx, 230, 380, 4, '#e4572e');
  }
}

/* ------------------------------------------------------------------ */

export const SCENES = [
  {
    id: 'cafe',
    name: 'Morning at the Café',
    draw: drawCafe,
    differences: [
      { id: 'sun-rays', name: 'Sun rays', x: 512, y: 66 },
      { id: 'bird', name: 'Bird in the sky', x: 420, y: 110 },
      { id: 'awning', name: 'Awning stripe colour', x: 270, y: 175 },
      { id: 'cake-price', name: 'Cake price', x: 88, y: 266 },
      { id: 'coffee-cup', name: 'Second coffee cup', x: 348, y: 312 },
      { id: 'cat', name: 'Sleeping cat', x: 497, y: 288 },
      { id: 'basket', name: 'Basket on the bicycle', x: 209, y: 315 },
      { id: 'flower', name: 'Flower colour', x: 575, y: 318 },
    ],
  },
  {
    id: 'garden',
    name: 'Picnic in the Garden',
    draw: drawGarden,
    differences: [
      { id: 'cloud', name: 'Cloud in the sky', x: 330, y: 40 },
      { id: 'apple', name: 'Apple on the tree', x: 66, y: 108 },
      { id: 'butterfly', name: 'Butterfly colour', x: 440, y: 140 },
      { id: 'lemonade', name: 'Lemonade bottle', x: 388, y: 276 },
      { id: 'sandwich', name: 'Second sandwich', x: 336, y: 312 },
      { id: 'collar', name: 'Dog collar colour', x: 514, y: 362 },
      { id: 'sunflower', name: 'Sunflower in the grass', x: 200, y: 392 },
    ],
  },
  {
    id: 'workshop',
    name: 'The Toy Workshop',
    draw: drawWorkshop,
    differences: [
      { id: 'star', name: 'Star in the window', x: 548, y: 112 },
      { id: 'bow', name: 'Teddy bow colour', x: 90, y: 122 },
      { id: 'carriage', name: 'Train carriage', x: 217, y: 124 },
      { id: 'block', name: 'Block letter', x: 111, y: 226 },
      { id: 'mane', name: 'Horse mane colour', x: 392, y: 245 },
      { id: 'lamp', name: 'Lamp light', x: 513, y: 252 },
      { id: 'rug', name: 'Rug stripe', x: 300, y: 385 },
    ],
  },
  {
    id: 'reef',
    name: 'Under the Reef',
    draw: drawReef,
    differences: [
      { id: 'fish-colour', name: 'Fish colour', x: 460, y: 110 },
      { id: 'fish-gone', name: 'Little blue fish', x: 200, y: 300 },
      { id: 'bubbles', name: 'Bubble cluster', x: 430, y: 232 },
      { id: 'turtle', name: 'Turtle shell pattern', x: 300, y: 198 },
      { id: 'seaweed', name: 'Seaweed height', x: 182, y: 350 },
      { id: 'starfish', name: 'Starfish spot', x: 470, y: 372, zones: [[120, 368], [470, 372]] },
      { id: 'chest', name: 'Treasure chest lid', x: 528, y: 352 },
      { id: 'crab', name: 'Little crab', x: 220, y: 386 },
    ],
  },
];

/** The scene's difference count; the café and the reef have eight, the others seven. */
export function differenceCount(scene) {
  return scene.differences.length;
}

/** Draw one picture of a scene into a context sized PICTURE. */
export function drawPicture(ctx, scene, variant) {
  ctx.save();
  ctx.clearRect(0, 0, PICTURE.width, PICTURE.height);
  scene.draw(ctx, variant);
  ctx.restore();
}
