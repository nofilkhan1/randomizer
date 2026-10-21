import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ALL_ROLLS, ELIGIBLE_PERFORMERS } from '../data/rolls';
import { getDecelerationTimes, useRoulette } from './useRoulette';

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
    expect(random).toHaveBeenCalledTimes(2);

    random.mockReturnValue(0.99);
    const seen = new Set<string>();
    let previousTime = 0;
    for (const time of getDecelerationTimes()) {
      act(() => vi.advanceTimersByTime(time - previousTime));
      previousTime = time;
      seen.add(result.current.displayedRoll);
    }
    const times = getDecelerationTimes();
    const intervals = times.map((time, index) => time - (times[index - 1] ?? 0));
    expect(intervals.at(-1)).toBeGreaterThan(intervals[0] ?? 0);
    expect(times.at(-1)).toBe(6500);
    expect(ALL_ROLLS.every((roll) => seen.has(roll))).toBe(true);
    expect(result.current.displayedRoll).toBe(ELIGIBLE_PERFORMERS[0]);
    expect(random).toHaveBeenCalledTimes(2);
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
