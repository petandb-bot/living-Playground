# Art direction — a small living computer world

## Reference period

Visually draw from **roughly 1980–1993**, including early Japanese personal-computer games, original arcade graphics, 16-bit era sprite craft, limited-color computer illustrations, practical tile graphics and small software-made animations. Do not emulate any single console, game, character or manufacturer’s interface.

The important historical idea is **expressiveness under constraints**: few colors, clear silhouettes, deliberate 1-pixel highlights, motion from a handful of poses, and subtle dithering to give objects depth. This is not VHS noise, scanline filters or low-resolution nostalgia for its own sake.

## Initial visual system

- **Logical playfield:** 480×300 pixels, scaled with nearest-neighbor rendering. Pixel dimensions remain clear; primary DOM controls remain readable at actual mobile sizes.
- **Palette:** dark navy stage; honey/yellow for rhythm, warm coral for percussion, mint/cyan for pitched electronics, pale cream for selection and text, one acidic green for the original Bug.
- **Texture:** a restrained ordered-stipple background plus occasional colored pixels. Avoid visual static that hides links, chips or states.
- **Chip language:** cropped corners, shallow embossed borders, control-panel nameplates and tiny displays. Each has distinct rhythmic or acoustic visualization; no generic animated equalizers pasted on everything.
- **Link language:** segmented dotted paths showing a relationship, with restrained moving carriers and accessible selection state. Bugs use the same geometry to navigate.
- **Bug:** tiny original soft-shelled electronic creature, a few poses, readable eyes/antennae and two or three non-syncopated little gestures. Musical events can interrupt walking; autonomous behavior cannot change sound in the alpha.
- **Motion:** audio-time events first, low-rate independent behaviors second. No per-frame stochastic sound decisions. Respect reduced-motion preference in a later pass.
- **Controls:** English, practical, and small in number. Do not replace legible touch targets with 8px graphical buttons.

## What to refine after listening

1. Does THUMP/CHIRP/TICK produce genuinely interesting music with only two controls each?
2. Can someone understand LINK without reading the manual?
3. Does the Bug feel like an inhabitant of the sound world, not an animated sticker?
4. Are chips large enough on a narrow phone and expressive enough on desktop?
5. Can we preserve the characteristic fragile or lopsided sounds while removing faults?

Animation polish and additional sprites come **after** sound quality, playability and dependable scheduling.
