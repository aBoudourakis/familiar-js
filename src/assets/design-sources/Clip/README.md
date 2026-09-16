# Clip mascot — source art

Full-resolution originals (1129×1393) for the built-in "Clip" mascot. These
are the masters `scripts/optimize-mascot.mjs` resizes/compresses into the
WebP files actually imported by `src/mascot/ClipMascot.ts` — the library
never ships these PNGs (~800KB–1.6MB each) directly.

Kept under `src/assets/design-sources/` rather than `src/assets/mascot/` so
they aren't picked up by anything that imports from the mascot directory.

Regenerate the shipped assets after replacing or adding source art:

```bash
node scripts/optimize-mascot.mjs
```
