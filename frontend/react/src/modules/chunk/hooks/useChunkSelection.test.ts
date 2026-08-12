import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useChunkSelection } from './useChunkSelection';

describe('useChunkSelection', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useChunkSelection());
    expect(Array.from(result.current.selectedIds)).toEqual([]);
  });

  it('toggles single id', () => {
    const { result } = renderHook(() => useChunkSelection());

    act(() => {
      result.current.toggle('a', true);
    });
    expect(Array.from(result.current.selectedIds).sort()).toEqual(['a']);

    act(() => {
      result.current.toggle('a', false);
    });
    expect(Array.from(result.current.selectedIds)).toEqual([]);
  });

  it('selectAll selects and clears', () => {
    const { result } = renderHook(() => useChunkSelection());
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

    act(() => {
      result.current.selectAll(items, true);
    });
    expect(Array.from(result.current.selectedIds).sort()).toEqual(['a', 'b', 'c']);

    act(() => {
      result.current.selectAll(items, false);
    });
    expect(Array.from(result.current.selectedIds)).toEqual([]);
  });

  it('isAllSelected reflects selection state', () => {
    const { result } = renderHook(() => useChunkSelection());
    const items = [{ id: 'a' }, { id: 'b' }];

    expect(result.current.isAllSelected(items)).toBe(false);

    act(() => {
      result.current.toggle('a', true);
    });
    expect(result.current.isAllSelected(items)).toBe(false);

    act(() => {
      result.current.toggle('b', true);
    });
    expect(result.current.isAllSelected(items)).toBe(true);
  });

  it('clear resets selection', () => {
    const { result } = renderHook(() => useChunkSelection());

    act(() => {
      result.current.toggle('a', true);
      result.current.toggle('b', true);
    });
    expect(Array.from(result.current.selectedIds).sort()).toEqual(['a', 'b']);

    act(() => {
      result.current.clear();
    });
    expect(Array.from(result.current.selectedIds)).toEqual([]);
  });

  it('isSomeSelected reflects partial selection state', () => {
    const { result } = renderHook(() => useChunkSelection());
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

    expect(result.current.isSomeSelected(items)).toBe(false);

    act(() => {
      result.current.toggle('a', true);
    });
    expect(result.current.isSomeSelected(items)).toBe(true);

    act(() => {
      result.current.toggle('b', true);
      result.current.toggle('c', true);
    });
    // All selected is still "some selected"
    expect(result.current.isSomeSelected(items)).toBe(true);

    act(() => {
      result.current.toggle('a', false);
      result.current.toggle('b', false);
      result.current.toggle('c', false);
    });
    expect(result.current.isSomeSelected(items)).toBe(false);
  });

  it('selectAll merges with existing selections (multi-page safe)', () => {
    const { result } = renderHook(() => useChunkSelection());
    const page1 = [{ id: 'a' }, { id: 'b' }];
    const page2 = [{ id: 'c' }, { id: 'd' }];

    act(() => {
      result.current.selectAll(page1, true);
    });
    expect(Array.from(result.current.selectedIds).sort()).toEqual(['a', 'b']);

    act(() => {
      result.current.selectAll(page2, true);
    });
    expect(Array.from(result.current.selectedIds).sort()).toEqual(['a', 'b', 'c', 'd']);

    // Deselect only page2 items
    act(() => {
      result.current.selectAll(page2, false);
    });
    expect(Array.from(result.current.selectedIds).sort()).toEqual(['a', 'b']);
  });
});

