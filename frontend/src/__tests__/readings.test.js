import { describe, it, expect } from 'vitest';
import { computeReadings } from '../ros-engine.js';
import { MATURITE, INFLUENCE } from '../ros-model.js';

describe('reading families model', () => {
  it('maturite has 8, influence has 5 (doublons fusionnes)', () => {
    expect(MATURITE).toHaveLength(8);
    expect(INFLUENCE).toHaveLength(5);
  });
});

describe('computeReadings', () => {
  it('averages qualitative (1-5 -> 0-100) and numeric readings', () => {
    // one qual at 5 -> 100, one qual at 3 -> 50 : mean 75
    const q = MATURITE.filter(i => i.kind === 'qual').slice(0, 2);
    const cells = { [q[0].id]: { value: 5 }, [q[1].id]: { value: 3 } };
    const r = computeReadings(cells);
    expect(r.maturite.filled).toBe(2);
    expect(r.maturite.score).toBeCloseTo(75, 5);
  });

  it('empty -> null score, 0 coverage', () => {
    const r = computeReadings({});
    expect(r.maturite.score).toBeNull();
    expect(r.maturite.coverage).toBe(0);
    expect(r.influence.score).toBeNull();
  });
});
