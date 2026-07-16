import { describe, it, expect } from 'vitest';
import { aggregate } from '../ros-engine.js';

describe('aggregate — null handling', () => {
  it('ignores nulls, returns null when nothing valid', () => {
    expect(aggregate([null, 80, null], 'linear')).toBe(80);
    expect(aggregate([null, null], 'linear')).toBeNull();
    expect(aggregate([], 'penalized')).toBeNull();
  });
});

describe('aggregate — linear', () => {
  it('is the mean', () => {
    expect(aggregate([0, 80, 80, 80], 'linear')).toBe(60);
  });
});

describe('aggregate — geometric (annihilates)', () => {
  it('a single 0 drives the result to 0', () => {
    expect(aggregate([0, 80, 80], 'geometric')).toBe(0);
    expect(aggregate([0, 80, 80, 80], 'geometric')).toBe(0);
  });
  it('geometric mean of positives', () => {
    expect(aggregate([40, 90], 'geometric')).toBeCloseTo(60, 5); // sqrt(3600)
  });
});

describe('aggregate — penalized Mazziotta-Pareto', () => {
  it('[0,80,80,80] k=1 -> 40 (population std)', () => {
    // M=60, var=1200, S^2/M=20, 60-20=40
    expect(aggregate([0, 80, 80, 80], 'penalized', 1)).toBeCloseTo(40, 5);
  });
  it('k scales the penalty: k=2 -> 20, k=3 -> 0', () => {
    expect(aggregate([0, 80, 80, 80], 'penalized', 2)).toBeCloseTo(20, 5);
    expect(aggregate([0, 80, 80, 80], 'penalized', 3)).toBeCloseTo(0, 5);
  });
  it('equal values -> no penalty (mean)', () => {
    expect(aggregate([70, 70, 70], 'penalized', 1)).toBeCloseTo(70, 5);
  });
  it('clamps to [0,100] and handles M=0', () => {
    expect(aggregate([0, 0, 0], 'penalized', 1)).toBe(0);
  });
});
