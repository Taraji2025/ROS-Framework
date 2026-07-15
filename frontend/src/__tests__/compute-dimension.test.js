import { describe, it, expect } from 'vitest';
import { computeDimension } from '../ros-engine.js';

describe('computeDimension', () => {
  it('SI with one voie at 0 (penalized) drops the dimension below the mean', () => {
    // SI = si1, si2, si3 ; scores 0, 80, 80 (si1=us->0, si2=multi->50? use bands)
    const cells = { si1: { band: 'us' }, si2: { band: 'contractuelle' }, si3: { value: 10 } };
    // si1=0, si2=100, si3=100 -> mean 66.67 ; penalized < mean
    const r = computeDimension('SI', cells, 'standard', 'penalized', 1);
    expect(r.applicable).toBe(3);
    expect(r.filled).toBe(3);
    expect(r.coverage).toBeCloseTo(1, 5);
    expect(r.score).toBeLessThan(66.67);
    expect(r.score).toBeGreaterThan(0);
  });

  it('counts coverage from filled/applicable', () => {
    const cells = { si1: { band: 'souverain' } }; // 1 of 3 filled
    const r = computeDimension('SI', cells, 'standard', 'linear', 1);
    expect(r.applicable).toBe(3);
    expect(r.filled).toBe(1);
    expect(r.coverage).toBeCloseTo(1 / 3, 5);
    expect(r.score).toBe(100); // only si1 valid
  });

  it('excludes inapplicable voies (banque has no so2/so4)', () => {
    const r = computeDimension('SO', {}, 'banque', 'linear', 1);
    expect(r.applicable).toBe(2); // so1, so5 only
    expect(r.filled).toBe(0);
    expect(r.score).toBeNull();
  });
});
