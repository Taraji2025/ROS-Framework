import { describe, it, expect } from 'vitest';
import { computeReadings } from '../ros-engine.js';
import { MATURITE, INFLUENCE, READING_META } from '../ros-model.js';

const LECTURES = [...MATURITE, ...INFLUENCE];

describe('reading families model', () => {
  it('maturite has 8, influence has 5 (doublons fusionnes) — 13 lectures', () => {
    expect(MATURITE).toHaveLength(8);
    expect(INFLUENCE).toHaveLength(5);
    expect(LECTURES).toHaveLength(13);
  });
});

// B.5 (notice du 27/07, arbitrage Naouphel) : les 5 indicateurs qualitatifs sont
// DÉCLARATIFS, NON NOTÉS. Ils reposent sur du déclaratif interne, invisible en
// source ouverte — leur donner une cote produirait la fausse précision que le
// mémoire dénonce lui-même sous le nom de F11.
describe('B.5 — les qualitatifs sont déclaratifs, non notés', () => {
  it('tout indicateur qual est marqué declaratif et ne porte aucune cible', () => {
    const quals = LECTURES.filter(i => i.kind === 'qual');
    expect(quals).toHaveLength(5);
    for (const q of quals) {
      expect(q.declaratif, `${q.code} devrait être déclaratif`).toBe(true);
      expect(q.target, `${q.code} ne doit porter aucune cible`).toBeUndefined();
    }
  });

  it('un qualitatif rempli ne produit AUCUNE cote et ne compte pas dans la couverture', () => {
    const q = MATURITE.filter(i => i.kind === 'qual').slice(0, 2);
    const r = computeReadings({ [q[0].id]: { value: 5 }, [q[1].id]: { value: 3 } });
    expect(r.maturite.filled).toBe(0);
    expect(r.maturite.score).toBeNull();
  });

  it('la couverture ne porte que sur les lectures notables (3 en maturité, 5 en influence)', () => {
    const r = computeReadings({});
    expect(r.maturite.applicable).toBe(3);
    expect(r.influence.applicable).toBe(5);
  });
});

// B.6 (notice du 27/07) : l'origine de chaque cible est écrite. Aucune cible de
// lecture n'est un seuil juridique — ce sont des arbitrages du référentiel, et ils
// doivent le dire. Le verrou empêche qu'une cible arrive sans son pourquoi.
describe('B.6 — chaque cible de lecture porte son origine', () => {
  it('toute lecture notable a une cible ET une origine non vide', () => {
    const sansOrigine = LECTURES
      .filter(i => !i.declaratif)
      .filter(i => typeof i.target !== 'number' || typeof i.origine !== 'string' || i.origine.trim() === '')
      .map(i => i.code);
    expect(sansOrigine).toEqual([]);
  });

  it('il y a exactement 8 cibles pour 13 lectures', () => {
    expect(LECTURES.filter(i => typeof i.target === 'number')).toHaveLength(8);
  });
});

describe('computeReadings', () => {
  it('moyenne les lectures numériques (valeur/cible × 100, bornée)', () => {
    const num = MATURITE.filter(i => i.kind === 'num').slice(0, 2); // SD-2 cible 100, SD-5 cible 80
    const cells = { [num[0].id]: { value: 50 }, [num[1].id]: { value: 40 } };
    const r = computeReadings(cells);
    expect(r.maturite.filled).toBe(2);
    expect(r.maturite.score).toBeCloseTo(50, 5); // 50/100 -> 50 ; 40/80 -> 50
  });

  it('empty -> null score, 0 coverage', () => {
    const r = computeReadings({});
    expect(r.maturite.score).toBeNull();
    expect(r.maturite.coverage).toBe(0);
    expect(r.influence.score).toBeNull();
  });
});

// Spec V4 §7 (15/07) : la restitution affiche, à côté du score, « Capacité à voir »
// (maturité) et « Capacité à peser » (influence). Un libellé est un FAIT : il vit au
// modèle. Le verrou garantit que chaque famille rendue par computeReadings a son
// libellé — une famille sans libellé disparaîtrait de l'écran sans bruit.
describe('READING_META — libellés des lectures affichées à côté du score', () => {
  it('couvre exactement les familles rendues par computeReadings', () => {
    expect(Object.keys(READING_META).sort()).toEqual(Object.keys(computeReadings({})).sort());
  });
  it('chaque famille porte un libellé et la question à laquelle elle répond', () => {
    for (const meta of Object.values(READING_META)) {
      expect(meta.label).toMatch(/\S/);
      expect(meta.question).toMatch(/\S/);
    }
  });
});
