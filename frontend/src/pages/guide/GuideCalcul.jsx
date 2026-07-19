import { Section, Callout, Step } from './guide-ui.jsx';
import { aggregate, governanceCoef } from '../../ros-engine.js';
import { LEVELS, RULES, K_VALUES } from '../../ros-model.js';

// Affichage : jamais un résultat écrit en dur, toujours la sortie de aggregate()/governanceCoef() arrondie.
const fmt2 = x => (x === null || x === undefined ? '—' : Math.round(x * 100) / 100);

// Deux profils illustratifs (voies fictives, pour la démo pédagogique) : mêmes 4 notes
// en moyenne linéaire, réparties différemment. Le résultat, lui, n'est jamais tapé —
// il sort de aggregate().
const REGULIER = [60, 60, 60, 60];
const IRREGULIER = [90, 90, 20, 40];

const moyenneCommune = aggregate(REGULIER, 'linear', 1); // = aggregate(IRREGULIER, 'linear', 1)
const titreReg = aggregate(REGULIER, 'penalized', 1);
const titreIrr = aggregate(IRREGULIER, 'penalized', 1);

const RULE_LABELS = { linear: 'linéaire', geometric: 'géométrique', penalized: 'pénalisée' };

const COMPARATIF = [
  ['linéaire', aggregate(IRREGULIER, 'linear', 1)],
  ['géométrique', aggregate(IRREGULIER, 'geometric', 1)],
  ['pénalisée k=1', aggregate(IRREGULIER, 'penalized', 1)],
  ['pénalisée k=2', aggregate(IRREGULIER, 'penalized', 2)],
  ['pénalisée k=3', aggregate(IRREGULIER, 'penalized', 3)],
];

// Table de gouvernance dérivée : 0 à 3 critères absents, coefficient recalculé à chaque fois.
const CAS_GOUV = [0, 1, 2, 3].map(absents => {
  const g = {
    croReporting: absents < 1,
    vetoFormalized: absents < 2,
    vetoExercised: absents < 3,
  };
  return { absents, coef: governanceCoef(g) };
});

// Paliers d'interprétation : dérivés de LEVELS, aucune table écrite à la main.
const PALIERS = LEVELS.map(l => ({
  borne: l.max === Infinity ? '≥ dernier seuil' : `< ${l.max}`,
  label: l.label,
  color: l.color,
  cls: l.cls,
  verdict: l.verdict,
}));

// Les règles hors « pénalisée » servent de test de robustesse (dérivé de RULES, pas écrit en dur).
const REGLES_ROBUSTESSE = RULES.filter(r => r !== 'penalized').map(r => RULE_LABELS[r]).join(' et ');

function Table({ children }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8, marginBottom: 8 }}>
      {children}
    </table>
  );
}

function Th({ children }) {
  return <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text2)' }}>{children}</th>;
}

function Td({ children, mono }) {
  return (
    <td style={{ padding: '6px 8px', color: 'var(--text2)', fontFamily: mono ? 'Space Mono' : undefined }}>
      {children}
    </td>
  );
}

