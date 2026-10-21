import { ALL_ROLLS, FIXED_WINNER, type RollNumber } from '../data/rolls';

/** Return the scripted show outcome. Roster animation never affects the result. */
export function selectWinner(): typeof FIXED_WINNER {
  return FIXED_WINNER;
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
