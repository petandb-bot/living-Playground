# LIVING PLAYGROUND

*A small world of musical machines and curious bugs.*

**Status: v0.1.0-alpha.1 — first playable study.** The code is on a feature branch while we test the music and interactions. No public production release or iPhone Safari real-device test has been completed.

LIVING PLAYGROUND is a small browser instrument. Tap the electronic chips, connect them into musical relationships, and watch a little creature explore those connections. The goal is not to reproduce a modular synthesizer or a retro videogame. The goal is a playful world where **simple actions make interesting music**.

## First-playable controls

- **PLAY / STOP**: start or stop an intentionally spacious 16-step groove.
- **THUMP**: rubber-bodied, hollow and FM percussion. Tap the colored chip body, or hold and repeat manually. Two controls: FORCE / HOLLOW.
- **CHIRP**: bent FM pitch and unusual overtone fragments. Tap or play from TICK. Two controls: TUNE / BEND.
- **TICK**: musical clock. Connect it to a voice to give that voice a repeatable phrase. Two controls: DENSITY / SWING.
- **LINK**: choose a source chip and then a destination. TICK→voice creates events. Voice→voice creates a temporary musical influence on the other voice's next sound. Clicking an existing link pair again removes it. No unbounded feedback.
- **MUTATE / UNDO**: vary part of the motif and return to an earlier state. A few rhythmic anchors remain. **NEW** creates another motif while preserving links and chip positions.
- **BUG**: follows chip connections and reacts to musical events. Drag it onto a sound chip to make it knock. Autonomous wandering **never changes the audio**.
- **Chip nameplate**: drag to move a chip. **+ CHIP**: add a fourth THUMP or CHIRP. Selection reveals two simple controls.

The first-playable alpha begins with THUMP, CHIRP, TICK and a single Bug. MUMBLE, MUTANT, NEST, full recording and WAV export are **planned, not implemented**. The scene is saved in browser local storage (not synced between devices). Audio starts after a user gesture.

## Development

No external JavaScript dependencies are needed for the current prototype. Browser-native ES modules, Web Audio and Canvas 2D deliberately reduce overhead while the sound and interaction design are evolving.

```sh
npm test
npm run check
npm run build
python3 -m http.server 8080
```

Open `http://localhost:8080`. For mobile tests use an HTTPS deployment, or an approved local development environment; audio APIs may need a secure context. `dist/` contains a static copy suitable for a static host. The project has no backend.

**Quick audition without a local web server:** `npm run build` also generates `dist/preview.html` — a self-contained file with the exact audio, music and visual modules inlined. Download the GitHub Actions `living-playground-alpha` artifact, unzip it and open `preview.html` in Chrome or Edge. Local browser storage may be unavailable from a file URL; the hosted ES-module version is the canonical source for persistent sessions. This is a prototype for listening, not a public production deployment.

## Design

- [Full architecture and development milestones](docs/DESIGN.md)
- [Pixel-art direction: early computer graphics, 1980–1993](docs/ART_DIRECTION.md)
- [First playable scope and limitations](docs/FIRST_PLAYABLE.md)

### Musical references

[WRONG NUMBER](https://github.com/petandb-bot/wrong-number) — deliberate gaps, unusual FM/voice-like timbres, live mutation, reversible changes, sparse patterns. Especially ROTTEN CARROT and TOY MALFUNCTION.

[SIGNAL MACHINES](https://github.com/petandb-bot/signal-machines-v1) — stable musical event handling, selective pitch constraints, safe output, and signal relationships. Its 68-module architecture is **not** being ported as a whole.

### Visual approach

Early home-computer and arcade-era creativity, around **1980–1993**, interpreted as a coherent original screen system: precise pixels, restricted color palettes, procedural patterns, chip surfaces, an original walking Bug, and animated signal routes. No recognizable characters, stage maps, or copyrighted sprites are copied from historic games.

The **music comes first**. Graphic complexity should justify itself by making the instrument easier or more rewarding to play.
