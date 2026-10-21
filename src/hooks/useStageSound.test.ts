import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useStageSound } from './useStageSound';

describe('useStageSound', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('stops active audio and cancels delayed reveal tones when muted', () => {
    vi.useFakeTimers();
    const oscillator = {
      type: 'sine' as OscillatorType,
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as (() => void) | null,
    };
    const gain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    let context: AudioContext;
    const suspend = vi.fn(() => {
      Object.defineProperty(context, 'state', { configurable: true, value: 'suspended' });
      return Promise.resolve();
    });
    context = {
      state: 'running',
      currentTime: 0,
      destination: {} as AudioNode,
      createOscillator: vi.fn(() => oscillator as unknown as OscillatorNode),
      createGain: vi.fn(() => gain as unknown as GainNode),
      suspend,
      resume: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
    } as unknown as AudioContext;
    vi.stubGlobal('AudioContext', class {
      constructor() { return context; }
    });

    const { result, rerender, unmount } = renderHook(({ enabled }) => useStageSound(enabled), { initialProps: { enabled: true } });
    act(() => result.current.playReveal());
    expect(oscillator.start).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);

    rerender({ enabled: false });
    expect(oscillator.stop).toHaveBeenCalled();
    expect(suspend).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);

    vi.advanceTimersByTime(200);
    expect(oscillator.start).toHaveBeenCalledTimes(1);
    unmount();
  });
});
