# Implementation Plan: JavaScript Space Invaders

1. **Project Setup**
- Create a simple web app scaffold: `index.html`, `style.css`, `src/main.js`.
- Decide rendering approach: use HTML5 `<canvas>` (recommended).
- Add a basic dev workflow (e.g., `npm` + Vite or plain static files).

2. **Core Game Loop**
- Implement game loop with `requestAnimationFrame`.
- Track `deltaTime` for frame-independent movement.
- Add game states: `start`, `playing`, `paused`, `gameOver`, `win`.

3. **Game Entities**
- Define entity models/classes:
  - `Player` (position, speed, lives, cooldown)
  - `Alien` (position, type, points, alive flag)
  - `Projectile` (owner, velocity, active)
  - Optional: `Shield`, `UFO`, `Explosion`
- Build shared update/render patterns for all entities.

4. **Input System**
- Add keyboard handling (`ArrowLeft`, `ArrowRight`, `Space`, `P`).
- Support key hold and key press behaviors.
- Prevent rapid-fire with shooting cooldown logic.

5. **Gameplay Mechanics**
- Player movement constrained to screen bounds.
- Alien formation movement (side-to-side + drop down on edge hit).
- Player and alien shooting behavior.
- Win/lose rules:
  - Lose if aliens reach player zone or lives reach 0.
  - Win if all aliens are defeated.

6. **Collision & Scoring**
- Implement AABB collision detection.
- Handle projectile collisions with aliens, player, shields.
- Award points per alien type.
- Track score, high score (localStorage), level progression.

7. **UI/HUD**
- Render score, lives, level, and current state overlays.
- Add start screen and restart option.
- Optional audio toggle and FPS/debug display.

8. **Difficulty & Progression**
- Increase alien speed each level.
- Increase alien shooting frequency.
- Add occasional UFO bonus target.
- Tune pacing for 2–5 minute early levels.

9. **Polish**
- Add sprite art or simple pixel shapes.
- Add sound effects (shoot, hit, explosion, game over).
- Add screen shake/flash or tiny particle effects for hits.
- Ensure consistent behavior across different screen sizes.

10. **Testing & QA**
- Manual test checklist:
  - Input responsiveness
  - Collision correctness
  - State transitions
  - Level progression and score reset/restart behavior
- Add lightweight unit tests for collision and state reducers if using modules.
- Verify performance at 60 FPS on desktop and mobile browsers.

11. **Delivery**
- Refactor into modules: `game`, `entities`, `systems`, `ui`, `assets`.
- Add README with controls and run instructions.
- Deploy to GitHub Pages/Netlify/Vercel.
