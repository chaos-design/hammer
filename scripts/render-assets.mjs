/**
 * Renders the SVG sources in assets/ to their committed PNG deliverables.
 *
 * The SVGs are the source of truth, but the PNGs are what GitHub and npm show:
 * neither will render an SVG referenced from a README. Keeping both means they
 * can drift apart silently, which is how unused gradients and orphaned filters
 * end up surviving in the sources, so the render is scripted rather than done
 * by hand.
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const assetsDir = path.join(rootDir, 'assets');

/**
 * Output pixel sizes are a design decision, not something derivable from the
 * SVG: the logo is authored at 128 but shipped at 2x and 4x for crispness on
 * hi-dpi surfaces. They are listed explicitly so the intent stays visible.
 */
const TARGETS = [
  { svg: 'banner.svg', png: 'banner.png', width: 1200, height: 420 },
  { svg: 'logo.svg', png: 'logo.png', width: 256, height: 256 },
  { svg: 'logo.svg', png: 'logo@512.png', width: 512, height: 512 },
];

// Rendering above the SVG's intrinsic size and then downsampling anti-aliases
// the hairline strokes and gradient stops far better than letting sharp scale
// the vector up to the target.
const DENSITY = 96;

let failures = 0;

for (const { svg, png, width, height } of TARGETS) {
  const source = path.join(assetsDir, svg);
  const target = path.join(assetsDir, png);

  if (!existsSync(source)) {
    console.error(`✗ ${png}: source ${svg} does not exist`);
    failures += 1;
    continue;
  }

  try {
    const { size } = await sharp(await readFile(source), { density: DENSITY })
      .resize(width, height)
      .png({ compressionLevel: 9 })
      .toFile(target);

    console.log(`✓ ${png}  ${width}x${height}  ${(size / 1024).toFixed(1)} kB`);
  } catch (error) {
    console.error(
      `✗ ${png}: ${error instanceof Error ? error.message : error}`,
    );
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\n${failures} asset(s) failed to render.`);
  process.exit(1);
}
