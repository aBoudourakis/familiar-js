// Regenerates the shipped mascot WebP assets (src/assets/mascot/<Name>/) from
// the full-resolution PNG masters (src/assets/design-sources/<Name>/). Run
// after replacing/adding source art: `node scripts/optimize-mascot.mjs`.
//
// Each mascot preset is a folder of masters (~800KB-1.6MB each, full
// illustration resolution) kept out of the published package; the library
// only ever imports the resized/compressed WebP derivatives this script
// produces, one file per state: idle/hover/thinking/focused/closing/closed.webp.
//
// A preset with no design-sources folder (art supplied pre-optimized, like
// Lens) is simply skipped — this script only regenerates what it has a
// master for.
import { readdir, mkdir } from 'node:fs/promises'
import { extname, basename, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOURCES_ROOT = join(__dirname, '../src/assets/design-sources')
const OUTPUT_ROOT = join(__dirname, '../src/assets/mascot')

// Matches the source illustrations' native aspect ratio; wide enough to stay
// sharp up to ~120px display size on a 2x display.
const TARGET_WIDTH = 240

async function listPresetDirs() {
  const entries = await readdir(SOURCES_ROOT, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

async function optimizePreset(name) {
  const sourceDir = join(SOURCES_ROOT, name)
  const outputDir = join(OUTPUT_ROOT, name)
  const files = (await readdir(sourceDir)).filter((f) => extname(f).toLowerCase() === '.png')
  if (files.length === 0) return

  await mkdir(outputDir, { recursive: true })

  for (const file of files) {
    const stateName = basename(file, extname(file))
    const outPath = join(outputDir, `${stateName}.webp`)
    await sharp(join(sourceDir, file))
      .resize({ width: TARGET_WIDTH })
      .webp({ quality: 82 })
      .toFile(outPath)
    console.log(`✓ ${name}/${stateName}.webp`)
  }
}

async function main() {
  const presets = await listPresetDirs()
  for (const preset of presets) {
    await optimizePreset(preset)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
