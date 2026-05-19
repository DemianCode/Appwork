import { useRef, useState } from 'react';
import type { FieldRendererProps } from '@/renderer/FieldRenderer';
import { useTheme } from '@/theme/useTheme';
import { AutoField } from '@/renderer/AutoField';
import { styles } from '@/renderer/styles';

const DEFAULT_TONES = ['formal', 'playful', 'calm', 'bold', 'warm', 'serious', 'minimal', 'expressive'];

type ToneSlot = {
  words?: string[];
  customWords?: string[];
  description?: string;
  voiceNotes?: string;
};

export function ToneChips({
  words, customWords, onChange,
}: {
  words: string[];
  customWords: string[];
  onChange: (next: { words: string[]; customWords: string[] }) => void;
}) {
  const { tokens: C } = useTheme();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const all = [...DEFAULT_TONES, ...customWords];
  const isCustom = (w: string) => customWords.includes(w);
  const isSelected = (w: string) => words.includes(w);

  const toggle = (w: string) => {
    const next = isSelected(w) ? words.filter((x) => x !== w) : [...words, w];
    onChange({ words: next, customWords });
  };

  const removeCustom = (w: string) => {
    onChange({ words: words.filter((x) => x !== w), customWords: customWords.filter((x) => x !== w) });
  };

  const commitDraft = () => {
    const v = draft.trim();
    setDraft('');
    setAdding(false);
    if (!v) return;
    if (all.includes(v)) return;
    onChange({ words: [...words, v], customWords: [...customWords, v] });
  };

  const chip = (w: string) => {
    const on = isSelected(w);
    return (
      <span key={w} style={{ position: 'relative', display: 'inline-flex' }}>
        <button
          type="button"
          aria-pressed={on}
          aria-label={w}
          onClick={() => toggle(w)}
          style={{
            padding: '5px 11px',
            paddingRight: isCustom(w) ? 24 : 11,
            borderRadius: 16, fontSize: 12,
            background: on ? C.accentDim : 'transparent',
            border: `1px solid ${on ? C.accent : C.border}`,
            color: on ? C.text : C.muted, cursor: 'pointer',
          }}
        >{w}</button>
        {isCustom(w) && (
          <button
            type="button"
            aria-label={`Remove ${w}`}
            onClick={() => removeCustom(w)}
            style={{
              position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
              width: 16, height: 16, border: 'none', background: 'transparent',
              color: C.muted, cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0,
            }}
          >×</button>
        )}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {all.map(chip)}
      {!adding ? (
        <button
          type="button"
          aria-label="Add tone word"
          onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 0); }}
          style={{
            padding: '5px 11px', borderRadius: 16, fontSize: 12,
            background: 'transparent', border: `1px dashed ${C.border}`,
            color: C.muted, cursor: 'pointer',
          }}
        >+ Add</button>
      ) : (
        <input
          ref={inputRef}
          value={draft}
          placeholder="tone word"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitDraft();
            else if (e.key === 'Escape') { setDraft(''); setAdding(false); }
          }}
          onBlur={commitDraft}
          style={{
            padding: '5px 11px', borderRadius: 16, fontSize: 12,
            background: C.surface, border: `1px solid ${C.accent}`,
            color: C.text, outline: 'none', width: 110,
          }}
        />
      )}
    </div>
  );
}

export function BrandToneWidget({ value, onChange }: FieldRendererProps) {
  const { tokens: C } = useTheme();
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  const s = styles(C, mobile);
  const slot = (value ?? {}) as ToneSlot;
  const words = Array.isArray(slot.words) ? slot.words : [];
  const customWords = Array.isArray(slot.customWords) ? slot.customWords : [];
  const description = typeof slot.description === 'string' ? slot.description : '';
  const voiceNotes = typeof slot.voiceNotes === 'string' ? slot.voiceNotes : '';

  const update = (patch: Partial<ToneSlot>) => onChange({ ...slot, ...patch });

  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: mobile ? 14 : 18 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={s.lbl}>Tone words</label>
        <ToneChips words={words} customWords={customWords} onChange={(next) => update(next)} />
        <span style={s.hint}>Pick all that apply. Use + Add to introduce custom words.</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={s.lbl}>Tone description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <AutoField
          baseStyle={s.fb}
          value={description}
          onChange={(v) => update({ description: v })}
          placeholder="A free-text description of how the brand should feel."
          ariaLabel="Tone description"
        />
      </div>
      <div>
        <label style={s.lbl}>Voice notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <AutoField
          baseStyle={s.fb}
          value={voiceNotes}
          onChange={(v) => update({ voiceNotes: v })}
          placeholder="How copy should sound — friendly, terse, no jargon, etc."
          ariaLabel="Voice notes"
        />
      </div>
    </div>
  );
}