export default function GuideCalcul() {
  return (
    <div>
      <Section title="On ne compense pas">
        <Step n={1} title="Une agrégation à deux niveaux">
          Le score se construit en deux étapes : les Voies renseignées se combinent d'abord au niveau de leur dimension,
          puis les scores de dimension se combinent à leur tour en un score global — toujours à poids égaux, jamais
          pondérés à la main. À chaque étage, la règle d'agrégation choisie peut refuser de faire la moyenne d'une
          faiblesse et d'une force : c'est le principe de non-compensation. Une Voie effondrée ne se dilue pas dans un
          ensemble par ailleurs correct ; elle pèse sur le résultat à hauteur de son écart au reste du groupe.
        </Step>
      </Section>

      <Section title="Exemple chiffré — deux profils, une seule différence : la régularité">
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 12 }}>
          Deux profils fictifs à quatre Voies partagent la même moyenne linéaire : <strong>{fmt2(moyenneCommune)}</strong>.
          Le premier est régulier (les quatre Voies sont notées pareil) ; le second est irrégulier (deux Voies fortes,
          deux Voies faibles). En moyenne simple, les deux profils sont indiscernables. Sous la règle retenue pour le
          titre — pénalisée, k=1 — ils ne le sont plus :
        </p>
        <Table>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <Th>Profil</Th>
              <Th>Voies</Th>
              <Th>Moyenne linéaire</Th>
              <Th>Score pénalisé (titre, k=1)</Th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <Td>Régulier</Td>
              <Td mono>{REGULIER.join(' / ')}</Td>
              <Td mono>{fmt2(moyenneCommune)}</Td>
              <Td mono>{fmt2(titreReg)}</Td>
            </tr>
            <tr>
              <Td>Irrégulier</Td>
              <Td mono>{IRREGULIER.join(' / ')}</Td>
              <Td mono>{fmt2(moyenneCommune)}</Td>
              <Td mono>{fmt2(titreIrr)}</Td>
            </tr>
          </tbody>
        </Table>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 4 }}>
          Le profil irrégulier s'effondre alors que sa moyenne est strictement identique à celle du profil régulier —
          c'est la non-compensation qui parle : une hétérogénéité forte entre Voies pénalise le score, même à moyenne
          constante.
        </p>
        <Callout tone="var(--blue)" title="Comparatif des règles, sur le profil irrégulier">
          <Table>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <Th>Règle</Th>
                <Th>Score</Th>
              </tr>
            </thead>
            <tbody>
              {COMPARATIF.map(([nom, v]) => (
                <tr key={nom} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Td>{nom}</Td>
                  <Td mono>{fmt2(v)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          Plus k augmente, plus l'hétérogénéité entre Voies coûte cher au score : la règle pénalisée devient de plus en
          plus sévère envers un profil irrégulier, à moyenne inchangée.
        </Callout>
      </Section>

      <Section title="Gouvernance : un coefficient, pas une Voie">
        <Step n={2} title="Le coefficient de gouvernance">
          Trois critères de gouvernance (reporting du RSSI/CRO, droit de veto formalisé, droit de veto effectivement
          exercé) ne notent aucune Voie : ils modèrent le score global via un coefficient multiplicatif — <em>coef = max(0,7 ; 1 − 0,1 × critères absents)</em>.
          Le plancher à 0,7 borne l'effet : une gouvernance dégradée pèse sur le score final, elle ne peut jamais
          l'effacer.
        </Step>
        <Table>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <Th>Critères absents</Th>
              <Th>Coefficient</Th>
            </tr>
          </thead>
          <tbody>
            {CAS_GOUV.map(({ absents, coef }) => (
              <tr key={absents} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td mono>{absents}</Td>
                <Td mono>{fmt2(coef)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section title="Complétude : la porte du publiable">
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
          Un score n'est publiable que si toutes les Voies applicables au profil de l'entreprise sont renseignées.
          Cette porte n'est pas un calcul supplémentaire : c'est une condition binaire, détaillée dans la section
          « Comment évaluer ». Tant qu'elle n'est pas franchie, le score affiché reste un score de travail — utile
          pour piloter la collecte, mais pas pour être présenté comme définitif.
        </p>
      </Section>

      <Section title="Paliers d'interprétation">
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 8 }}>
          Le score global se lit à travers une échelle de paliers, du plus critique au plus souverain. Chaque palier
          porte un verdict — une phrase qui traduit le chiffre en diagnostic, à reprendre telle quelle dans un rapport.
        </p>
        <Table>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <Th>Score RoS</Th>
              <Th>Niveau</Th>
              <Th>Verdict</Th>
            </tr>
          </thead>
          <tbody>
            {PALIERS.map(p => (
              <tr key={p.label} style={{ borderBottom: '1px solid var(--border)' }}>
                <Td mono>{p.borne}</Td>
                <Td><span className={`badge ${p.cls}`}>{p.label}</span></Td>
                <Td>{p.verdict}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <details style={{ marginTop: 8 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text2)' }}>
          Détail technique
        </summary>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginTop: 10 }}>
          <p>
            La règle pénalisée s'écrit <em>pénalisée = M − k × (σ²/M)</em>, où M est la moyenne et σ² la variance des
            Voies renseignées, k valant tour à tour {K_VALUES.join(', ')}. Le titre affiché ailleurs dans l'application
            retient toujours k=1.
          </p>
          <p>
            Les règles {REGLES_ROBUSTESSE} (dérivées de la même liste de règles que la règle pénalisée) ne servent pas
            au titre : elles offrent un test de robustesse, pour vérifier qu'un score ne tient pas uniquement à la
            mécanique de la pénalisation.
          </p>
          <p>
            Moyenne et variance ne portent que sur les Voies effectivement renseignées : une Voie non couverte
            (cellule vide, donc <code>null</code>) sort du calcul plutôt que d'être comptée comme une note de zéro —
            faute de quoi une donnée manquante serait punie plus durement qu'une donnée mauvaise.
          </p>
        </div>
      </details>
    </div>
  );
}
