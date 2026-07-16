import { describe, it, expect } from 'vitest';
import { computeCompleteness } from '../ros-engine.js';

describe('computeCompleteness', () => {
  it('non publiable tant que toutes les voies applicables ne sont pas remplies', () => {
    const c = computeCompleteness({ si1: { band: 'souverain' } }, 'standard');
    expect(c.required).toBe(11);
    expect(c.filled).toBe(1);
    expect(c.isPublishable).toBe(false);
  });
  it('publiable quand les 9 voies applicables (banque) sont remplies', () => {
    const cells = {
      si1: { band: 'ue' }, si2: { band: 'mono' }, si3: { value: '5' },
      sd3: { value: '5' }, sd4: { band: 'aucune' }, sn2: { band: 'comites' },
      sn5: { value: '0' }, so1: { band: 'diversifie' }, so5: { band: 'concentre' },
    };
    const c = computeCompleteness(cells, 'banque');
    expect(c.required).toBe(9);
    expect(c.filled).toBe(9);
    expect(c.isPublishable).toBe(true);
  });
  it('taux de sourçage = part des cellules remplies avec source', () => {
    const cells = { si1: { band: 'ue', source: 'DPA 2025' }, si2: { band: 'mono' } };
    const c = computeCompleteness(cells, 'standard');
    expect(c.filled).toBe(2);
    expect(c.tauxSourcage).toBeCloseTo(0.5);
  });
  it('taux de sourçage 0 si rien de rempli', () => {
    expect(computeCompleteness({}, 'standard').tauxSourcage).toBe(0);
  });
});
