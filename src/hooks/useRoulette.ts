import { useCallback, useEffect, useRef, useState } from 'react';
import { ALL_ROLLS, type EligiblePerformer, type RollNumber } from '../data/rolls';
import { selectDecoy, selectWinner } from '../lib/selection';

export type RoulettePhase = 'ready' | 'spinning' | 'revealed';
const SPIN_DURATION_MS = 6500;
const REVEAL_PAUSE_MS = 520;

export function getDecelerationTimes(): number[] {
  // Exponentially lengthening intervals create a genuine slot-machine coast.
  const intervals = 52;
  const intervalWeights = Array.from({ length: intervals }, (_, index) => 1.055 ** index);
  const totalWeight = intervalWeights.reduce((sum, weight) => sum + weight, 0);
  let elapsedWeight = 0;
  return intervalWeights.map((weight) => {
    elapsedWeight += weight;
    return Math.round(SPIN_DURATION_MS * elapsedWeight / totalWeight);
  });
}

export function useRoulette(onReveal?: () => void) {
  const [phase, setPhase] = useState<RoulettePhase>('ready');
  const [displayedRoll, setDisplayedRoll] = useState<RollNumber | '25L-0???'>('25L-0???');
  const [spinProgress, setSpinProgress] = useState(0);
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
        setSpinProgress((tick + 1) / times.length);
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
    setSpinProgress(0);
    setDisplayedRoll('25L-0???');
    setPhase('ready');
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { phase, displayedRoll, spinProgress, winner, spin, reset } as const;
}
