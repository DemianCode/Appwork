export function normalizeHex(input: string): string | null {
  if (!input) return null;
  const cleaned = input.trim().toLowerCase().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/.test(cleaned)) {
    return '#' + cleaned.split('').map((c) => c + c).join('');
  }
  if (/^[0-9a-f]{6}$/.test(cleaned)) return '#' + cleaned;
  return null;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = normalizeHex(hex);
  if (!n) return [0, 0, 0];
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = ((h % 360) + 360) % 360 / 360;
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(hn + 1 / 3) * 255),
    Math.round(hue2rgb(hn) * 255),
    Math.round(hue2rgb(hn - 1 / 3) * 255),
  ];
}

export function parseRgb(input: string): [number, number, number] | null {
  if (!input) return null;
  const m = input.match(/^\s*(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?\s*$/i);
  if (!m) return null;
  const r = +m[1], g = +m[2], b = +m[3];
  if ([r, g, b].some((n) => n < 0 || n > 255)) return null;
  return [r, g, b];
}

export function parseHsl(input: string): [number, number, number] | null {
  if (!input) return null;
  const m = input.match(/^\s*(?:hsl\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*\)?\s*$/i);
  if (!m) return null;
  const h = +m[1], s = +m[2], l = +m[3];
  if (h < 0 || h > 360) return null;
  if (s < 0 || s > 100) return null;
  if (l < 0 || l > 100) return null;
  return [h, s, l];
}
