import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { FlowStepsWidget } from './FlowStepsWidget';

describe('FlowStepsWidget', () => {
  it('adds a step', () => {
    const onChange = vi.fn();
    render(<ThemeProvider><FlowStepsWidget field={{ key: 'steps', label: 'Steps', type: 'custom' }} value={[]} onChange={onChange} project={null} /></ThemeProvider>);
    fireEvent.click(screen.getByText('+ Add step'));
    expect(onChange).toHaveBeenCalled();
    const added = onChange.mock.calls[0]![0];
    expect(added).toHaveLength(1);
    expect(added[0].type).toBe('Action');
  });
});
