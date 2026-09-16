// Regenerates the shipped mascot WebP assets (src/assets/mascot/Clip/) from
// the full-resolution PNG masters (src/assets/design-sources/Clip/). Run
// after replacing/adding source art: `node scripts/optimize-mascot.mjs`.
//
// The masters are ~800KB-1.6MB each (full illustration resolution) and are
// kept out of the published package; the library only ever imports the
// resized/compressed WebP derivatives this script produces.
import { readdir, mkdir } from 'node:fs/promises'
import { extname, basename, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = join(__dirname, '../src/assets/design-sources/Clip')
const OUTPUT_DIR = join(__dirname, '../src/assets/mascot/Clip')

// Matches the source illustrations' native aspect ratio (1129x1393); wide
// enough to stay sharp up to ~120px display size on a 2x display.
const TARGET_WIDTH = 240

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })
  const files = (await readdir(SOURCE_DIR)).filter((f) => extname(f).toLowerCase() === '.png')

  for (const file of files) {
    const name = basename(file, extname(file))
    const outPath = join(OUTPUT_DIR, `${name}.webp`)
    await sharp(join(SOURCE_DIR, file))
      .resize({ width: TARGET_WIDTH })
      .webp({ quality: 82 })
      .toFile(outPath)
    console.log(`✓ ${name}.webp`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
