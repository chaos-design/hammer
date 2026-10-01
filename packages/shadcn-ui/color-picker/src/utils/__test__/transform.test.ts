import { describe, expect, it } from 'vitest';
import { hexToHsb, hsbToHex, hsbToRgb, rgbToHsb } from '../transform';

describe('hexToHsb', () => {
  it('parses a 6-digit hex', () => {
    expect(hexToHsb('#ff0000')).toEqual({ h: 0, s: 100, b: 100 });
    expect(hexToHsb('#00ff00')).toEqual({ h: 120, s: 100, b: 100 });
    expect(hexToHsb('#0000ff')).toEqual({ h: 240, s: 100, b: 100 });
  });

  it('accepts the 3-digit shorthand', () => {
    expect(hexToHsb('#f00')).toEqual(hexToHsb('#ff0000'));
    expect(hexToHsb('#fff')).toEqual(hexToHsb('#ffffff'));
  });

  it('accepts a hex without the leading hash', () => {
    expect(hexToHsb('ff0000')).toEqual(hexToHsb('#ff0000'));
  });

  it('parses greys as unsaturated', () => {
    expect(hexToHsb('#808080')).toEqual({ h: 0, s: 0, b: 50 });
    expect(hexToHsb('#000000')).toEqual({ h: 0, s: 0, b: 0 });
  });

  it('never returns NaN for unparseable input', () => {
    for (const input of ['', 'red', '#12345', 'zzzzzz', null, undefined, 42]) {
      const result = hexToHsb(input as string);

      expect(Number.isNaN(result.h)).toBe(false);
      expect(Number.isNaN(result.s)).toBe(false);
      expect(Number.isNaN(result.b)).toBe(false);
    }
  });

  it('falls back to black for unparseable input', () => {
    expect(hexToHsb('red')).toEqual({ h: 0, s: 0, b: 0 });
  });

  it('ignores surrounding whitespace', () => {
    expect(hexToHsb('  #ff0000  ')).toEqual({ h: 0, s: 100, b: 100 });
  });
});

describe('hsbToHex', () => {
  it('converts the primary colours', () => {
    expect(hsbToHex(0, 100, 100)).toBe('#ff0000');
    expect(hsbToHex(120, 100, 100)).toBe('#00ff00');
    expect(hsbToHex(240, 100, 100)).toBe('#0000ff');
  });

  it('always emits 6 digits', () => {
    expect(hsbToHex(0, 0, 0)).toMatch(/^#[\da-f]{6}$/);
    expect(hsbToHex(60, 100, 100)).toBe('#ffff00');
  });

  it('clamps out-of-range saturation and brightness', () => {
    expect(hsbToHex(0, 500, 500)).toBe('#ff0000');
    expect(hsbToHex(0, -50, -50)).toBe('#000000');
  });

  it('wraps hue outside 0-360', () => {
    // 240 and -120 are the same hue.
    expect(hsbToHex(-120, 100, 100)).toBe(hsbToHex(240, 100, 100));
    expect(hsbToHex(480, 100, 100)).toBe(hsbToHex(120, 100, 100));
  });
});

describe('hsbToRgb', () => {
  it('converts the primary colours', () => {
    expect(hsbToRgb(0, 100, 100)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hsbToRgb(120, 100, 100)).toEqual({ r: 0, g: 255, b: 0 });
    expect(hsbToRgb(240, 100, 100)).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('clamps out-of-range inputs', () => {
    expect(hsbToRgb(0, 500, 500)).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe('round trips', () => {
  const colors = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffffff',
    '#000000',
    '#808080',
  ];

  it.each(colors)('hsb -> hex -> hsb preserves %s', (hex) => {
    expect(
      hsbToHex(...(Object.values(hexToHsb(hex)) as [number, number, number])),
    ).toBe(hex);
  });

  it.each(colors)('rgb -> hsb matches hexToHsb for %s', (hex) => {
    expect(
      rgbToHsb(
        hsbToRgb(...(Object.values(hexToHsb(hex)) as [number, number, number])),
      ),
    ).toEqual(hexToHsb(hex));
  });
});
