import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldRenderer } from './FieldRenderer';
import { ThemeProvider } from '@/theme/ThemeProvider';

const wrap = (ui: React.ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('FieldRenderer', () => {
  it('renders a text field and propagates changes', () => {
    const onChange = vi.fn();
    wrap(<FieldRenderer field={{ key: 'name', label: 'Name', type: 'text' }} value="" onChange={onChange} project={null} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Hi' } });
    expect(onChange).toHaveBeenCalledWith('Hi');
  });

  it('renders enum-chips and toggles selection', () => {
    const onChange = vi.fn();
    wrap(<FieldRenderer
      field={{ key: 't', label: 'Tone', type: 'enum-chips', options: ['warm', 'bold'] }}
      value={['warm']}
      onChange={onChange}
      project={null}
    />);
    fireEvent.click(screen.getByText('bold'));
    expect(onChange).toHaveBeenCalledWith(['warm', 'bold']);
  });
});
