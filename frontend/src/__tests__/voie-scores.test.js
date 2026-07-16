import { describe, it, expect } from 'vitest';
import { voieScores } from '../ros-engine.js';

describe('voieScores', () => {
  it('retourne une entrée par voie applicable, avec score et métadonnées', () => {
    const cells = { si1: { band: 'souverain' }, si3: { value: '10' } };
    const rows = voieScores(cells, 'standard');
    expect(rows.length).toBe(11); // profil standard = 11 voies
    const si1 = rows.find(r => r.id === 'si1');
    expect(si1).toMatchObject({ code: 'SI-1', dim: 'SI', score: 100 });
    expect(si1.label).toBeTypeOf('string');
  });

  it('score null pour une voie non renseignée', () => {
    const rows = voieScores({}, 'standard');
    expect(rows.every(r => r.score === null)).toBe(true);
  });

  it('exclut les voies non applicables au profil (banque: pas so2/so4)', () => {
    const ids = voieScores({}, 'banque').map(r => r.id);
    expect(ids).not.toContain('so2');
    expect(ids).not.toContain('so4');
    expect(ids.length).toBe(9);
  });
});
