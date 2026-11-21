# Twin Worlds — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Creepzone11/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Creepzone11/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Two near-identical pictures, side by side — find every difference before the clock runs out. **Twin Worlds** is an original spot-the-difference game built for make.fun's ["Make the best spot the difference game"](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) bounty: four hand-drawn scenes, 30 hidden differences, and a full game loop with timer, hints, score, streaks and stars.

## The game

Four original scenes, each a pair of pictures with 7–8 subtle differences to find:

1. **Morning at the Café** — sun rays, a bird, the awning stripe, a cake price, a second coffee cup, a sleeping cat, a bicycle basket, a flower.
2. **Picnic in the Garden** — a cloud, an apple, a butterfly, a lemonade bottle, a second sandwich, a dog collar, a sunflower.
3. **The Toy Workshop** — a star in the window, a teddy bow, and more.
4. **Under the Reef** — the last scene, the hardest to spot.

Click a difference (mouse) or move the cursor and confirm (keyboard: arrows/Tab + Enter/Space) to mark it with a ring. The counter shows how many remain; found differences stay marked while the rest stay hidden. Each scene has a par time (150–180 seconds), 3 hints, and a 1–3 star rating based on time left, hints used and wrong clicks. Wrong clicks break your streak; a clean, fast run earns 3 stars. All art, sounds and music are original, drawn and synthesized in code — no borrowed assets, no network requests.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080> in a desktop browser and play — keyboard and mouse, no network needed. Everything the game loads is a file under `game/` (plain static files, no build step).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to the output directory and writes `dossier.json` there. It first checks the entry against the scorer's caps (game/index.html at most 1 MiB, game/ at most 993 files and 48 MiB, screenshots/ 3–4 images of at most 256 KiB each).

## Screenshots

`screenshots/` holds four real renders of the game running in a browser: the cover (`1-cover.jpg`), play (`2-play.jpg`), differences found (`3-found.jpg`) and the win screen (`4-win.jpg`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=kh987p5b&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
