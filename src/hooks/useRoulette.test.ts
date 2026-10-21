import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ALL_ROLLS, FIXED_WINNER } from '../data/rolls';
import { getDecelerationTimes, useRoulette } from './useRoulette';

describe('useRoulette', () => {
  afterEach(() => vi.useRealTimers());

  it('locks out double starts and reveals the scripted winner selected at spin start', () => {
    vi.useFakeTimers();
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const { result, unmount } = renderHook(() => useRoulette());

    act(() => {
      result.current.spin();
      result.current.spin();
    });

    expect(result.current.phase).toBe('spinning');
    expect(result.current.winner).toBe(FIXED_WINNER);
    expect(random).toHaveBeenCalledTimes(1);

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
    expect(result.current.displayedRoll).toBe(FIXED_WINNER);
    expect(random).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(520));
    expect(result.current.phase).toBe('revealed');
    expect(result.current.displayedRoll).toBe(FIXED_WINNER);

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

  it('lands on the fixed winner for 100 spins, including every spin after reset', () => {
    vi.useFakeTimers();
    let hook = renderHook(() => useRoulette());

    for (let spin = 0; spin < 100; spin += 1) {
      act(() => hook.result.current.spin());
      expect(hook.result.current.winner).toBe('25L-0761');
      act(() => vi.advanceTimersByTime(7020));
      expect(hook.result.current.phase).toBe('revealed');
      expect(hook.result.current.displayedRoll).toBe('25L-0761');
      expect(hook.result.current.winner).toBe('25L-0761');
      act(() => hook.result.current.reset());
      expect(hook.result.current.phase).toBe('ready');
      expect(hook.result.current.displayedRoll).toBe('25L-0???');

      if ((spin + 1) % 25 === 0 && spin < 99) {
        hook.unmount();
        hook = renderHook(() => useRoulette());
        expect(hook.result.current.displayedRoll).toBe('25L-0???');
      }
    }

    hook.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels a pending reveal when reset during the final pause', () => {
    vi.useFakeTimers();
    const onReveal = vi.fn();
    const { result } = renderHook(() => useRoulette(onReveal));

    act(() => result.current.spin());
    act(() => vi.advanceTimersByTime(6500));
    expect(result.current.phase).toBe('spinning');
    expect(result.current.displayedRoll).toBe(FIXED_WINNER);

    act(() => result.current.reset());
    act(() => vi.advanceTimersByTime(520));
    expect(result.current.phase).toBe('ready');
    expect(result.current.displayedRoll).toBe('25L-0???');
    expect(onReveal).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
