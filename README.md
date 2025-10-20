# Kanga's Climb: Journey to the Sky Garden

Kanga's Climb is a vertical precision platformer built for the Social Impact Game Jam. The game follows Kanga, a determined kangaroo mother, as she scales a polluted trash-scape of Australia to reach the Sky Garden and rescue her sick joey. Designed to be both engaging and educational, the experience highlights how persistence, community action, and pollution cleanup can heal the environment.

## Theme & Social Impact
- **Issue Focus**: Air pollution, waste management, and ecosystem restoration in Australia.
- **Narrative Arc**: Players start in smog-choked ruins and ascend through transitional zones to a thriving sanctuary, witnessing environmental recovery along the way.
- **Learning Outcome**: Careful planning, clean-up actions, and perseverance unlock healthier ecosystems—reinforcing that every step toward sustainability matters.

## Gameplay Highlights
- **Jump King–style physics** where charged jumps lock in their trajectory, prioritising timing and precision.
- **Dynamic platform sets** that blend unstable trash piles, reclaimed hybrid platforms, and reliable natural ledges in the Sky Garden.
- **Environmental progress UI** showing height, score, Joey’s health, and jump power to reinforce cause-and-effect.
- **Trash collection loop** that rewards players for removing pollutants on their ascent.
- **Multiple screens** including menu, how-to-play, active play, game over, and victory celebrations.
- **Responsive canvas layout** that scales to the player’s viewport and streams assets for smoother play.

## Controls
| Action | Input |
| --- | --- |
| Move left / right | `A` / `D` or `←` / `→` while grounded |
| Charge jump | Hold `Space` while on a platform |
| Release jump | Let go of `Space` (trajectory is committed) |
| Menu navigation | On-screen buttons |

## Run the Game Locally
1. **Install a lightweight server** (any static server will work). Python is preinstalled on most systems:
   ```bash
   python3 -m http.server 8000
   ```
2. Run the command from the repository root (`game_submission/`).
3. Visit [http://localhost:8000/index.html](http://localhost:8000/index.html) in your browser and launch the game via the “🎮 Launch Game” button.
4. Prefer a modern desktop browser (Chrome, Edge, or Firefox). Mobile browsers are not yet supported.

> Tip: Directly double-clicking `index.html` also works in some browsers, but using a local server avoids CORS restrictions when loading image assets.

## Repository Layout
```
game_submission/
├── README.md                # This guide
├── index.html               # Landing page and launcher
├── game_app/                # Playable web game (HTML, CSS, JS, asset loaders)
├── assets/                  # Pixel art tiles, background, character, and trash sprites
├── screenshots/             # Five curated gameplay captures
├── prompts/                 # LLM prompts used for ideation, asset, code, and polish
├── document/                # Design briefs: story, mechanics, tech, and overview
├── youtube_link.txt         # Demo video URL placeholder
└── project_report.pdf       # Full project write-up (provided separately)
```

## Technology & AI Workflow
- **Stack**: Vanilla HTML5 Canvas, JavaScript, and CSS (no backend dependencies).
- **Key Systems**: Procedural platform generation, camera tracking, jump physics, collectible trash scoring, and UI overlays for health, height, and power.
- **AI Assistance**:
  - Conceptual brainstorming, story beats, and structure (`prompts/concept_prompts.txt`).
  - Sprite, background, and UI guidelines for asset generation (`prompts/asset_generation_prompts.txt`).
  - Code scaffolding, mechanics tuning, and bug fixes documented in `prompts/code_generation_prompts.txt` and `prompts/refinement_prompts.txt`.

## Assets & Credits
- **Pixel Art Pack**: CraftPix.net free asset set – see `assets/License.txt` for licence details.
- **Pixel Font**: “Pixellari” by Zacchary Dempsey-Plante – referenced in `assets/Font.txt`.
- **Customisations**: Procedurally generated platform compositions, trash placement, and dynamic UI rendering implemented in `game_app/game.js` and `game_app/styles.css`.

## Screenshots & Demo
- High-level visuals are available in `screenshots/`. The required five captures align with menu, multiple gameplay moments, and post-run results.
- A narrated walkthrough should be linked from `youtube_link.txt` once uploaded to YouTube (max seven minutes as per submission rules).

## Known Limitations & Next Steps
- Mobile/touch support is not yet implemented.
- Audio cues are stubbed in logic but need production-ready sound assets.
- Performance has been tuned for desktop browsers; stress-testing on low-powered devices is recommended.
- Future iterations could add accessibility toggles (color contrast, difficulty adjustments) and expanded environmental storytelling moments.

Enjoy climbing toward a cleaner future with Kanga and Joey! Contributions, playtest feedback, and sustainability ideas are all welcome.
