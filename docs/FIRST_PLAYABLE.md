# First playable — v0.1.0-alpha.1

## Scope implemented

- Browser-native Web Audio synthesis: original two-oscillator and FM mixtures for THUMP and CHIRP, short silent-sparing TICK, limited delay, cautious sub-bass handling, rounded master saturation and protection.
- 16-step seeded musical pattern generator with fixed pulse/melodic anchors, optional gaps and density-driven details; 70–160 BPM and adjustable density/swing.
- Two-parameter modules with instant manual performance, plus TICK→voice links and short-lived THUMP↔CHIRP event-based influence. No audio-rate feedback between voices.
- Relationship-preserving NEW and partial MUTATE with Undo. Scene is saved in local storage, schema validated on load, and bounded to four chips.
- An original small pixel-creature; visual activity follows real scheduled audio events. Moving the Bug onto a chip is an explicit knock. The autonomous behavior never modifies the audio graph.
- Pixel-based 480×300 Canvas renderer, mobile CSS controls, separate voice role-selection buttons and searchable contextual HELP (simple, static instructions).

## Explicit limits

- Only THUMP, CHIRP and TICK are implemented. Further planned chips such as MUMBLE / MUTANT / NEST are not present.
- Recording and WAV download are future steps. Do not call the current project a recording system.
- Local project state can be lost if browser storage is cleared, or on unsupported/private contexts.
- iPhone Safari real-device sound, background resume, mobile touch and long-running performance are **not yet verified**.
- Browser smoke was performed with Chromium by inlining identical modules into an isolated about:blank page (the available browser environment blocks local HTTP/file URL navigation). The real module-loading/hosting path still needs a deployed static-origin check.

## Checks actually performed

- Node unit tests for rhythm anchors, regeneration, mutation, MIDI-style pitch choices, connection rules, scene validation, audio parameter ranges and rendering world behavior.
- JavaScript syntax checks and static build, dependency-free.
- Chromium headless smoke: startup, PLAY, MUTATE, UNDO, LINK; checked for page errors and mobile 390px horizontal overflow. No listening-quality evaluation possible from automated tests.

## Next steps

1. Listen on desktop and iPhone and adjust the THUMP/CHIRP balance before adding complexity.
2. Evaluate whether changes caused by THUMP→CHIRP and CHIRP→THUMP links are distinct, playable and musically appealing.
3. Add richer simple material transformation (MUTANT) and a small one-time reply that stays out of the way of playing.
4. Add NEST for capture/mutation of events and then PCM recording/export, keeping audio memory separate from the scene JSON.
