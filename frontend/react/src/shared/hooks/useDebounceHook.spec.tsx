import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounce } from './useDebounceHook';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() =>
      useDebounce('react', 400),
    );

    expect(result.current).toBe('react');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      {
        initialProps: {
          value: 'react',
        },
      },
    );

    expect(result.current).toBe('react');

    rerender({
      value: 'typescript',
    });

    expect(result.current).toBe('react');

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(result.current).toBe('react');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('typescript');
  });

  it('should clear previous timeout when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      {
        initialProps: {
          value: 'r',
        },
      },
    );

    rerender({ value: 're' });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'rea' });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'react' });

    act(() => {
      vi.advanceTimersByTime(399);
    });

    expect(result.current).toBe('r');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('react');
  });

  it('should debounce numbers', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: {
          value: 1,
        },
      },
    );

    rerender({
      value: 2,
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(2);
  });

  it('should debounce objects', () => {
    const first = { page: 1 };
    const second = { page: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: {
          value: first,
        },
      },
    );

    rerender({
      value: second,
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(second);
  });
});