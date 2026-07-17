import { useState } from 'react';
import GuideIntro from './guide/GuideIntro.jsx';

const SECTIONS = [
  { id: 'intro', label: '🎯 Introduction', C: GuideIntro },
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
