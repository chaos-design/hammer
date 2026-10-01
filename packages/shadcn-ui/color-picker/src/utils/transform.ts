export interface HsbColor {
  h: number;
  s: number;
  b: number;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const toHexPair = (n: number) => {
  const hex = clamp(Math.round(n), 0, 255).toString(16);

  return hex.length === 1 ? `0${hex}` : hex;
};

/** Convert HSB (h: 0-360, s/b: 0-100) to a `#rrggbb` string. */
export function hsbToHex(h: number, s: number, b: number): string {
  const saturation = clamp(s, 0, 100) / 100;
  const brightness = clamp(b, 0, 100) / 100;
  const hue = ((h % 360) + 360) % 360;

  const k = (n: number) => (n + hue / 60) % 6;
  const f = (n: number) =>
    brightness * (1 - saturation * clamp(Math.min(k(n), 4 - k(n)), 0, 1));

  return `#${toHexPair(f(5) * 255)}${toHexPair(f(3) * 255)}${toHexPair(f(1) * 255)}`;
}

/**
 * Convert a hex string to HSB.
 *
 * Accepts `#abc`, `abc`, `#aabbcc` and `aabbcc`, with or without the `#`.
 * Returns black (`{ h: 0, s: 0, b: 0 }`) for anything unparseable, so a bad
 * input can never produce `NaN` and poison downstream colour maths.
 */
export function hexToHsb(hex: string): HsbColor {
  if (typeof hex !== 'string') return { h: 0, s: 0, b: 0 };

  let value = hex.trim().replace(/^#/, '');

  if (/^[\da-f]{3}$/i.test(value)) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (!/^[\da-f]{6}$/i.test(value)) return { h: 0, s: 0, b: 0 };

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  return {
    h,
    s: max === 0 ? 0 : Math.round((delta / max) * 100),
    b: Math.round(max * 100),
  };
}

/** Convert HSB (h: 0-360, s/b: 0-100) to RGB (each 0-255). */
export function hsbToRgb(h: number, s: number, b: number): RgbColor {
  const saturation = clamp(s, 0, 100) / 100;
  const brightness = clamp(b, 0, 100) / 100;
  const hue = ((h % 360) + 360) % 360;

  const k = (n: number) => (n + hue / 60) % 6;
  const f = (n: number) =>
    brightness * (1 - saturation * clamp(Math.min(k(n), 4 - k(n)), 0, 1));

  return {
    r: Math.round(f(5) * 255),
    g: Math.round(f(3) * 255),
    b: Math.round(f(1) * 255),
  };
}

/** Convert an RGB triple (each 0-255) to HSB. */
export function rgbToHsb({ r, g, b }: RgbColor): HsbColor {
  const red = clamp(r, 0, 255) / 255;
  const green = clamp(g, 0, 255) / 255;
  const blue = clamp(b, 0, 255) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6;
    else if (max === green) h = (blue - red) / delta + 2;
    else h = (red - green) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  return {
    h,
    s: max === 0 ? 0 : Math.round((delta / max) * 100),
    b: Math.round(max * 100),
  };
}
