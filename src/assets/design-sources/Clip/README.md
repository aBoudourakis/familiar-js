# Clip mascot — source art

Full-resolution originals (1129×1393) for the built-in "Clip" mascot preset.
These are the masters `scripts/optimize-mascot.mjs` resizes/compresses into
the WebP files actually imported by `src/mascot/presets.ts` — the library
never ships these PNGs (~800KB–1.6MB each) directly.

Kept under `src/assets/design-sources/` rather than `src/assets/mascot/` so
they aren't picked up by anything that imports from the mascot directory.

Each file is named after the mascot state it represents — `idle`, `hover`,
`thinking`, `focused`, `closing`, `closed` — matching the shipped WebP
filenames 1:1. Other mascot presets (e.g. `Lens`) follow the same
per-preset-folder, per-state-filename convention; a preset supplied as
pre-optimized WebP directly (no PNG masters checked in here) is simply
skipped by the optimize script.

Regenerate the shipped assets for every preset that has masters here:

```bash
node scripts/optimize-mascot.mjs
```
