import { describe, it, expect } from 'vitest';
import { governanceCoef, computeGlobal } from '../ros-engine.js';

describe('governanceCoef', () => {
  it('all present -> 1.0', () => {
    expect(governanceCoef({ croReporting: true, vetoFormalized: true, vetoExercised: true })).toBe(1.0);
  });
  it('one absent -> 0.9, two -> 0.8, three -> 0.7 floor', () => {
    expect(governanceCoef({ croReporting: true, vetoFormalized: true, vetoExercised: false })).toBeCloseTo(0.9, 5);
    expect(governanceCoef({ croReporting: true, vetoFormalized: false, vetoExercised: false })).toBeCloseTo(0.8, 5);
    expect(governanceCoef({ croReporting: false, vetoFormalized: false, vetoExercised: false })).toBeCloseTo(0.7, 5);
  });
});

describe('computeGlobal — equal weights + governance multiplier', () => {
  it('applies the governance coefficient to the raw score', () => {
    // All dims present and equal -> raw ~ that value ; coef 0.9 -> final = raw*0.9
    const cells = {
      si1: { band: 'souverain' }, si2: { band: 'contractuelle' }, si3: { value: 10 },
      sd3: { value: 5 }, sd4: { band: 'aucune' },
      sn2: { band: 'comites' }, sn5: { value: 0 },
      so1: { band: 'diversifie' }, so2: { value: 90 }, so4: { band: 'documentee' }, so5: { band: 'disperse-souverain' },
    };
    const gov = { croReporting: true, vetoFormalized: true, vetoExercised: false }; // 0.9
    const r = computeGlobal(cells, 'standard', gov, 'penalized', 1);
    expect(r.coef).toBeCloseTo(0.9, 5);
    expect(r.raw).toBeGreaterThan(90); // all voies near 100
    expect(r.final).toBeCloseTo(r.raw * 0.9, 5);
    expect(r.dims.SI.score).not.toBeNull();
  });

  it('returns null raw/final when no dimension has data', () => {
    const r = computeGlobal({}, 'standard', {}, 'linear', 1);
    expect(r.raw).toBeNull();
    expect(r.final).toBeNull();
  });
});
