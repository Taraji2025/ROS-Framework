import { Section, Step, Callout } from './guide-ui.jsx';
import { DIMENSIONS, DIM_META, VOIES, MATURITE, INFLUENCE } from '../../ros-model.js';

// Prose pédagogique (desc/examples) — reprise de l'ancien Guide.jsx (git show b240e6b~1),
// cartes SI/SD/SN/SO uniquement (CI dissoute en V4). Le libellé et la couleur restent
// dérivés de DIM_META : cet objet ne porte que du texte, jamais un fait.
const PROSE = {
  SI: {
    desc: "Mesure le contrôle que l'entreprise exerce sur ses données et ses flux d'information. Elle couvre l'hébergement des données critiques, la capacité à sortir d'un fournisseur cloud (réversibilité), le chiffrement, et la vitesse de détection des fuites.",
    examples: "Données clients hébergées en France vs. chez un hyperscaler américain soumis au Cloud Act. Capacité à changer de prestataire cloud en moins de 6 mois. Politique de classification des informations sensibles.",
  },
  SD: {
    desc: "Évalue la liberté réelle de l'entreprise dans ses prises de décision stratégiques. Sont notamment examinés : la présence de clauses contractuelles qui contraignent les choix, la dépendance à des partenaires uniques, l'indépendance du conseil d'administration.",
    examples: "Contrats avec des clauses de droit américain (FCPA, CLOUD Act). Administrateurs indépendants vs. représentants d'actionnaires étrangers. Existence de scénarios alternatifs documentés en cas de rupture fournisseur.",
  },
  SN: {
    desc: "Mesure la capacité de l'entreprise à peser sur les règles qui régissent son secteur (normes, réglementations, standards) plutôt que de les subir passivement. Inclut la veille réglementaire proactive et la gestion du risque de sanctions extraterritoriales.",
    examples: "Siège actif dans un comité de normalisation ISO ou ETSI. Anticipation de la réglementation IA de l'UE avant sa mise en vigueur. Absence de sanctions OFAC ou de mises en demeure réglementaires.",
  },
  SO: {
    desc: "Analyse la résilience des opérations face aux ruptures : diversification des fournisseurs, capacité de fonctionnement en mode dégradé, autonomie énergétique, et localisation des actifs critiques.",
    examples: "Plan de continuité d'activité testé et à jour. Stocks stratégiques couvrant 72h d'autonomie. Fournisseurs critiques avec alternatives qualifiées identifiées. Serveurs localisés en zones non-extraterritoriales.",
  },
};

function DimCard({ code }) {
  const { long, color } = DIM_META[code];
  const { desc, examples } = PROSE[code];
  return (
    <div style={{
      border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8,
      padding: '12px 14px',
      marginBottom: 12,
      background: 'var(--bg3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 12, color, fontWeight: 700 }}>{code}</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{long}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, margin: '0 0 8px' }}>{desc}</p>
      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
        <strong style={{ color: 'var(--text2)' }}>Exemples concrets :</strong> {examples}
      </div>
    </div>
  );
}

// Comptages dérivés — jamais un chiffre écrit en dur.
const FAMILLES = [
  { nom: 'Voies',     role: 'Produisent le score',                       n: VOIES.length },
  { nom: 'Maturité',  role: 'Lecture « capacité à voir » — hors score',   n: MATURITE.length },
  { nom: 'Influence', role: 'Lecture « capacité à peser » — hors score',  n: INFLUENCE.length },
];

export default function GuideModele() {
  return (
    <div>
      <Section title="Les dimensions de la souveraineté">
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 16 }}>
          Chaque dimension mesure une facette de l'autonomie stratégique. Elles sont complémentaires : une entreprise
          peut être très souveraine sur une dimension et totalement exposée sur une autre.
        </p>
        {DIMENSIONS.map(d => <DimCard key={d} code={d} />)}
      </Section>

      <Section title="Trois familles, jamais additionnées">
        <Step n={1} title="Pourquoi les familles ne se mélangent jamais">
          Seule la famille <strong style={{ color: 'var(--text)' }}>Voies</strong> produit le score : elle mesure des faits vérifiables et sourcés.
          Les familles <strong style={{ color: 'var(--text)' }}>Maturité</strong> et <strong style={{ color: 'var(--text)' }}>Influence</strong> sont
          des lectures complémentaires, volontairement tenues hors score. Mesurer sa capacité à voir n'est pas être souverain : une entreprise peut
          disposer d'une gouvernance mature, de comités et de procédures, sans que cela change d'un iota son exposition réelle. Les mélanger
          permettrait d'acheter du score avec de la maturité déclarative — de compenser une exposition réelle par de la paperasse organisationnelle.
        </Step>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text2)' }}>Famille</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text2)' }}>Rôle</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text2)' }}>Indicateurs</th>
            </tr>
          </thead>
          <tbody>
            {FAMILLES.map(f => (
              <tr key={f.nom} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{f.nom}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text2)' }}>{f.role}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text2)', fontFamily: 'Space Mono' }}>{f.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Callout tone="var(--orange)" title="Un seul score, une seule source">
        Le score RoS ne provient que de la famille Voies. La Maturité et l'Influence enrichissent le diagnostic dans le rapport, mais n'entrent
        dans aucun calcul de score — les additionner reviendrait à confondre « avoir les moyens de savoir » avec « être souverain ».
      </Callout>
    </div>
  );
}
