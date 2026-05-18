import { useEffect, useRef, CSSProperties } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  single?: boolean;
  baseStyle: CSSProperties;
  ariaLabel?: string;
};

export function AutoField({ value, onChange, placeholder, single, baseStyle, ariaLabel }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      aria-label={ariaLabel}
      style={{ ...baseStyle, overflow: 'hidden', resize: 'none', minHeight: single ? 38 : 54, lineHeight: 1.55 }}
    />
  );
}
