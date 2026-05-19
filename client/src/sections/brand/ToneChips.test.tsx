import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToneChips } from './BrandToneWidget';
import { ThemeProvider } from '@/theme/ThemeProvider';

function setup(overrides: { words?: string[]; customWords?: string[] } = {}) {
  const onChange = vi.fn();
  render(
    <ThemeProvider>
      <ToneChips
        words={overrides.words ?? []}
        customWords={overrides.customWords ?? []}
        onChange={onChange}
      />
    </ThemeProvider>
  );
  return { onChange };
}

describe('ToneChips', () => {
  it('renders all defaults', () => {
    setup();
    expect(screen.getByRole('button', { name: /^formal$/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^playful$/ })).toBeTruthy();
  });

  it('toggles selection', () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /^playful$/ }));
    expect(onChange).toHaveBeenCalledWith({ words: ['playful'], customWords: [] });
  });

  it('deselects when clicking selected chip', () => {
    const { onChange } = setup({ words: ['playful'] });
    fireEvent.click(screen.getByRole('button', { name: /^playful$/ }));
    expect(onChange).toHaveBeenCalledWith({ words: [], customWords: [] });
  });

  it('renders custom chips alongside defaults', () => {
    setup({ customWords: ['cosy'] });
    expect(screen.getByRole('button', { name: /^cosy$/ })).toBeTruthy();
  });

  it('adds a new word via + Add', () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Add tone word/i }));
    const input = screen.getByPlaceholderText('tone word');
    fireEvent.change(input, { target: { value: 'cosy' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith({ words: ['cosy'], customWords: ['cosy'] });
  });

  it('ignores duplicate adds', () => {
    const { onChange } = setup({ customWords: ['cosy'], words: ['cosy'] });
    fireEvent.click(screen.getByRole('button', { name: /Add tone word/i }));
    const input = screen.getByPlaceholderText('tone word');
    fireEvent.change(input, { target: { value: 'cosy' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a custom chip via × button', () => {
    const { onChange } = setup({ customWords: ['cosy'], words: ['cosy'] });
    fireEvent.click(screen.getByRole('button', { name: /Remove cosy/i }));
    expect(onChange).toHaveBeenCalledWith({ words: [], customWords: [] });
  });
});
