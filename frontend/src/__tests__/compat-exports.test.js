import { describe, it, expect } from 'vitest';
import { fmt, SECTORS } from '../ros-engine.js';
import { VOIES } from '../ros-model.js';

describe('compat exports', () => {
  it('fmt arrondit ou rend un tiret', () => {
    expect(fmt(42.6)).toBe(43);
    expect(fmt(null)).toBe('—');
    expect(fmt(undefined)).toBe('—');
  });
  it('SECTORS liste les profils', () => {
    expect(SECTORS).toEqual(['standard', 'banque', 'industrie', 'tech', 'energie']);
  });
  it('la justification est optionnelle et documentée sur si1', () => {
    const si1 = VOIES.find(v => v.id === 'si1');
    expect(typeof si1.justification).toBe('string');
  });
});
