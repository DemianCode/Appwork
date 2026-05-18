import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionsNav } from './SectionsNav';
import { ThemeProvider } from '@/theme/ThemeProvider';

vi.mock('@/schema/sections', () => ({
  SECTIONS: [
    { id: 'overview', title: 'Overview', group: 'core', icon: '●', intro: '', shape: 'object', fields: [] },
    { id: 'logic', title: 'Logic', group: 'logic', icon: '◆', intro: '', shape: 'object', fields: [] },
    { id: 'logicRules', title: 'Rules', group: 'logic', icon: '·', intro: '', shape: 'list', fields: [], parentId: 'logic' },
    { id: 'logicGroups', title: 'Groups', group: 'logic', icon: '·', intro: '', shape: 'list', fields: [], parentId: 'logic' },
  ],
}));

function renderNav(props: Partial<React.ComponentProps<typeof SectionsNav>> = {}) {
  return render(
    <ThemeProvider>
      <SectionsNav
        current={props.current ?? 'overview'}
        counts={{}}
        onSelect={vi.fn()}
        open
        onClose={() => {}}
      />
    </ThemeProvider>
  );
}

describe('SectionsNav accordion', () => {
  beforeEach(() => localStorage.clear());

  it('hides children of a collapsed parent', () => {
    renderNav({ current: 'overview' });
    expect(screen.queryByRole('button', { name: /^Rules/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Groups/ })).toBeNull();
  });

  it('auto-expands the parent of the active section', () => {
    renderNav({ current: 'logicRules' });
    expect(screen.getByRole('button', { name: /Rules/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Groups/ })).toBeTruthy();
  });

  it('toggles via chevron and persists to localStorage', () => {
    renderNav({ current: 'overview' });
    const chevron = screen.getByRole('button', { name: /Toggle Logic/i });
    fireEvent.click(chevron);
    expect(screen.getByRole('button', { name: /Rules/ })).toBeTruthy();
    expect(localStorage.getItem('appwork.nav.expanded')).toContain('"logic":true');
  });

  it('hydrates expanded state from localStorage', () => {
    localStorage.setItem('appwork.nav.expanded', JSON.stringify({ logic: true }));
    renderNav({ current: 'overview' });
    expect(screen.getByRole('button', { name: /Rules/ })).toBeTruthy();
  });
});
