import { useState } from 'react';
import GuideIntro from './guide/GuideIntro.jsx';
import GuideWorkflow from './guide/GuideWorkflow.jsx';
import GuideModele from './guide/GuideModele.jsx';
import GuideReferentiel from './guide/GuideReferentiel.jsx';
import GuideCalcul from './guide/GuideCalcul.jsx';
import GuideGlossaire from './guide/GuideGlossaire.jsx';

const SECTIONS = [
  { id: 'intro', label: '🎯 Introduction', C: GuideIntro },
  { id: 'workflow', label: '📋 Comment évaluer', C: GuideWorkflow },
  { id: 'modele', label: '🧭 Le modèle V4', C: GuideModele },
  { id: 'referentiel', label: '📊 Le référentiel', C: GuideReferentiel },
  { id: 'calcul', label: '⚙ Le calcul', C: GuideCalcul },
  { id: 'glossaire', label: '📖 Glossaire', C: GuideGlossaire },
];

export default function Guide() {
  const [active, setActive] = useState('intro');
  const Current = (SECTIONS.find(s => s.id === active) ?? SECTIONS[0]).C;
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Guide utilisateur</div>
          <div className="page-sub">Return on Sovereignty — Manuel de référence</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={active === s.id ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ fontSize: 12, padding: '6px 14px' }}>{s.label}</button>
        ))}
      </div>
      <Current />
    </div>
  );
}
