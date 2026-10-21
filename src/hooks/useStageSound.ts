import { useCallback, useEffect, useRef } from 'react';

type AudioContextWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function useStageSound(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  const oscillatorsRef = useRef(new Set<OscillatorNode>());
  const timersRef = useRef<number[]>([]);
  enabledRef.current = enabled;
  const getContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const AudioContextConstructor = window.AudioContext ?? (window as AudioContextWindow).webkitAudioContext;
    if (!AudioContextConstructor) return null;
    contextRef.current ??= new AudioContextConstructor();
    if (contextRef.current.state === 'suspended') void contextRef.current.resume();
    return contextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType, volume: number, endFrequency = frequency) => {
    if (!enabledRef.current) return;
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
    oscillatorsRef.current.add(oscillator);
    oscillator.onended = () => oscillatorsRef.current.delete(oscillator);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }, [getContext]);

  const playSpin = useCallback(() => playTone(115, 1.4, 'sawtooth', 0.035, 520), [playTone]);
  const playReveal = useCallback(() => {
    playTone(392, 0.55, 'sine', 0.08, 784);
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((pending) => pending !== timer);
      playTone(523, 0.65, 'triangle', 0.055, 1046);
    }, 110);
    timersRef.current.push(timer);
  }, [playTone]);

  useEffect(() => {
    if (enabled) return;
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    oscillatorsRef.current.forEach((oscillator) => {
      try { oscillator.stop(); } catch { /* It may have ended before mute was applied. */ }
    });
    oscillatorsRef.current.clear();
    if (contextRef.current?.state === 'running') void contextRef.current.suspend();
  }, [enabled]);

  useEffect(() => () => {
    timersRef.current.forEach(window.clearTimeout);
    oscillatorsRef.current.forEach((oscillator) => {
      try { oscillator.stop(); } catch { /* It may have ended before cleanup ran. */ }
    });
    const context = contextRef.current;
    if (context && context.state !== 'closed') void context.close();
  }, []);

  return { playSpin, playReveal };
}
