import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ELIGIBLE_PERFORMERS } from '../data/rolls';
import { useRoulette } from './useRoulette';

describe('useRoulette', () => {
  afterEach(() => vi.useRealTimers());

  it('locks out double starts and reveals the single winner selected at spin start', () => {
    vi.useFakeTimers();
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const { result, unmount } = renderHook(() => useRoulette());

    act(() => {
      result.current.spin();
      result.current.spin();
    });

    expect(result.current.phase).toBe('spinning');
    expect(result.current.winner).toBe(ELIGIBLE_PERFORMERS[0]);
    expect(random).toHaveBeenCalledTimes(1);

    random.mockReturnValue(0.99);
    act(() => vi.advanceTimersByTime(6500));
    expect(result.current.displayedRoll).toBe(ELIGIBLE_PERFORMERS[0]);
    act(() => vi.advanceTimersByTime(520));
    expect(result.current.phase).toBe('revealed');
    expect(result.current.displayedRoll).toBe(result.current.winner);

    unmount();
    random.mockRestore();
  });

  it('resets without starting a new spin', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useRoulette());
    act(() => result.current.spin());
    act(() => result.current.reset());
    expect(result.current.phase).toBe('ready');
    expect(result.current.winner).toBeNull();
    expect(result.current.displayedRoll).toBe('25L-0???');
    expect(vi.getTimerCount()).toBe(0);
  });
});
