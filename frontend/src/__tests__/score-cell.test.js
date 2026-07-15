import { describe, it, expect } from 'vitest';
import { scoreCell } from '../ros-engine.js';
import { VOIES } from '../ros-model.js';

const voie = id => VOIES.find(v => v.id === id);

describe('scoreCell — categorical', () => {
  it('maps a band key to its score', () => {
    expect(scoreCell(voie('si1'), { band: 'souverain' })).toBe(100);
    expect(scoreCell(voie('si1'), { band: 'us' })).toBe(0);
    expect(scoreCell(voie('so5'), { band: 'concentre' })).toBe(20);
  });
  it('returns null for an unknown or missing band', () => {
    expect(scoreCell(voie('si1'), { band: 'xxx' })).toBeNull();
    expect(scoreCell(voie('si1'), {})).toBeNull();
  });
});

describe('scoreCell — numeric lower-is-better', () => {
  it('si3: <20 -> 100, boundary 20 -> 60, >70 -> 0', () => {
    expect(scoreCell(voie('si3'), { value: 10 })).toBe(100);
    expect(scoreCell(voie('si3'), { value: 20 })).toBe(60); // 20 is NOT < 20
    expect(scoreCell(voie('si3'), { value: 55 })).toBe(30);
    expect(scoreCell(voie('si3'), { value: 90 })).toBe(0);
  });
  it('returns null for non-numeric value', () => {
    expect(scoreCell(voie('si3'), { value: '' })).toBeNull();
    expect(scoreCell(voie('si3'), {})).toBeNull();
  });
});

describe('scoreCell — numeric higher-is-better', () => {
  it('so2: >=60 -> 100, 30-59 -> 60, 15-29 -> 30, <15 -> 0', () => {
    expect(scoreCell(voie('so2'), { value: 90 })).toBe(100);
    expect(scoreCell(voie('so2'), { value: 60 })).toBe(100);
    expect(scoreCell(voie('so2'), { value: 45 })).toBe(60);
    expect(scoreCell(voie('so2'), { value: 20 })).toBe(30);
    expect(scoreCell(voie('so2'), { value: 5 })).toBe(0);
  });
});
