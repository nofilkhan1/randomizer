import { ALL_ROLLS, ELIGIBLE_PERFORMERS, type EligiblePerformer, type RollNumber } from '../data/rolls';

/** Choose once at spin start. The bounded index gives each performer the same share. */
export function selectWinner(random: () => number = Math.random): EligiblePerformer {
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError('Random source must return a number in [0, 1).');
  }
  const winner = ELIGIBLE_PERFORMERS[Math.floor(sample * ELIGIBLE_PERFORMERS.length)];
  if (!winner) throw new Error('Eligible performer pool is empty.');
  return winner;
}

/** Pick a visible decoy from the full class roster. It never decides the result. */
export function selectDecoy(random: () => number = Math.random): RollNumber {
  const sample = random();
  if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new RangeError('Random source must return a number in [0, 1).');
  }
  const roll = ALL_ROLLS[Math.floor(sample * ALL_ROLLS.length)];
  if (!roll) throw new Error('Roll roster is empty.');
  return roll;
}
