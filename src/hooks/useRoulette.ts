import { useCallback, useEffect, useRef, useState } from 'react';
import { ALL_ROLLS, type EligiblePerformer, type RollNumber } from '../data/rolls';
import { selectDecoy, selectWinner } from '../lib/selection';

export type RoulettePhase = 'ready' | 'spinning' | 'revealed';
const SPIN_DURATION_MS = 6500;
const REVEAL_PAUSE_MS = 520;

function getDecelerationTimes(): number[] {
  // 52 ticks ensure all 46 roll numbers pass through the slot every spin.
  const intervals = 52;
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
    const startingIndex = ALL_ROLLS.indexOf(selectDecoy());
    setWinner(selectedWinner);
    setPhase('spinning');

    const times = getDecelerationTimes();
    times.forEach((time, tick) => {
      timersRef.current.push(setTimeout(() => {
        // A coprime stride gives the slot a scrambled-looking route through every roll.
        const index = (startingIndex + tick * 17) % ALL_ROLLS.length;
        const nextRoll = ALL_ROLLS[index] ?? ALL_ROLLS[0];
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
    setWinner(null);
    setDisplayedRoll('25L-0???');
    setPhase('ready');
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { phase, displayedRoll, winner, spin, reset } as const;
}
