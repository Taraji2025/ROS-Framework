import { describe, it, expect } from 'vitest';
import { computeAssessment, rosLevel } from '../ros-engine.js';

const FULL = {
  sector: 'standard',
  governance: { croReporting: true, vetoFormalized: true, vetoExercised: true },
  cells: {
    si1: { band: 'souverain' }, si2: { band: 'contractuelle' }, si3: { value: 10 },
    sd3: { value: 5 }, sd4: { band: 'aucune' },
    sn2: { band: 'comites' }, sn5: { value: 0 },
    so1: { band: 'diversifie' }, so2: { value: 90 }, so4: { band: 'documentee' }, so5: { band: 'disperse-souverain' },
  },
};

describe('rosLevel', () => {
  it('bands the score', () => {
    expect(rosLevel(20).label).toMatch(/Critique/);
    expect(rosLevel(90).label).toMatch(/Souverain/);
    expect(rosLevel(null).label).toMatch(/Aucune/);
  });
});

describe('computeAssessment', () => {
  it('headline is penalized k=1 final and is high for a strong profile', () => {
    const r = computeAssessment(FULL);
    expect(r.headline).toBeCloseTo(r.matrix.penalized[1].final, 5);
    expect(r.headline).toBeGreaterThan(90);
    expect(r.coef).toBe(1.0);
  });

  it('produces a full 3x3 rule×k matrix', () => {
    const r = computeAssessment(FULL);
    for (const rule of ['linear', 'geometric', 'penalized']) {
      for (const k of [1, 2, 3]) {
        expect(typeof r.matrix[rule][k].final).toBe('number');
      }
    }
  });

  it('a single open voie collapses the geometric score to 0', () => {
    const holed = { ...FULL, cells: { ...FULL.cells, si1: { band: 'us' } } }; // si1 -> 0
    const r = computeAssessment(holed);
    expect(r.matrix.geometric[1].final).toBe(0);      // annihilation
    expect(r.matrix.penalized[1].final).toBeGreaterThan(0); // degrade par degres
    expect(r.matrix.penalized[1].final).toBeLessThan(r.headline + 1);
  });

  it('reports coverage per dimension', () => {
    const partial = { ...FULL, cells: { si1: { band: 'souverain' } } };
    const r = computeAssessment(partial);
    expect(r.coverageByDim.SI).toBeCloseTo(1 / 3, 5);
    expect(r.coverageByDim.SD).toBe(0);
  });
});
