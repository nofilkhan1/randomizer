import { describe, expect, it } from 'vitest';
import { ALL_ROLLS, ELIGIBLE_PERFORMERS } from '../data/rolls';
import { selectDecoy, selectWinner } from './selection';

describe('roll call data', () => {
  it('contains exactly 46 unique roll numbers', () => {
    expect(ALL_ROLLS).toHaveLength(46);
    expect(new Set(ALL_ROLLS).size).toBe(46);
  });

  it('includes every eligible performer in the class roster', () => {
    for (const performer of ELIGIBLE_PERFORMERS) expect(ALL_ROLLS).toContain(performer);
  });
});

describe('winner selection', () => {
  it('never selects outside the eligible pool over 10,000 spins', () => {
    let seed = 0x12345678;
    const random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 0x1_0000_0000;
    };

    for (let spin = 0; spin < 10_000; spin += 1) {
      expect(ELIGIBLE_PERFORMERS).toContain(selectWinner(random));
    }
  });

  it('can select each of the three performers', () => {
    const buckets = [0, 1 / 3, 2 / 3];
    expect(buckets.map((sample) => selectWinner(() => sample))).toEqual([...ELIGIBLE_PERFORMERS]);
  });

  it('assigns an equal-width share of the random range to every performer', () => {
    const samples = 12_000;
    const counts = new Map(ELIGIBLE_PERFORMERS.map((performer) => [performer, 0]));

    for (let sample = 0; sample < samples; sample += 1) {
      const winner = selectWinner(() => (sample + 0.5) / samples);
      counts.set(winner, (counts.get(winner) ?? 0) + 1);
    }

    expect([...counts.values()]).toEqual([4_000, 4_000, 4_000]);
  });

  it('rejects an invalid random source instead of producing an unsafe result', () => {
    expect(() => selectWinner(() => 1)).toThrow(RangeError);
    expect(() => selectWinner(() => Number.NaN)).toThrow(RangeError);
  });

  it('keeps animation decoys within the visible 46-roll class roster', () => {
    expect(selectDecoy(() => 0)).toBe(ALL_ROLLS[0]);
    expect(selectDecoy(() => 0.999999)).toBe(ALL_ROLLS[45]);
  });
});
