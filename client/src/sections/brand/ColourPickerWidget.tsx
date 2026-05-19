import { useEffect, useState } from 'react';
import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useTheme } from '@/theme/useTheme';
import {
  normalizeHex, hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  parseRgb, parseHsl,
} from './colour-utils';

export function ColourPickerWidget({ value, onChange }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const hex = typeof value === 'string' ? value : '';
  const valid = !!normalizeHex(hex);

  const [hexInput, setHexInput] = useState(hex);
  const [rgbInput, setRgbInput] = useState('');
  const [hslInput, setHslInput] = useState('');
  const [errs, setErrs] = useState<{ hex?: boolean; rgb?: boolean; hsl?: boolean }>({});

  useEffect(() => {
    if (!valid) {
      setHexInput(hex);
      setRgbInput('');
      setHslInput('');
      return;
    }
    const [r, g, b] = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    setHexInput(hex);
    setRgbInput(`${r}, ${g}, ${b}`);
    setHslInput(`${h}, ${s}%, ${l}%`);
    setErrs({});
  }, [hex, valid]);

  const commitHex = () => {
    const n = normalizeHex(hexInput);
    if (n) { onChange(n); setErrs((e) => ({ ...e, hex: false })); }
    else setErrs((e) => ({ ...e, hex: true }));
  };
  const commitRgb = () => {
    const rgb = parseRgb(rgbInput);
    if (rgb) { onChange(rgbToHex(rgb[0], rgb[1], rgb[2])); setErrs((e) => ({ ...e, rgb: false })); }
    else setErrs((e) => ({ ...e, rgb: true }));
  };
  const commitHsl = () => {
    const hsl = parseHsl(hslInput);
    if (hsl) { const [r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2]); onChange(rgbToHex(r, g, b)); setErrs((e) => ({ ...e, hsl: false })); }
    else setErrs((e) => ({ ...e, hsl: true }));
  };

  const inputStyle = (err?: boolean): React.CSSProperties => ({
    padding: '6px 8px',
    border: `1px solid ${err ? C.red : C.border}`,
    borderRadius: 6,
    background: C.surface,
    color: C.text,
    fontFamily: 'inherit',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box',
  });

  const swatchColor = valid ? hex : 'transparent';

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 12 }}>
      <label style={{
        position: 'relative', width: 56, height: 56, borderRadius: 8,
        border: `1px solid ${C.border}`, background: swatchColor,
        backgroundImage: valid ? 'none' : `repeating-linear-gradient(45deg, ${C.dim}, ${C.dim} 4px, transparent 4px, transparent 8px)`,
        cursor: 'pointer', flexShrink: 0,
      }} aria-label="Pick colour visually">
        <input
          type="color"
          value={valid ? hex : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 6, flex: 1, minWidth: 220 }}>
        <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>HEX</span>
        <input
          aria-label="HEX value"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => e.key === 'Enter' && commitHex()}
          placeholder="#000000"
          style={inputStyle(errs.hex)}
        />
        <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>RGB</span>
        <input
          aria-label="RGB value"
          value={rgbInput}
          onChange={(e) => setRgbInput(e.target.value)}
          onBlur={commitRgb}
          onKeyDown={(e) => e.key === 'Enter' && commitRgb()}
          placeholder="0, 0, 0"
          style={inputStyle(errs.rgb)}
        />
        <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>HSL</span>
        <input
          aria-label="HSL value"
          value={hslInput}
          onChange={(e) => setHslInput(e.target.value)}
          onBlur={commitHsl}
          onKeyDown={(e) => e.key === 'Enter' && commitHsl()}
          placeholder="0, 0%, 0%"
          style={inputStyle(errs.hsl)}
        />
      </div>
    </div>
  );
}
