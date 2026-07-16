import { describe, it, expect } from 'vitest';
import { computeActionPlan } from '../ros-engine.js';

describe('computeActionPlan', () => {
  const cells = {
    si1: { band: 'souverain' }, // 100 -> gap 0
    si2: { band: 'mono' },      // 0   -> gap 100
    si3: { value: '30' },       // 60  -> gap 40
  };
  it('trie par écart au max décroissant', () => {
    const plan = computeActionPlan({ sector: 'standard', cells });
    expect(plan.map(p => p.code)).toEqual(['SI-2', 'SI-3', 'SI-1']);
    expect(plan[0].gap).toBe(100);
  });
  it('ignore les voies non renseignées', () => {
    const plan = computeActionPlan({ sector: 'standard', cells });
    expect(plan.length).toBe(3);
    expect(plan.every(p => Number.isFinite(p.score))).toBe(true);
  });
});
