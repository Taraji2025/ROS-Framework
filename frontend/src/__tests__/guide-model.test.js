import { describe, it, expect } from 'vitest';
import { VOIES } from '../ros-model.js';

const nonEmpty = s => typeof s === 'string' && s.trim() !== '';

describe('verrou référentiel — toute voie porte son pourquoi', () => {
  it('chaque voie a une justification non vide', () => {
    const manquantes = VOIES.filter(v => !nonEmpty(v.justification)).map(v => v.code);
    expect(manquantes).toEqual([]);
  });

  it('chaque voie a au moins un registre : source ou convention', () => {
    const sansRegistre = VOIES.filter(v => !nonEmpty(v.source) && !nonEmpty(v.convention)).map(v => v.code);
    expect(sansRegistre).toEqual([]);
  });
});

describe('verrou cohérence de rendu — GuideReferentiel peut rendre chaque barème', () => {
  it('toute voie cat a des bands non vides', () => {
    const ko = VOIES.filter(v => v.kind === 'cat' && !(Array.isArray(v.bands) && v.bands.length > 0)).map(v => v.code);
    expect(ko).toEqual([]);
  });

  it('toute voie num a des steps non vides et un dir valide', () => {
    const ko = VOIES.filter(v => v.kind === 'num' &&
      !(Array.isArray(v.steps) && v.steps.length > 0 && ['lower', 'higher'].includes(v.dir))).map(v => v.code);
    expect(ko).toEqual([]);
  });
});
