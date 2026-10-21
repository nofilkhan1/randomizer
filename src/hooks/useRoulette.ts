import { useCallback, useEffect, useRef, useState } from 'react';
import { ALL_ROLLS, type EligiblePerformer, type RollNumber } from '../data/rolls';
import { selectDecoy, selectWinner } from '../lib/selection';

export type RoulettePhase = 'ready' | 'spinning' | 'revealed';
const SPIN_DURATION_MS = 6500;
const REVEAL_PAUSE_MS = 520;

function getDecelerationTimes(): number[] {
  const intervals = 38;
  return Array.from({ length: intervals }, (_, index) => {
    const progress = (index + 1) / intervals;
    return Math.round(SPIN_DURATION_MS * (1 - (1 - progress) ** 2.55));
  });
}

export function useRoulette(onReveal?: () => void) {
  const [phase, setPhase] = useState<RoulettePhase>('ready');
  const [displayedRoll, setDisplayedRoll] = useState<RollNumber | '25L-0???'>('25L-0???');
  const [winner, setWinner] = useState<EligiblePerformer | null>(null);
  const lockRef = useRef(false);
  const lastDecoyRef = useRef<RollNumber | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const spin = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current = true;
    clearTimers();

    // This is the sole outcome selection for the spin; frames only show decoys.
    const selectedWinner = selectWinner();
    setWinner(selectedWinner);
    setPhase('spinning');

    const times = getDecelerationTimes();
    times.forEach((time) => {
      timersRef.current.push(setTimeout(() => {
        const randomRoll = selectDecoy();
        const currentIndex = ALL_ROLLS.indexOf(randomRoll);
        const nextRoll = randomRoll === lastDecoyRef.current ? ALL_ROLLS[(currentIndex + 1) % ALL_ROLLS.length] ?? randomRoll : randomRoll;
        lastDecoyRef.current = nextRoll;
        setDisplayedRoll(nextRoll);
      }, time));
    });

    timersRef.current.push(setTimeout(() => {
      setDisplayedRoll(selectedWinner);
      timersRef.current.push(setTimeout(() => {
        setPhase('revealed');
        onRevealRef.current?.();
      }, REVEAL_PAUSE_MS));
    }, SPIN_DURATION_MS));
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    lockRef.current = false;
    lastDecoyRef.current = null;
    setWinner(null);
    setDisplayedRoll('25L-0???');
    setPhase('ready');
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { phase, displayedRoll, winner, spin, reset } as const;
}
