import { Section, Callout } from './guide-ui.jsx';
import { DIMENSIONS, DIM_META, VOIES } from '../../ros-model.js';

function Ligne({ gauche, droite }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '4px 0', fontSize: 13, borderBottom: '1px dashed var(--border)',
    }}>
      <span style={{ color: 'var(--text2)' }}>{gauche}</span>
      <span style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{droite}</span>
    </div>
  );
}

function Bareme({ voie }) {
  if (voie.kind === 'cat') {
    return voie.bands.map(b => <Ligne key={b.key} gauche={b.label} droite={b.score} />);
  }
  return voie.steps.map((s, i) => (
    <Ligne key={i}
      gauche={voie.dir === 'lower'
        ? (s.threshold === Infinity ? 'au-delà' : `< ${s.threshold}`)
        : `≥ ${s.threshold}`}
      droite={s.score} />
  ));
}

function Registres({ voie }) {
  return (
    <>
      {voie.source && <Callout tone="var(--blue)" title="Norme">{voie.source}</Callout>}
      {voie.convention && <Callout tone="var(--orange)" title="Convention du référentiel">{voie.convention}</Callout>}
    </>
  );
}

function VoieCard({ voie, color }) {
  return (
    <div style={{
      border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8,
      padding: '12px 14px',
      marginBottom: 12,
      background: 'var(--bg3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 12, color, fontWeight: 700 }}>{voie.code}</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{voie.label}</span>
      </div>
      <div style={{ marginBottom: 10 }}>
        <Bareme voie={voie} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, margin: '0 0 4px' }}>{voie.justification}</p>
      <Registres voie={voie} />
    </div>
  );
}

// Un jury ne reproche pas une convention explicitée ; il démolit une convention déguisée
// en norme. D'où l'obligation de distinguer visuellement les deux registres (spec §4bis) :
// tout palier vient soit d'un texte opposable (Norme, ton bleu), soit d'un arbitrage assumé
// du référentiel (Convention, ton orange) — jamais l'un présenté comme l'autre.
export default function GuideReferentiel() {
  return (
    <div>
      {DIMENSIONS.map(d => (
        <Section key={d} title={DIM_META[d].long}>
          {VOIES.filter(v => v.dim === d).map(v => (
            <VoieCard key={v.id} voie={v} color={DIM_META[d].color} />
          ))}
        </Section>
      ))}
    </div>
  );
}
