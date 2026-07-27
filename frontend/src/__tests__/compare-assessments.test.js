import { describe, it, expect } from 'vitest';
import { comparableAssessments } from '../ros-engine.js';

// Constat du 27/07 : le Dashboard traçait Credit Suisse (28/02/2021), Lafarge
// (30/06/2014) et deux évaluations de test sur un MÊME axe de temps, reliés par
// des courbes — comme si une entité avait évolué. Ce sont deux entreprises
// différentes à deux dates historiques. La lecture « trajectoire » est fausse.
// On compare des cas ; on ne les met pas en série temporelle.
describe('comparableAssessments — ce qui est comparable, et ce qui ne l’est pas', () => {
  const v4a = { id: 'a', period: 'Credit Suisse · 28/02/2021', cells: { sd3: { value: '20' } }, scores: { ros: 27 } };
  const v4b = { id: 'b', period: 'Lafarge · 30/06/2014', cells: { sd3: { value: '35' } }, scores: { ros: 40 } };
  const v3a = { id: 'c', period: 'T4 2025', scores: { ros: 23 } };
  const v3b = { id: 'd', period: 'T1 2026', cells: {}, scores: { ros: 23 } };

  it('retient les évaluations codées en v4 (celles qui portent des cellules)', () => {
    const { retenues } = comparableAssessments([v4a, v3a, v4b, v3b]);
    expect(retenues.map(a => a.id)).toEqual(['a', 'b']);
  });

  it('écarte les évaluations antérieures au modèle v4, sans les perdre', () => {
    const { exclues } = comparableAssessments([v4a, v3a, v4b, v3b]);
    expect(exclues.map(a => a.id)).toEqual(['c', 'd']);
  });

  it('ne perd ni n’invente aucune évaluation', () => {
    const entree = [v4a, v3a, v4b, v3b];
    const { retenues, exclues } = comparableAssessments(entree);
    expect(retenues.length + exclues.length).toBe(entree.length);
  });

  it('liste vide ou absente : deux listes vides, jamais une exception', () => {
    expect(comparableAssessments([])).toEqual({ retenues: [], exclues: [] });
    expect(comparableAssessments()).toEqual({ retenues: [], exclues: [] });
  });
});
