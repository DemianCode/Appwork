import { describe, it, expect } from 'vitest';
import {
  normalizeHex, hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  parseRgb, parseHsl,
} from './colour-utils';

describe('normalizeHex', () => {
  it('accepts 6-digit hex with hash', () => expect(normalizeHex('#3366ff')).toBe('#3366ff'));
  it('accepts 6-digit hex without hash', () => expect(normalizeHex('3366FF')).toBe('#3366ff'));
  it('expands 3-digit hex', () => expect(normalizeHex('#f0a')).toBe('#ff00aa'));
  it('expands 3-digit hex without hash', () => expect(normalizeHex('fa3')).toBe('#ffaa33'));
  it('returns null for invalid input', () => {
    expect(normalizeHex('zzz')).toBe(null);
    expect(normalizeHex('')).toBe(null);
    expect(normalizeHex('#12345')).toBe(null);
  });
});

describe('hex/rgb round-trip', () => {
  const cases: Array<[string, [number, number, number]]> = [
    ['#000000', [0, 0, 0]],
    ['#ffffff', [255, 255, 255]],
    ['#3366ff', [51, 102, 255]],
    ['#ff8800', [255, 136, 0]],
  ];
  for (const [hex, rgb] of cases) {
    it(`${hex} ↔ rgb(${rgb.join(',')})`, () => {
      expect(hexToRgb(hex)).toEqual(rgb);
      expect(rgbToHex(rgb[0], rgb[1], rgb[2])).toBe(hex);
    });
  }
});

describe('rgb/hsl round-trip', () => {
  const cases: Array<[[number, number, number], [number, number, number]]> = [
    [[0, 0, 0], [0, 0, 0]],
    [[255, 255, 255], [0, 0, 100]],
    [[255, 0, 0], [0, 100, 50]],
    [[51, 102, 255], [225, 100, 60]],
  ];
  for (const [rgb, hsl] of cases) {
    it(`rgb(${rgb.join(',')}) → hsl(${hsl.join(',')}) and back`, () => {
      const out = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      expect(out[0]).toBeCloseTo(hsl[0], 0);
      expect(out[1]).toBeCloseTo(hsl[1], 0);
      expect(out[2]).toBeCloseTo(hsl[2], 0);
      const back = hslToRgb(out[0], out[1], out[2]);
      expect(back[0]).toBeCloseTo(rgb[0], 0);
      expect(back[1]).toBeCloseTo(rgb[1], 0);
      expect(back[2]).toBeCloseTo(rgb[2], 0);
    });
  }
});

describe('parseRgb', () => {
  it('accepts rgb() syntax', () => expect(parseRgb('rgb(51, 102, 255)')).toEqual([51, 102, 255]));
  it('accepts bare numbers', () => expect(parseRgb('51, 102, 255')).toEqual([51, 102, 255]));
  it('returns null on garbage', () => expect(parseRgb('not a colour')).toBe(null));
  it('returns null on out of range', () => expect(parseRgb('300, 0, 0')).toBe(null));
});

describe('parseHsl', () => {
  it('accepts hsl() syntax', () => expect(parseHsl('hsl(225, 100%, 60%)')).toEqual([225, 100, 60]));
  it('accepts bare numbers', () => expect(parseHsl('225, 100%, 60%')).toEqual([225, 100, 60]));
  it('accepts no percent sign', () => expect(parseHsl('225, 100, 60')).toEqual([225, 100, 60]));
  it('returns null on out-of-range hue', () => expect(parseHsl('400, 50, 50')).toBe(null));
  it('returns null on garbage', () => expect(parseHsl('xxx')).toBe(null));
});
