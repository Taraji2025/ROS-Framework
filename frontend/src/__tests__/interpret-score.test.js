import { describe, it, expect } from 'vitest';
import { interpretScore } from '../ros-engine.js';
import { LEVELS } from '../ros-model.js';

describe('LEVELS.verdict', () => {
  it('chaque palier porte une phrase de verdict non vide', () => {
    expect(LEVELS.every(l => typeof l.verdict === 'string' && l.verdict.length > 0)).toBe(true);
  });
});

describe('interpretScore', () => {
  const cells = {
    si1: { band: 'souverain' },  // 100
    si2: { band: 'mono' },       // 0
    si3: { value: '10' },        // 100
    sn2: { band: 'absente' },    // 0
  };
  it('renvoie le verdict du palier du headline', () => {
    const r = interpretScore({ sector: 'standard', governance: {}, cells });
    expect(r.verdict).toBe(r.level.verdict);
    expect(typeof r.verdict).toBe('string');
  });
  it('top3 = meilleures voies, flop3 = pires (voies renseignées seulement)', () => {
    const r = interpretScore({ sector: 'standard', governance: {}, cells });
    expect(r.top3[0].score).toBe(100);
    expect(r.flop3[0].score).toBe(0);
    expect(r.top3.length).toBeLessThanOrEqual(3);
    expect(r.flop3.length).toBeLessThanOrEqual(3);
  });
});
