import { describe, it, expect } from 'vitest';
import { VOIES, DIMENSIONS, PROFILES, RULES, K_VALUES } from '../ros-model.js';

describe('ros-model VOIES', () => {
  it('has exactly 11 voies', () => {
    expect(VOIES).toHaveLength(11);
  });

  it('dimension repartition is SI3 SD2 SN2 SO4', () => {
    const count = d => VOIES.filter(v => v.dim === d).length;
    expect(count('SI')).toBe(3);
    expect(count('SD')).toBe(2);
    expect(count('SN')).toBe(2);
    expect(count('SO')).toBe(4);
  });

  it('every voie has a valid scoring definition', () => {
    for (const v of VOIES) {
      expect(typeof v.id).toBe('string');
      expect(['cat', 'num']).toContain(v.kind);
      if (v.kind === 'cat') {
        expect(Array.isArray(v.bands)).toBe(true);
        expect(v.bands.length).toBeGreaterThan(1);
        for (const b of v.bands) expect(b.score).toBeGreaterThanOrEqual(0);
      } else {
        expect(['lower', 'higher']).toContain(v.dir);
        expect(Array.isArray(v.steps)).toBe(true);
      }
    }
  });
});

describe('ros-model PROFILES', () => {
  it('has the 5 profiles, each listing applicable voie ids', () => {
    for (const p of ['standard', 'banque', 'industrie', 'tech', 'energie']) {
      expect(PROFILES[p]).toBeDefined();
      expect(Array.isArray(PROFILES[p].applicable)).toBe(true);
    }
  });

  // B.2 (notice du 27/07) : SO-4 réintégrée au profil tech. Le test d'applicabilité
  // OVHcloud a montré que l'étiquette « tech » couvre aussi les opérateurs
  // d'infrastructure, pour qui l'autonomie énergétique est une voie pleinement
  // pertinente. Seule SO-2 (stocks stratégiques) reste exclue.
  it('tech excludes SO-2 only (so4 applicable) ; banque excludes SO-2 only', () => {
    expect(PROFILES.tech.applicable).not.toContain('so2');
    expect(PROFILES.tech.applicable).toContain('so4');
    expect(PROFILES.banque.applicable).not.toContain('so2');
    expect(PROFILES.banque.applicable).toContain('so4');
  });

  it('standard applies all 11 voies', () => {
    expect(PROFILES.standard.applicable).toHaveLength(11);
  });

  // B.7 (notice du 27/07) : garantie mécanique, pas discipline. Un profil qui exclut
  // une voie sans le justifier est une pondération sectorielle déguisée — or la V4 a
  // supprimé les pondérations sectorielles. Le verrou rend l'oubli impossible.
  it('chaque profil porte une justification non vide', () => {
    const sansJustif = Object.entries(PROFILES)
      .filter(([, p]) => typeof p.justification !== 'string' || p.justification.trim() === '')
      .map(([nom]) => nom);
    expect(sansJustif).toEqual([]);
  });

  it('toute voie exclue par un profil est nommée dans sa justification', () => {
    const CODE_PAR_ID = Object.fromEntries(VOIES.map(v => [v.id, v.code]));
    const manquants = [];
    for (const [nom, p] of Object.entries(PROFILES)) {
      const exclues = VOIES.filter(v => !p.applicable.includes(v.id));
      for (const v of exclues) {
        if (!p.justification.includes(v.code)) manquants.push(`${nom}/${CODE_PAR_ID[v.id]}`);
      }
    }
    expect(manquants).toEqual([]);
  });

  it('exposes RULES and K_VALUES', () => {
    expect(RULES).toEqual(['linear', 'geometric', 'penalized']);
    expect(K_VALUES).toEqual([1, 2, 3]);
  });
});
