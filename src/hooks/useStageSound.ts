import { useCallback, useRef } from 'react';

type AudioContextWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function useStageSound(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const getContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const AudioContextConstructor = window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext;
    if (!AudioContextConstructor) return null;
    contextRef.current ??= new AudioContextConstructor();
    if (contextRef.current.state === 'suspended') void contextRef.current.resume();
    return contextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType, volume: number, endFrequency = frequency) => {
    if (!enabled) return;
    const context = getContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }, [enabled, getContext]);

  const playSpin = useCallback(() => playTone(115, 1.4, 'sawtooth', 0.035, 520), [playTone]);
  const playReveal = useCallback(() => {
    playTone(392, 0.55, 'sine', 0.08, 784);
    window.setTimeout(() => playTone(523, 0.65, 'triangle', 0.055, 1046), 110);
  }, [playTone]);

  return { playSpin, playReveal };
}
