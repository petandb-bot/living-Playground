# LIVING PLAYGROUND

*A small electronic music world inhabited by tiny machines and curious bugs.*

LIVING PLAYGROUND is a playful browser instrument. You place a handful of sound chips on a stage, connect them to create musical relationships, and perform by tapping, holding, and moving things. Small original creatures walk along connections, investigate sounds, and react to the machine's activity.

It is **not** a traditional modular synthesizer, a puzzle game, a 1980s arcade-game replica, or a generative screensaver. The primary activity is making music; watching and interacting with the little world should make that activity more inviting.

## Design principles

1. **Simple pieces, surprising relationships.** Every chip is meaningful alone. Putting two or three together produces behavior worth exploring; the player should not need to learn signal routing to start.
2. **A musical foothold.** Rhythm, rests, pitch neighborhoods, and short remembered motives make a patch usable. Complexity is introduced by interaction rather than by endless random notes.
3. **Strange but playable sound.** Bent FM, plastic/rubber percussion, synthetic syllables, warped grains and occasionally uncomfortable timbres are welcome. Unwanted clicks, DC buildup, runaway feedback and clipping are not.
4. **The screen has a reason to move.** Musical events affect the bugs and chip animations. Autonomous visual life has no hidden effect on sound unless explicitly enabled.
5. **User agency and reversibility.** Touch produces immediate, predictable intent even when its sonic outcome is unusual. Record, mutate, undo, save and return.
6. **Lightweight, clear, mobile-first.** A high-resolution interpretation of early arcade playfields, not enlarged coarse pixel art or recognisable game characters.

## Initial musical vocabulary

The first build targets **six chip roles**, not 68 modules:

| Chip | Plays / changes | Primary gesture |
| --- | --- | --- |
| THUMP | Rubber-bodied percussion: FM thuds, knocks, dry clicks | Tap / hold to change force and decay |
| CHIRP | Bent pitched electronics, small FM creatures, awkward harmonics | Tap / slide to bend pitch |
| MUMBLE | Short synthetic syllables and metallic vocal fragments | Tap / hold to alter articulation |
| TICK | Pulse and sparse rhythmic event patterns, with gaps | Tap to vary density, hold for a temporary change |
| MUTANT | Selectable stutter / reverse / tape-bend / crush transformation | Touch to preview a change; release to return |
| NEST | Remember recent events and return them as a short motif | Capture, replay and gently mutate |

This is a **design target**, not a claim that these chips are implemented. Start with THUMP, CHIRP, TICK and one Bug; add MUMBLE, MUTANT and NEST incrementally.

## The stage

- A single canvas shows a few movable chips and their visible relationships. Initially cap the simultaneous active set at **four chips**.
- Tap a sound chip to play. A selected chip exposes no more than **two primary controls**; deeper options remain hidden.
- Create a relationship intentionally using a small **LINK** affordance, then tap another chip. The stage draws a visible route that creatures can traverse. Moving chips alone must not silently change routing.
- Link meaning is role-based: **TICK → voice** sends events, **voice → MUTANT** processes audio, **voice → NEST** records musical events, **NEST → voice** replays them. Unsupported links do not activate.
- A playable scene is always available at first launch. Audio starts only after a user gesture.

## Tiny inhabitants

Bugs are original animated characters, **not** sprites or layouts copied from known arcade games. They may wander, ride a line, inspect a chip, knock, pause, carry a fragment or react to a transient. Their movement combines real musical events, local goals and slow autonomous behavior.

In v0.1 the bugs **respond to the audio world** but cannot silently modify the sound. Dragging a Bug onto a compatible chip may trigger an explicit performance action; future mischievous autonomous influence must be opt-in, limited and undoable.

## Audio references and reuse

- [WRONG NUMBER](https://github.com/petandb-bot/wrong-number): prioritize the *ROTTEN CARROT*, *TOY MALFUNCTION* and *BAD SPELLING* voice ideas, synthesized sound recipes, sparse beat generation, MUTATE/UNDO, and stutter/reverse/tape/crush methods.
- [SIGNAL MACHINES](https://github.com/petandb-bot/signal-machines-v1): selectively adapt reliable audio scheduling, master safety, recording, resonant processes, pitch relationships, deterministic testing, and the distinction between intentional roughness and defects.
- Do **not** copy full applications, 68 module systems, old UI layouts, 16-pad layout, recognizable sprites, third-party assets or unreviewed dependencies. Audit provenance and any applicable third-party notices before importing source.

## Project status

**Architecture / concept stage. No application implementation has started.**

Detailed design, interaction model, phased plan and acceptance criteria:
[docs/DESIGN.md](docs/DESIGN.md).

The repository is intentionally public. Source code, documentation and original artwork can be shared here when ready.
