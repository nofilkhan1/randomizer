import { describe, expect, it, vi } from 'vitest';
import { ALL_ROLLS, FIXED_WINNER } from '../data/rolls';
import { selectDecoy, selectWinner } from './selection';

describe('roll call data', () => {
  it('contains exactly 46 unique roll numbers', () => {
    expect(ALL_ROLLS).toHaveLength(46);
    expect(new Set(ALL_ROLLS).size).toBe(46);
  });

  it('includes the scripted winner in the class roster', () => {
    expect(ALL_ROLLS).toContain(FIXED_WINNER);
  });
});

describe('winner selection', () => {
  it('returns the fixed winner 10,000 times without using randomness', () => {
    const random = vi.spyOn(Math, 'random');

    for (let spin = 0; spin < 10_000; spin += 1) {
      expect(selectWinner()).toBe('25L-0761');
    }

    expect(random).not.toHaveBeenCalled();
    random.mockRestore();
  });

  it('keeps animation decoys within the visible 46-roll class roster', () => {
    expect(selectDecoy(() => 0)).toBe(ALL_ROLLS[0]);
    expect(selectDecoy(() => 0.999999)).toBe(ALL_ROLLS[45]);
  });
});
