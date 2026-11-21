// Every tuning number and colour in one place. Each picture is drawn in a fixed
// 600x420 logical space; the renderer scales it to the window, so no rule below
// depends on the screen size.

export const PICTURE = { width: 600, height: 420 };

/** Seconds of play allowed per scene (the par time). */
export const PAR_SECONDS = [150, 150, 180, 180];

/** Hints per scene, and the seconds a wrong click costs. */
export const HINTS_PER_SCENE = 3;
export const WRONG_COST_SECONDS = 3;

/** Points for a found difference, per streak step, and the level-clear time bonus. */
export const POINTS_FOUND = 100;
export const POINTS_STREAK = 10;
export const POINTS_TIME_BONUS = 2;

/** How far (logical pixels) a click may land from a difference's centre and count. */
export const HIT_RADIUS = 26;

/** The magnifier lens: its radius on screen and its zoom. */
export const LENS = { radius: 64, zoom: 2 };

export const PALETTE = {
  page: '#101827',
  panel: '#1b2740',
  panelEdge: '#2c3d63',
  text: '#f4f1e8',
  muted: '#9aa7bd',
  accent: '#f5b942',
  accentDark: '#c98f1b',
  good: '#43c465',
  bad: '#e5534b',
  ring: '#ffd23e',
  ringFound: '#43c465',
  hudChip: '#22304f',
};

/** The game's own font stack: system fonts only, nothing fetched. */
export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-worlds.best';

/** Scene names in play order, shown on the title screen and the level bar. */
export const SCENE_NAMES = [
  'Morning at the Café',
  'Picnic in the Garden',
  'The Toy Workshop',
  'Under the Reef',
];
