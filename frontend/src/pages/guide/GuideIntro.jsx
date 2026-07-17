import { Section, Callout } from './guide-ui.jsx';

export default function GuideIntro() {
  return (
    <div>
      <Section title="Qu'est-ce que le Return on Sovereignty ?">
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text2)', marginBottom: 14 }}>
          Le <strong style={{ color: 'var(--text)' }}>Return on Sovereignty (RoS)</strong> est un cadre d'audit stratégique qui mesure le degré
          d'<strong style={{ color: 'var(--text)' }}>autonomie réelle</strong> d'une organisation face aux pressions externes : dépendances
          technologiques, extraterritorialité juridique, vulnérabilités opérationnelles et influence concurrentielle.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text2)', marginBottom: 14 }}>
          Contrairement aux audits classiques qui mesurent la performance financière, le RoS mesure la capacité
          de l'entreprise à <strong style={{ color: 'var(--text)' }}>décider librement, agir sans contrainte imposée</strong> et
          <strong style={{ color: 'var(--text)' }}> protéger ses actifs stratégiques</strong>.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text2)', marginBottom: 14 }}>
          Le score RoS est porté par les <strong style={{ color: 'var(--text)' }}>Voies de souveraineté</strong> seules. La Maturité et
          la Capacité d'Influence sont des <strong style={{ color: 'var(--text)' }}>lectures complémentaires</strong> — elles éclairent
          le diagnostic mais ne s'additionnent pas au score global.
        </p>
        <Callout title="Pourquoi c'est important ?">
          Une entreprise peut être très rentable et pourtant <strong style={{ color: 'var(--text)' }}>totalement exposée</strong> :
          ses données hébergées chez un prestataire étranger, ses décisions contraintes par des contrats extraterritoriaux,
          sa chaîne logistique dépendante d'un seul fournisseur. Le RoS révèle ces vulnérabilités <strong style={{ color: 'var(--text)' }}>avant qu'elles deviennent des crises</strong>.
        </Callout>
      </Section>

      <Section title="À qui s'adresse cet outil ?">
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
          <div>• <strong style={{ color: 'var(--text)' }}>Dirigeants et CODIR</strong> — pour obtenir une vision stratégique consolidée de l'exposition souveraine</div>
          <div>• <strong style={{ color: 'var(--text)' }}>DSI / RSSI</strong> — pour évaluer la dimension informationnelle et les risques cyber/cloud</div>
          <div>• <strong style={{ color: 'var(--text)' }}>Directeurs juridiques</strong> — pour les dimensions normatives et les clauses extraterritoriales</div>
          <div>• <strong style={{ color: 'var(--text)' }}>Directeurs des achats / supply chain</strong> — pour la souveraineté opérationnelle</div>
        </div>
      </Section>

      <Section title="Ce que le score RoS n'est PAS">
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
          <div>✗ Ce n'est <strong style={{ color: 'var(--text)' }}>pas</strong> une certification ou un label — c'est un outil de diagnostic interne</div>
          <div>✗ Ce n'est <strong style={{ color: 'var(--text)' }}>pas</strong> une mesure de performance financière</div>
          <div>✗ Ce n'est <strong style={{ color: 'var(--text)' }}>pas</strong> figé — il évolue avec la stratégie et le contexte géopolitique</div>
          <div>✓ C'est un <strong style={{ color: 'var(--green)' }}>outil de pilotage</strong> qui s'améliore avec des évaluations régulières (recommandé : 1 à 2 fois par an)</div>
        </div>
      </Section>
    </div>
  );
}
