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

  it('tech excludes SO-2 and SO-4; banque excludes them too', () => {
    expect(PROFILES.tech.applicable).not.toContain('so2');
    expect(PROFILES.tech.applicable).not.toContain('so4');
    expect(PROFILES.banque.applicable).not.toContain('so2');
    expect(PROFILES.banque.applicable).not.toContain('so4');
  });

  it('standard applies all 11 voies', () => {
    expect(PROFILES.standard.applicable).toHaveLength(11);
  });

  it('exposes RULES and K_VALUES', () => {
    expect(RULES).toEqual(['linear', 'geometric', 'penalized']);
    expect(K_VALUES).toEqual([1, 2, 3]);
  });
});
