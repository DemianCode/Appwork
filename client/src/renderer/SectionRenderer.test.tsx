import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionRenderer } from './SectionRenderer';
import { ThemeProvider } from '@/theme/ThemeProvider';
import type { SectionConfig, Project } from '@/schema/types';

const cfg: SectionConfig = {
  id: 'overview', title: 'Overview', group: 'core', icon: '◈',
  intro: 'Start here.', shape: 'object',
  fields: [{ key: 'name', label: 'Name', type: 'text' }],
};
const project: Project = { id: 'p', meta: { name: 'P', createdAt: '', updatedAt: '', schemaVersion: 1 }, sections: {} };

describe('SectionRenderer', () => {
  it('renders heading and intro, dispatches field changes', () => {
    const onChange = vi.fn();
    render(<ThemeProvider><SectionRenderer config={cfg} value={{}} onChange={onChange} project={project} /></ThemeProvider>);
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByText(/start here/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'foo' } });
    expect(onChange).toHaveBeenCalledWith({ name: 'foo' });
  });
});
